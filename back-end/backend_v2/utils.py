"""
utils.py

Central hub for shared logic.

Contains:
  - Configuration loader
  - Microsoft Entra SSO (MSAL) login and code exchange
  - Microsoft Entra access token validation
  - Route guard dependency
  - Standard response formatters
"""

import os
import re
import configparser
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import msal
import bcrypt
import jwt
from jwt import PyJWKClient

from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse


__all__ = [
    "get_conf",
    "format_response",
    "success_response",
    "unauthorized_response",
    "server_error_response",
    "PASSWORD_RULE",
    "validate_password_strength",
    "hash_password",
    "verify_password",
    "get_current_user_id",
    "make_sso_state",
    "verify_sso_state",
    "get_msal_client_app",
    "get_sso_authorization_url",
    "exchange_code_for_entra_tokens",
    "refresh_entra_access_token",
    "validate_entra_access_token",
]


# ============================================================
# CONFIGURATION
# ============================================================

CONFIG_FILE_PATH = Path(__file__).resolve().parent / "config.ini"

_config = configparser.ConfigParser()

if CONFIG_FILE_PATH.exists():
    _config.read(str(CONFIG_FILE_PATH), encoding="utf-8")


def get_conf(section: str, key: str, fallback: Any = None) -> Any:
    """Read config.ini first, then the environment variable SECTION_KEY."""

    if _config.has_section(section) and _config.has_option(section, key):
        return _config.get(section, key)

    return os.getenv(f"{section}_{key}".upper(), fallback)


# ============================================================
# ENTRA CONFIGURATION
# ============================================================

# Only used to sign the short-lived login "state" (CSRF protection).
# It is NOT used to create access or refresh tokens.
SECRET_KEY = get_conf(
    "jwt", "secret_key",
    fallback="dev-jwt-secret-replace-in-production"
)
ALGORITHM = "HS256"
STATE_EXPIRE_SECONDS = 600

REQUIRED_SCOPE = get_conf("azure_sso", "required_scope", fallback="access_as_user")


def _get_client_id() -> Optional[str]:
    return (
        get_conf("azure_sso", "client_id")
        or get_conf("azure_sso", "entra_client_id")
    )


def _get_tenant_id() -> Optional[str]:
    return (
        get_conf("azure_sso", "tenant_id")
        or get_conf("azure_sso", "entra_tenant_id")
    )


def _get_redirect_uri() -> str:

    redirect_uri = get_conf("azure_sso", "redirect_uri")

    if not redirect_uri:
        raise HTTPException(
            status_code=503,
            detail="SSO is not configured: missing redirect_uri in config.ini"
        )

    return redirect_uri


def _get_scopes() -> list:
    """Scope for YOUR API, so the access token has aud = your API."""

    client_id = _get_client_id()

    if not client_id:
        raise HTTPException(
            status_code=503,
            detail="SSO is not configured: missing client_id in config.ini"
        )

    return [f"api://{client_id}/{REQUIRED_SCOPE}"]


# ============================================================
# STANDARD RESPONSE HELPERS
# ============================================================

def format_response(
    status_code: int,
    success: bool,
    message: Optional[str] = None,
    data: Any = None
) -> dict:

    return {
        "status_code": status_code,
        "success": success,
        "message": message,
        "data": data
    }


def success_response(data: Any = None, message: str = "Success") -> dict:

    return format_response(
        status_code=200, success=True, message=message, data=data
    )


def unauthorized_response(message: str = "Unauthorized") -> JSONResponse:

    return JSONResponse(
        status_code=401,
        content={
            "status_code": 401,
            "success": False,
            "message": message,
            "data": None
        }
    )


def server_error_response(
    message: str = "Internal server error"
) -> JSONResponse:

    return JSONResponse(
        status_code=500,
        content={
            "status_code": 500,
            "success": False,
            "message": message,
            "data": None
        }
    )


# ============================================================
# PASSWORD HELPERS (not used by the Entra flow)
# ============================================================

PASSWORD_RULE = re.compile(
    r"^(?=.*[a-z])"
    r"(?=.*[A-Z])"
    r"(?=.*\d)"
    r"(?=.*[^\w\s]).{8,}$"
)


