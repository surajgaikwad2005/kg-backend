"""
auth/main.py

Microsoft Entra ID authentication routes.
"""

from typing import Optional

from fastapi import APIRouter, Body, HTTPException, Query
from utils import refresh_entra_access_token

from auth.utils import (
    get_sso_login_url,
    authenticate_entra_code,
    #authenticate_entra_user,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/login")
def login(redirect: bool = Query(False)):
    """Open the returned login_url in a browser."""
    return get_sso_login_url()


@router.get("/sso/login", include_in_schema=False)
def sso_login():
    return get_sso_login_url()


# Microsoft redirects here after login
@router.get("/callback")
def callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None),
    error_description: Optional[str] = Query(None),
):
    if error:
        raise HTTPException(400, error_description or error)

    return authenticate_entra_code(code, state)

@router.post("/refresh")
def refresh(account_id: str = Body(..., embed=True)):
    result = refresh_entra_access_token(account_id)
    return {
        "status_code": 200,
        "success": True,
        "data": {
            "access_token": result["access_token"],
            "token_type": "bearer",
            "expires_in": result.get("expires_in"),
        },
    }

