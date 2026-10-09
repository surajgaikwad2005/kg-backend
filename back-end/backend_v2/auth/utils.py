"""
auth/utils.py

Microsoft Entra ID authentication logic.
"""

from fastapi import HTTPException

from utils import (
    get_sso_authorization_url,
    get_conf,
    exchange_code_for_entra_claims,
    create_access_token,
    create_refresh_token,
)


# ============================================================
# Generate Microsoft Entra Login URL
# ============================================================

def get_sso_login_url() -> dict:
    """
    Generate Microsoft Entra authorization URL.
    """

    login_url = get_sso_authorization_url()

    return {
        "status_code": 200,
        "success": True,
        "data": {
            "login_url": login_url,
            "redirect_uri": get_conf("azure_sso", "redirect_uri"),
            "scope": ["User.Read"],
            "provider": "microsoft_entra_id",
        },
    }


# ============================================================
# Build FastAPI JWT tokens from Entra claims
# ============================================================

def _issue_api_tokens(claims: dict) -> dict:

    user_id = (
        claims.get("oid")
        or claims.get("sub")
        or claims.get("preferred_username")
    )

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Unable to identify Entra user"
        )

    email = (
        claims.get("preferred_username")
        or claims.get("email")
        or claims.get("upn")
    )

    name = claims.get("name") or email or str(user_id)

    return {
        "status_code": 200,
        "success": True,
        "message": "Authentication successful",
        "data": {
            "user": {
                "id": str(user_id),
                "name": name,
                "email": email,
                "provider": "microsoft_entra_id",
            },
            "access_token": create_access_token(str(user_id)),
            "refresh_token": create_refresh_token(str(user_id)),
            "token_type": "bearer",
        },
    }


# ============================================================
# Login code -> Entra -> FastAPI JWT   (NEW)
# ============================================================

def authenticate_entra_code(code: str, state: str = None) -> dict:
    """
    Exchange the login code for Entra claims,
    then create FastAPI JWT tokens.
    """                                                  

    claims = exchange_code_for_entra_claims(code, state)

    return _issue_api_tokens(claims)


# ============================================================
# Entra access token -> FastAPI JWT
# ============================================================