def validate_password_strength(password: str) -> bool:
    return bool(PASSWORD_RULE.match(password))


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(
            password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


# ============================================================
# SSO STATE (CSRF protection)
# ============================================================

def make_sso_state() -> str:
    """Create a short-lived signed value sent to Entra and checked on return."""

    now = datetime.now(timezone.utc)

    return jwt.encode(
        {
            "typ": "sso_state",
            "iat": now,
            "exp": now + timedelta(seconds=STATE_EXPIRE_SECONDS),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def verify_sso_state(state: str) -> None:

    try:
        payload = jwt.decode(state, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired state")

    if payload.get("typ") != "sso_state":
        raise HTTPException(status_code=400, detail="Invalid state")


# ============================================================
# MSAL CLIENT
# ============================================================

_msal_app = None


def get_msal_client_app():
    """One shared MSAL app for the whole server run, so its token cache
    (which holds the refresh token) is not thrown away between requests."""

    global _msal_app

    if _msal_app is not None:
        return _msal_app

    client_id = _get_client_id()
    tenant_id = _get_tenant_id()
    client_secret = get_conf("azure_sso", "client_secret")

    if not client_id:
        raise HTTPException(
            status_code=503,
            detail="SSO is not configured: missing client_id in config.ini"
        )

    if not tenant_id:
        raise HTTPException(
            status_code=503,
            detail="SSO is not configured: missing tenant_id in config.ini"
        )

    if not client_secret:
        raise HTTPException(
            status_code=503,
            detail="SSO is not configured: missing client_secret in config.ini"
        )

    _msal_app = msal.ConfidentialClientApplication(
        client_id=client_id,
        client_credential=client_secret,
        authority=f"https://login.microsoftonline.com/{tenant_id}",
    )

    return _msal_app


# ============================================================
# LOGIN URL
# ============================================================

def get_sso_authorization_url() -> str:

    return get_msal_client_app().get_authorization_request_url(
        scopes=_get_scopes(),
        state=make_sso_state(),
        redirect_uri=_get_redirect_uri(),
    )


# ============================================================
# EXCHANGE LOGIN CODE FOR ENTRA TOKENS
# ============================================================

def exchange_code_for_entra_tokens(code: str, state: Optional[str] = None) -> dict:

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    if not state:
        raise HTTPException(status_code=400, detail="Missing state")

    verify_sso_state(state)

    app = get_msal_client_app()

    result = app.acquire_token_by_authorization_code(
        code,
        scopes=_get_scopes(),
        redirect_uri=_get_redirect_uri(),
    )

    if "error" in result:
        raise HTTPException(
            status_code=401,
            detail=result.get("error_description", "Entra login failed"),
        )

    # MSAL Python hides the refresh token from the returned result and keeps
    # it in its own token cache, so read it from there.
    claims = result.get("id_token_claims") or {}
    home_account_id = f"{claims.get('oid')}.{claims.get('tid')}"

    refresh_tokens = app.token_cache.find(
        msal.TokenCache.CredentialType.REFRESH_TOKEN,
        query={"home_account_id": home_account_id},
    )

    if not refresh_tokens:
        # Fallback: any refresh token for the account MSAL just cached
        for account in app.get_accounts():
            refresh_tokens = app.token_cache.find(
                msal.TokenCache.CredentialType.REFRESH_TOKEN,
                query={"home_account_id": account.get("home_account_id")},
            )
            if refresh_tokens:
                break

    result["refresh_token"] = (
        refresh_tokens[0]["secret"] if refresh_tokens else None
    )

    return result


# ============================================================
# REFRESH: new Entra access token from a refresh token
# ============================================================

def refresh_entra_access_token(refresh_token: str) -> dict:

    if not refresh_token:
        raise HTTPException(status_code=400, detail="Missing refresh token")

    result = get_msal_client_app().acquire_token_by_refresh_token(
        refresh_token,
        scopes=_get_scopes(),
    )

    if "error" in result:
        raise HTTPException(
            status_code=401,
            detail=result.get("error_description", "Token refresh failed"),
        )

    return result


# ============================================================
# MICROSOFT ENTRA ACCESS TOKEN VALIDATION
# ============================================================

_jwk_client: Optional[PyJWKClient] = None


def validate_entra_access_token(token: str) -> dict:
    """
    Validate an Entra access token issued for THIS API:
    signature (Microsoft public keys), issuer, audience, expiry, scope.
    """

    global _jwk_client

    tenant_id = _get_tenant_id()
    client_id = _get_client_id()

    if not tenant_id or not client_id:
        raise HTTPException(
            status_code=503,
            detail="Entra tenant_id or client_id is not configured"
        )

    if _jwk_client is None:
        _jwk_client = PyJWKClient(
            f"https://login.microsoftonline.com/{tenant_id}/discovery/v2.0/keys",
            cache_keys=True,
        )

    try:
        signing_key = _jwk_client.get_signing_key_from_jwt(token)

        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=[client_id, f"api://{client_id}"],
            issuer=[
                f"https://login.microsoftonline.com/{tenant_id}/v2.0",
                f"https://sts.windows.net/{tenant_id}/",
            ],
            options={"require": ["exp", "aud", "iss"]},
        )

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except jwt.PyJWTError as e:
        # Temporary: shows which check failed (audience, issuer, signature...).
        # Change to detail="Invalid token" once everything works.
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

    scopes = (claims.get("scp") or "").split()

    if REQUIRED_SCOPE not in scopes:
        raise HTTPException(status_code=403, detail="Missing required scope")

    return claims


# ============================================================
# FASTAPI BEARER AUTHENTICATION
# ============================================================

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user_id(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    authorization: Optional[str] = Header(None)
) -> str:

    token = None

    if credentials and credentials.credentials:
        token = credentials.credentials

    elif authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()

    if not token:
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid Bearer authorization token"
        )

    claims = validate_entra_access_token(token)

    user_id = claims.get("oid") or claims.get("sub")

    if not user_id:
        raise HTTPException(status_code=401, detail="User ID missing from token")

    return str(user_id)