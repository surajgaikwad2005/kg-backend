import subprocess
import threading
import atexit
import psycopg
from psycopg_pool import ConnectionPool
from azure.identity import AzureCliCredential
from utils import get_conf

# Read database connection parameters via central get_conf
HOST = get_conf("azure_db", "host", fallback="pg-db-petronas-sap-prd.postgres.database.azure.com")
PORT = int(get_conf("azure_db", "port", fallback=5432))
DATABASE = get_conf("azure_db", "database", fallback="sap_pm_kg")
TOKEN_SCOPE = get_conf("azure_db", "token_scope", fallback="https://ossrdbms-aad.database.windows.net/.default")


def _get_azure_username() -> str:
    env_user = get_conf("azure_db", "user")
    if env_user:
        return env_user

    try:
        out = subprocess.check_output(
            "az account show --query user.name -o tsv",
            shell=True,
            text=True,
            stderr=subprocess.DEVNULL,
        ).strip()
        if out:
            return out
    except Exception:
        pass

    raise RuntimeError(
        "No database user found. Run 'az login' or set "
        "user under [azure_db] in config.ini."
    )


_credential = AzureCliCredential()
_pool: ConnectionPool | None = None
_pool_lock = threading.Lock()


class AzureConnection(psycopg.Connection):
    """Connection class that fetches fresh Azure Entra ID token automatically on connect."""

    @classmethod
    def connect(cls, conninfo="", **kwargs):
        token = _credential.get_token(TOKEN_SCOPE)
        kwargs["password"] = token.token
        return super().connect(conninfo, **kwargs)


def get_pool() -> ConnectionPool:
    """Singleton ConnectionPool for Azure PostgreSQL."""
    global _pool
    if _pool is None or _pool.closed:
        with _pool_lock:
            if _pool is None or _pool.closed:
                conninfo = (
                    f"host={HOST} port={PORT} dbname={DATABASE} "
                    f"user={_get_azure_username()} sslmode=require"
                )
                _pool = ConnectionPool(
                    conninfo=conninfo,
                    connection_class=AzureConnection,
                    min_size=1,
                    max_size=10,
                    max_lifetime=1800.0,
                    open=True,
                )
    return _pool


def get_connection() -> psycopg.Connection:
    """Get an already-open, authenticated connection from the connection pool."""
    pool = get_pool()
    return pool.getconn()


def release_connection(conn: psycopg.Connection | None):
    """Return a connection back to the connection pool for reuse."""
    if conn is None:
        return
    try:
        pool = get_pool()
        if not conn.closed:
            conn.rollback()
        pool.putconn(conn)
    except Exception:
        pass


def close_pool():
    """Clean up connection pool on shutdown."""
    global _pool
    if _pool is not None and not _pool.closed:
        _pool.close()
        _pool = None


atexit.register(close_pool)