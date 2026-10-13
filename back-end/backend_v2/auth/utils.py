"""
auth/utils.py

Microsoft Entra ID authentication logic.
Returns the Entra access token and refresh token.
"""

from utils import (
    get_sso_authorization_url,
    get_conf,
    exchange_code_for_entra_tokens,
    refresh_entra_access_token,
)


def get_sso_login_url() -> dict:

    return {
        "status_code": 200,
        "success": True,
        "data": {
            "login_url": get_sso_authorization_url(),
            "redirect_uri": get_conf("azure_sso", "redirect_uri"),
            "provider": "microsoft_entra_id",
        },
    }


def authenticate_entra_code(code: str, state: str = None) -> dict:

    result = exchange_code_for_entra_tokens(code, state)

    claims = result.get("id_token_claims") or {}
    email = claims.get("preferred_username") or claims.get("email")

    return {
        "status_code": 200,
        "success": True,
        "message": "Authentication successful",
        "data": {
            "user": {
                "id": claims.get("oid") or claims.get("sub"),
                "name": claims.get("name") or email,
                "email": email,
                "provider": "microsoft_entra_id",
            },
            "access_token": result["access_token"],
            "refresh_token": result.get("refresh_token"),
            "token_type": "bearer",
            "expires_in": result.get("expires_in"),
        },
    }


def refresh_entra_tokens(refresh_token: str) -> dict:

    result = refresh_entra_access_token(refresh_token)

    return {
        "status_code": 200,
        "success": True,
        "message": "Token refreshed",
        "data": {
            "access_token": result["access_token"],
            # Entra may rotate the refresh token; keep the newest one
            "refresh_token": result.get("refresh_token") or refresh_token,
            "token_type": "bearer",
            "expires_in": result.get("expires_in"),
        },
    }