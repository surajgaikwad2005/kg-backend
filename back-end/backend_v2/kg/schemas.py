"""
kg/schemas.py

Response helper functions for Knowledge Graph.
"""


def node_response(
    node_id: str,
    labels: list,
    properties: dict = None,
) -> dict:
    """
    Creates a knowledge graph node response.
    """

    return {
        "id": node_id,
        "labels": labels,
        "properties": properties or {},
    }


def relationship_response(
    relationship_id: str,
    relationship_type: str,
    source: str,
    target: str,
    properties: dict = None,
) -> dict:
    """
    Creates a knowledge graph relationship response.
    """

    return {
        "id": relationship_id,
        "type": relationship_type,
        "source": source,
        "target": target,
        "properties": properties or {},
    }


def graph_response(
    nodes: list,
    relationships: list,
) -> dict:
    """
    Creates the complete knowledge graph response.
    """

    return {
        "status_code": 200,
        "nodes": nodes,
        "relationships": relationships,
    }


def node_details_response(
    node_id: str = None,
    node_type: str = None,
    natural_key: str = None,
    properties: dict = None,
    message: str = None,
) -> dict:
    """
    Creates the node details response.
    """

    return {
        "status_code": 200,
        "node_id": node_id,
        "node_type": node_type,
        "natural_key": natural_key,
        "properties": properties or {},
        "message": message,
    }