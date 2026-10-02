from database.connection import get_connection, release_connection


class GraphRepository:

    def __init__(self):
        self.conn = get_connection()

    def close(self):
        if self.conn:
            release_connection(self.conn)
            self.conn = None

    def get_node_by_id(self, node_id):
        """
        Fetch a single node using its unique node_id.
        """

        query = """
            SELECT
                node_id,
                node_type,
                natural_key
            FROM nodes
            WHERE node_id = %s
        """

        with self.conn.cursor() as cur:
            cur.execute(query, (node_id,))
            return cur.fetchone()

    def get_immediate_neighbors(self, node_id):
        """
        Fetch only immediate outgoing neighbors of a node.
        No recursive traversal.
        No deep hierarchy.
        """

        query = """
            SELECT
                e.source_id,
                e.relationship,
                e.target_id,
                n.node_type,
                n.natural_key
            FROM edges e
            JOIN nodes n
                ON n.node_id = e.target_id
            WHERE e.source_id = %s
        """

        with self.conn.cursor() as cur:
            cur.execute(query, (node_id,))
            return cur.fetchall()

    def get_node_properties(self, node_id):
        """
        Fetch all properties associated with a node.
        Useful later for side panel/details view.
        """

        query = """
            SELECT
                property_name,
                value_num,
                value_text,
                value_date
            FROM node_properties
            WHERE node_id = %s
        """

        with self.conn.cursor() as cur:
            cur.execute(query, (node_id,))
            return cur.fetchall()

    def get_nodes_by_ids(self, node_ids):
        """
        Fetch multiple nodes at once.
        Useful for batch graph expansions.
        """
        ids = list(node_ids) if node_ids else []
        if not ids:
            return []

        query = """
            SELECT
                node_id,
                node_type,
                natural_key
            FROM nodes
            WHERE node_id = ANY(%s)
        """

        with self.conn.cursor() as cur:
            cur.execute(query, (ids,))
            return cur.fetchall()



    # checks the node_id in both source and target columns of the edges table and returns all edges connected to that node.

    def get_connected_edges(self, node_id, limit=100):
        """
        Fetch connected edges using indexed UNION ALL query.
        Prioritizes structural child locations (HAS_SUBFLOC) so all sub-locations
        are always included, and sets a default limit of 100 to ensure fast browser rendering.
        """
        if limit:
            query = """
            SELECT source_id, relationship, target_id
            FROM (
                SELECT DISTINCT source_id, relationship, target_id,
                    CASE WHEN relationship = 'HAS_SUBFLOC' THEN 1 ELSE 2 END as prio
                FROM (
                    SELECT source_id, relationship, target_id FROM edges WHERE source_id = %s
                    UNION ALL
                    SELECT source_id, relationship, target_id FROM edges WHERE target_id = %s
                ) sub
                ORDER BY prio
                LIMIT %s
            ) final
            """
            params = (node_id, node_id, limit)
        else:
            query = """
            SELECT DISTINCT
                source_id,
                relationship,
                target_id
            FROM (
                SELECT source_id, relationship, target_id FROM edges WHERE source_id = %s
                UNION ALL
                SELECT source_id, relationship, target_id FROM edges WHERE target_id = %s
            ) sub
            """
            params = (node_id, node_id)

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            return cur.fetchall()


# required to get the details of a node, when we need properties after a node is clicked
    def get_node_details(self, node_id):

        query = """
        SELECT
            node_id,
            node_type,
            natural_key
        FROM nodes
        WHERE node_id = %s
    """

        with self.conn.cursor() as cur:
            cur.execute(query, (node_id,))
            return cur.fetchone()