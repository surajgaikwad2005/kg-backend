"""
utils.py

Central Hub for shared logic across the project.

Contains:
  - Configuration Loader
  - Microsoft Entra ID / MSAL SSO Logic
  - Password Hashing
  - JWT Token Generation & Verification
  - Microsoft Entra Access Token Validation
  - Route Guard Dependency
  - Standard Response Formatters
"""

import os
import re
import configparser
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Any, Optional, Dict

import msal
import bcrypt
import jwt

from fastapi import Header, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse


# ============================================================
# EXPORTS
# ============================================================

__all__ = [
    "get_conf",

    # Response helpers
    "format_response",
    "success_response",
    "unauthorized_response",
    "server_error_response",

    # Password
    "PASSWORD_RULE",
    "validate_password_strength",
    "hash_password",
    "verify_password",

    # JWT
    "create_access_token",
    "create_refresh_token",
    "decode_token",

    # Authentication dependency
    "get_current_user_id",

    # Entra SSO
    "make_sso_state",
    "verify_sso_state",
    "get_msal_client_app",
    "get_sso_authorization_url",
    "exchange_code_for_entra_claims",   # NEW
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
    """
    Read configuration from config.ini.
    If missing, the environment variable SECTION_KEY is checked.
    """

    if _config.has_section(section) and _config.has_option(section, key):
        return _config.get(section, key)

    return os.getenv(f"{section}_{key}".upper(), fallback)


# ============================================================
# JWT CONFIGURATION
# ============================================================

SECRET_KEY = get_conf(
    "jwt", "secret_key",
    fallback="dev-jwt-secret-replace-in-production"
)

ALGORITHM = get_conf("jwt", "algorithm", fallback="HS256")

ACCESS_EXPIRE_MINUTES = int(
    get_conf("jwt", "access_expire_minutes", fallback=30)
)

REFRESH_EXPIRE_DAYS = int(
    get_conf("jwt", "refresh_expire_days", fallback=7)
)


# ============================================================
# ENTRA CONFIGURATION
# ============================================================

STATE_EXPIRE_SECONDS = 600

SCOPES = ["User.Read"]


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
# PASSWORD SECURITY
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
# JWT TOKEN CREATION
# ============================================================

def _create_token(
    user_id: str,
    token_type: str,
    expires_delta: timedelta
) -> str:

    payload = {
        "user_id": str(user_id),
        "type": token_type,
        "exp": datetime.now(timezone.utc) + expires_delta
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(user_id: str) -> str:

    return _create_token(
        user_id=user_id,
        token_type="access",
        expires_delta=timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    )


def create_refresh_token(user_id: str) -> str:

    return _create_token(
        user_id=user_id,
        token_type="refresh",
        expires_delta=timedelta(days=REFRESH_EXPIRE_DAYS)
    )


# ============================================================
# JWT TOKEN VALIDATION
# ============================================================

def decode_token(token: str, expected_type: str = "access") -> str:

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    if payload.get("type") != expected_type:
        raise HTTPException(
            status_code=401,
            detail=f"Expected a {expected_type} token"
        )

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="User ID missing from token"
        )

    return str(user_id)


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

    return decode_token(token, expected_type="access")


# ============================================================
# MICROSOFT ENTRA SSO STATE
# ============================================================

def make_sso_state() -> str:

    payload = {
        "type": "sso_state",
        "exp": datetime.now(timezone.utc)
        + timedelta(seconds=STATE_EXPIRE_SECONDS)
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_sso_state(state: str) -> None:

    try:
        payload = jwt.decode(state, SECRET_KEY, algorithms=[ALGORITHM])

    except jwt.PyJWTError:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired SSO state"
        )

    if payload.get("type") != "sso_state":
        raise HTTPException(
            status_code=400,
            detail="Invalid SSO state type"
        )


# ============================================================
# ENTRA CONFIG HELPERS (NEW)
# ============================================================

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


# ============================================================
# MSAL CLIENT (CHANGED: Confidential client + client secret)
# ============================================================

def get_msal_client_app():

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

    return msal.ConfidentialClientApplication(
        client_id=client_id,
        client_credential=client_secret,
        authority=f"https://login.microsoftonline.com/{tenant_id}"
    )


# ============================================================
# MICROSOFT ENTRA LOGIN URL (CHANGED: no chatgpt.com fallback)
# ============================================================

def get_sso_authorization_url() -> str:

    app = get_msal_client_app()

    return app.get_authorization_request_url(
        scopes=SCOPES,
        state=make_sso_state(),
        redirect_uri=_get_redirect_uri()
    )


# ============================================================
# EXCHANGE LOGIN CODE FOR ENTRA CLAIMS (NEW)
# ============================================================

def exchange_code_for_entra_claims(
    code: str,
    state: Optional[str] = None
) -> dict:
    """
    Exchange the Entra authorization code for tokens.
    MSAL validates the ID token, so id_token_claims can be trusted.
    """

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    if state:
        verify_sso_state(state)

    app = get_msal_client_app()

    result = app.acquire_token_by_authorization_code(
        code,
        scopes=SCOPES,
        redirect_uri=_get_redirect_uri()
    )

    if "error" in result:
        raise HTTPException(
            status_code=401,
            detail=result.get("error_description", "Entra login failed")
        )

    claims = result.get("id_token_claims")

    if not claims:
        raise HTTPException(
            status_code=401,
            detail="Entra did not return user claims"
        )

    return claims


# ============================================================
# MICROSOFT ENTRA ACCESS TOKEN VALIDATION
# (unchanged logic; works only for tokens with aud = your client_id)
# ============================================================

def validate_entra_access_token(access_token: str) -> dict:
    """
    Validate a Microsoft Entra access token:
    signature, issuer, audience, expiration.
    """

    if not access_token:
        raise HTTPException(
            status_code=401,
            detail="Missing Microsoft Entra access token"
        )

    tenant_id = _get_tenant_id()
    client_id = _get_client_id()

    if not tenant_id:
        raise HTTPException(status_code=503, detail="Missing Entra tenant_id")

    if not client_id:
        raise HTTPException(status_code=503, detail="Missing Entra client_id")

    discovery_url = (
        "https://login.microsoftonline.com/"
        f"{tenant_id}/v2.0/.well-known/openid-configuration"
    )

    try:
        discovery_response = requests.get(discovery_url, timeout=10)
        discovery_response.raise_for_status()
        discovery = discovery_response.json()

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve Microsoft Entra configuration"
        )

    jwks_uri = discovery.get("jwks_uri")

    if not jwks_uri:
        raise HTTPException(
            status_code=503,
            detail="Microsoft Entra signing keys unavailable"
        )

    try:
        jwks_response = requests.get(jwks_uri, timeout=10)
        jwks_response.raise_for_status()
        jwks = jwks_response.json()

    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve Microsoft Entra signing keys"
        )

    try:
        unverified_header = jose_jwt.get_unverified_header(access_token)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid Microsoft Entra access token"
        )

    kid = unverified_header.get("kid")

    if not kid:
        raise HTTPException(
            status_code=401,
            detail="Invalid Entra token header"
        )

    signing_key = None

    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            signing_key = key
            break

    if not signing_key:
        raise HTTPException(
            status_code=401,
            detail="Microsoft Entra signing key not found"
        )

    issuer = f"https://login.microsoftonline.com/{tenant_id}/v2.0"

    try:
        claims = jose_jwt.decode(
            access_token,
            signing_key,
            algorithms=["RS256"],
            audience=client_id,
            issuer=issuer
        )

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Microsoft Entra access token"
        )

    return claims