from fastapi import APIRouter, Depends, Query
from services.graph_services import GraphService

router = APIRouter(
    prefix="/graph",
    tags=["Graph"]
)

def get_graph_service():
    service = GraphService()
    try:
        yield service
    finally:
        service.close()


@router.get("/initial")
def get_initial_graph():

    service = GraphService()

    try:
        return service.get_initial_graph("FL:BOKOR")

    finally:
        service.close()


@router.get("/expand")
def expand_node(node_id: str, limit: int | None = None):

    service = GraphService()

    try:
        return service.expand_node(node_id, limit=limit)

    finally:
        service.close()
        

@router.get("/node-details")
def get_node_details(
    node_id: str,
    service: GraphService = Depends(get_graph_service)
):
    return service.get_node_info(node_id)