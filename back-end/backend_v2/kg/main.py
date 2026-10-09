"""
kg/main.py

Knowledge Graph API routes.

Contains only route definitions and clean function calling.
"""

from typing import Optional

from fastapi import APIRouter, Query, Depends

from kg.utils import (
    get_initial_graph,
    expand_node,
    get_node_info,
)

from utils import get_current_user_id

router = APIRouter(
    prefix="/graph",
    tags=["Knowledge Graph"]
)


# ============================================================
# 1. Initial Graph
# ============================================================

@router.get("/initial")
def get_initial(
    node_id: str = Query(
        "FL:BOKOR",
        description="Seed node identifier"
    ),
    user_id: str = Depends(get_current_user_id)
):
    return get_initial_graph(
        node_id=node_id
    )


# ============================================================
# 2. Expand Graph Node
# ============================================================

@router.get("/expand")
def expand(
    node_id: str = Query(
        ...,
        description="Node ID to expand"
    ),
    limit: Optional[int] = Query(
        None,
        description="Max edges to return"
    ),
    user_id: str = Depends(get_current_user_id)
):
    return expand_node(
        node_id=node_id,
        limit=limit
    )


# ============================================================
# 3. Node Details
# ============================================================

@router.get("/node-details")
def get_details(
    node_id: str = Query(
        ...,
        description="Node ID to inspect"
    ),
    user_id: str = Depends(get_current_user_id)
):
    return get_node_info(
        node_id=node_id
    )