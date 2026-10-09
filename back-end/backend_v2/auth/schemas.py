"""
auth/schemas.py

Authentication response helper functions.
"""


def user_profile_response(
    user_id: str,
    email: str = None,
    name: str = None,
    roles: list = None,
    groups: list = None,
    tenant_id: str = None,
    auth_provider: str = None,
) -> dict:
    """
    Create a user profile response.
    """

    return {
        "status_code": 200,
        "user_id": user_id,
        "email": email,
        "name": name,
        "roles": roles,
        "groups": groups,
        "tenant_id": tenant_id,
        "auth_provider": auth_provider,
    }


def auth_token_response(
    access_token: str,
    refresh_token: str = None,
    user: dict = None,
) -> dict:
    """
    Create an authentication token response.
    """

    return {
        "status_code": 200,
        "success": True,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user,
    }