"""
kg/utils.py
Core Logic for Knowledge Graph:
  - 3 self-contained functions matching each API endpoint
  - Direct SQL queries with in-memory caching (< 30ms)
  - Pure functions only (no classes)
"""

from typing import Dict, Any, Optional
from db.connection import get_connection, release_connection

# In-memory caches for instant response times
_INITIAL_CACHE: Dict[str, Any] = {}
_EXPAND_CACHE: Dict[tuple, Any] = {}
_NODE_INFO_CACHE: Dict[str, Any] = {}


# ==============================================================================
# Function 1: Seed Graph (Initial View)
# ==============================================================================
def get_initial_graph(node_id: str = "FL:BOKOR") -> dict:
    """Loads seed graph centered around node_id (cached in memory)."""
    if node_id in _INITIAL_CACHE:
        return _INITIAL_CACHE[node_id]

    conn = get_connection()
    try:
        # 1. Fetch immediate child edges and nodes in 1 JOIN query
        with conn.cursor() as cur:
            cur.execute("""
                SELECT e.source_id, e.relationship, e.target_id, n.node_type, n.natural_key
                FROM edges e
                JOIN nodes n ON n.node_id = e.target_id
                WHERE e.source_id = %s
            """, (node_id,))
            rows = cur.fetchall()

        # 2. Add root seed node
        nodes = [{
            "id": node_id,
            "labels": ["FunctionalLocation"],
            "properties": {"name": node_id.replace("FL:", "")}
        }]
        relationships = []
        seen_nodes = {node_id}

        # 3. Add connected neighbor nodes and edges directly
        for src, rel, tgt, node_type, natural_key in rows:
            if tgt not in seen_nodes:
                nodes.append({
                    "id": tgt,
                    "labels": [node_type],
                    "properties": {"name": natural_key}
                })
                seen_nodes.add(tgt)

            relationships.append({
                "id": f"{src}_{tgt}",
                "type": rel,
                "source": src,
                "target": tgt,
                "properties": {}
            })

        result = {
            "status_code": 200,
            "nodes": nodes,
            "relationships": relationships
        }
        _INITIAL_CACHE[node_id] = result
        return result
    finally:
        release_connection(conn)


# ==============================================================================
# Function 2: Expand Graph (Connected Nodes on Click)
# ==============================================================================
def expand_node(node_id: str, limit: Optional[int] = 100) -> dict:
    """Expand a node with both incoming and outgoing relationships."""

    cache_key = (node_id, limit)

    if cache_key in _EXPAND_CACHE:
        return _EXPAND_CACHE[cache_key]

    conn = get_connection()

    try:
        with conn.cursor() as cur:

            # --------------------------------------------------
            # 1. Get incoming + outgoing edges
            # --------------------------------------------------

            query = """
                SELECT DISTINCT
                    source_id,
                    relationship,
                    target_id
                FROM edges
                WHERE source_id = %s
                   OR target_id = %s
            """

            params = [node_id, node_id]

            if limit is not None:
                query += """
                    ORDER BY
                        CASE
                            WHEN relationship = 'HAS_SUBFLOC' THEN 1
                            ELSE 2
                        END,
                        source_id,
                        target_id
                    LIMIT %s
                """
                params.append(limit)

            cur.execute(query, tuple(params))

            edges = cur.fetchall()

            # --------------------------------------------------
            # 2. Find connected node IDs
            # --------------------------------------------------

            connected_ids = set()

            for src, rel, tgt in edges:
                if src != node_id:
                    connected_ids.add(src)

                if tgt != node_id:
                    connected_ids.add(tgt)

            # Include clicked node
            all_ids = list(connected_ids | {node_id})

            # --------------------------------------------------
            # 3. Get node information
            # --------------------------------------------------

            cur.execute(
                """
                SELECT
                    node_id,
                    node_type,
                    natural_key
                FROM nodes
                WHERE node_id = ANY(%s)
                """,
                (all_ids,)
            )

            node_records = cur.fetchall()

        # --------------------------------------------------
        # 4. Create node map
        # --------------------------------------------------

        node_map = {
            row[0]: row
            for row in node_records
        }

        nodes = []

        # Clicked node MUST be first
        if node_id in node_map:

            n = node_map[node_id]

            nodes.append({
                "id": n[0],
                "labels": [n[1]],
                "properties": {
                    "name": n[2]
                }
            })

        # --------------------------------------------------
        # 5. Add connected nodes
        # --------------------------------------------------

        for node_id_connected in connected_ids:

            if node_id_connected in node_map:

                n = node_map[node_id_connected]

                nodes.append({
                    "id": n[0],
                    "labels": [n[1]],
                    "properties": {
                        "name": n[2]
                    }
                })

        # --------------------------------------------------
        # 6. Create relationships
        # --------------------------------------------------

        relationships = []

        for src, rel, tgt in edges:

            relationships.append({
                "id": f"{src}_{tgt}",
                "type": rel,
                "source": src,
                "target": tgt,
                "properties": {}
            })

        result = {
            "status_code": 200,
            "nodes": nodes,
            "relationships": relationships
        }

        _EXPAND_CACHE[cache_key] = result

        return result

    finally:
        release_connection(conn)

# ==============================================================================
# Function 3: Node Properties & Attributes
# ==============================================================================
def get_node_info(node_id: str) -> dict:
    """Loads all attributes/properties for a single node."""

    if node_id in _NODE_INFO_CACHE:
        return _NODE_INFO_CACHE[node_id]

    conn = get_connection()

    try:
        with conn.cursor() as cur:

            # --------------------------------------------------
            # 1. Get node metadata
            # --------------------------------------------------

            cur.execute(
                """
                SELECT
                    node_id,
                    node_type,
                    natural_key
                FROM nodes
                WHERE node_id = %s
                """,
                (node_id,)
            )

            node = cur.fetchone()

            # --------------------------------------------------
            # 2. Node not found
            # --------------------------------------------------

            if not node:

                return {
                    "status_code": 404,
                    "node_id": None,
                    "node_type": None,
                    "natural_key": None,
                    "properties": {},
                    "message": "Node not found"
                }

            # --------------------------------------------------
            # 3. Get properties
            # --------------------------------------------------

            cur.execute(
                """
                SELECT
                    property_name,
                    value_num,
                    value_text,
                    value_date
                FROM node_properties
                WHERE node_id = %s
                """,
                (node_id,)
            )

            properties_rows = cur.fetchall()

        # --------------------------------------------------
        # 4. Convert properties to dictionary
        # --------------------------------------------------

        properties_dict = {}

        for prop_name, val_num, val_text, val_date in properties_rows:

            if val_text is not None:
                properties_dict[prop_name] = val_text

            elif val_num is not None:
                properties_dict[prop_name] = val_num

            elif val_date is not None:
                properties_dict[prop_name] = str(val_date)

            else:
                properties_dict[prop_name] = None

        # --------------------------------------------------
        # 5. Final response
        # --------------------------------------------------

        result = {
            "status_code": 200,
            "node_id": node[0],
            "node_type": node[1],
            "natural_key": node[2],
            "properties": properties_dict,
            "message": None
        }

        _NODE_INFO_CACHE[node_id] = result

        return result

    finally:
        release_connection(conn)