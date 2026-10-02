from repositories.graph_repository import GraphRepository

# In-memory caches to make subsequent graph node clicks instantaneous
_EXPAND_CACHE = {}
_NODE_INFO_CACHE = {}
_INITIAL_CACHE = {}


class GraphService:

    def __init__(self):
        self.repo = GraphRepository()

    def close(self):
        self.repo.close()

    def _format_node(self, node_id, node_type, natural_key):

     return {
        "id": node_id,
        "labels": [node_type],
        "properties": {
            "name": natural_key
        }
    }

    def _format_relationship(
    self,
    source_id,
    relationship,
    target_id
):

     return {
        "id": f"{source_id}_{target_id}",
        "type": relationship,
        "source": source_id,
        "target": target_id,
        "properties": {}
    }

    def explore_node(self, node_id):

        rows = self.repo.get_immediate_neighbors(node_id)

        nodes = []
        relationships = []
        seen_nodes = set()

        # Add the clicked/current node
        nodes.append({
            "id": node_id,
            "labels": ["FunctionalLocation"],
            "properties": {
                "name": node_id.replace("FL:", "")
            }
        })

        seen_nodes.add(node_id)

        for row in rows:

            source_id = row[0]
            relationship = row[1]
            target_id = row[2]
            node_type = row[3]
            natural_key = row[4]

            # Add target node only once
            if target_id not in seen_nodes:
                nodes.append({
                    "id": target_id,
                    "labels": [node_type],
                    "properties": {
                        "name": natural_key
                    }
                })
                seen_nodes.add(target_id)

            # Add relationship
            relationships.append({
                "id": f"{source_id}_{target_id}",
                "type": relationship,
                "source": source_id,
                "target": target_id,
                "properties": {}
            })

        return {
            "nodes": nodes,
            "relationships": relationships
        }

    def get_initial_graph(self, node_id="FL:BOKOR"):
        """
        Initial graph always starts from BOKOR (cached in memory).
        """
        if node_id in _INITIAL_CACHE:
            return _INITIAL_CACHE[node_id]

        result = self.explore_node(node_id)
        _INITIAL_CACHE[node_id] = result
        return result

    def expand_node(self, node_id, limit=100):
        cache_key = (node_id, limit)
        if cache_key in _EXPAND_CACHE:
            return _EXPAND_CACHE[cache_key]

        edges = self.repo.get_connected_edges(node_id, limit=limit)

        # Collect all connected node IDs
        connected_ids = set()
        relationships = []

        for row in edges:
            source_id = row[0]
            relationship = row[1]
            target_id = row[2]

            connected_node = target_id if source_id == node_id else source_id
            connected_ids.add(connected_node)

            relationships.append(
                self._format_relationship(
                    source_id,
                    relationship,
                    target_id
                )
            )

        # Fetch all node details in 1 single batch query instead of an N+1 loop
        all_ids_to_fetch = list(connected_ids | {node_id})
        node_records = self.repo.get_nodes_by_ids(all_ids_to_fetch)
        node_map = {row[0]: row for row in node_records}

        nodes = []
        seen_nodes = set()

        # Add clicked node first if found
        if node_id in node_map:
            n = node_map[node_id]
            nodes.append(self._format_node(n[0], n[1], n[2]))
            seen_nodes.add(node_id)
        else:
            clicked_node = self.repo.get_node_details(node_id)
            if clicked_node:
                nodes.append(self._format_node(clicked_node[0], clicked_node[1], clicked_node[2]))
                seen_nodes.add(node_id)

        # Add connected nodes in batch
        for cid in connected_ids:
            if cid not in seen_nodes and cid in node_map:
                n = node_map[cid]
                nodes.append(self._format_node(n[0], n[1], n[2]))
                seen_nodes.add(cid)

        result = {
            "nodes": nodes,
            "relationships": relationships
        }
        _EXPAND_CACHE[cache_key] = result
        return result

    def get_node_info(self, node_id):
        if node_id in _NODE_INFO_CACHE:
            return _NODE_INFO_CACHE[node_id]

        node = self.repo.get_node_details(node_id)

        if not node:
            return {
                "message": "Node not found"
            }

        properties = self.repo.get_node_properties(node_id)

        properties_dict = {}

        for prop in properties:
            property_name = prop[0]
            value_num = prop[1]
            value_text = prop[2]
            value_date = prop[3]

            if value_text is not None:
                properties_dict[property_name] = value_text
            elif value_num is not None:
                properties_dict[property_name] = value_num
            elif value_date is not None:
                properties_dict[property_name] = str(value_date)
            else:
                properties_dict[property_name] = None

        result = {
            "node_id": node[0],
            "node_type": node[1],
            "natural_key": node[2],
            "properties": properties_dict
        }
        _NODE_INFO_CACHE[node_id] = result
        return result

    

 