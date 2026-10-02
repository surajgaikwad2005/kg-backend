import os
import subprocess
import sys

import psycopg
from azure.identity import AzureCliCredential

HOST = os.getenv("PG_HOST", "pg-db-petronas-sap-prd.postgres.database.azure.com")
PORT = int(os.getenv("PG_PORT", 5432))
DATABASE = os.getenv("PG_DATABASE", "sap_pm_kg")
TOKEN_SCOPE = "https://ossrdbms-aad.database.windows.net/.default"


def _get_azure_username() -> str:
    env_user = os.getenv("PG_USER")
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
    return "suraj.gaikwad@tridiagonal.ai"


import threading
from psycopg_pool import ConnectionPool

USERNAME = _get_azure_username()

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
    global _pool
    if _pool is None or _pool.closed:
        with _pool_lock:
            if _pool is None or _pool.closed:
                conninfo = (
                    f"host={HOST} port={PORT} dbname={DATABASE} "
                    f"user={USERNAME} sslmode=require"
                )
                _pool = ConnectionPool(
                    conninfo=conninfo,
                    connection_class=AzureConnection,
                    min_size=1,
                    max_size=10,
                    max_lifetime=1800.0,  # recycle connections before 1h token expiration
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
            conn.rollback()  # reset any open transaction state
        pool.putconn(conn)
    except Exception:
        pass


import atexit


def close_pool():
    global _pool
    if _pool is not None and not _pool.closed:
        _pool.close()
        _pool = None


atexit.register(close_pool)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    try:
        conn = get_connection()
        print("✅ Connected successfully!")

        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT
                    current_database(),
                    current_user,
                    version();
            """)
            result = cursor.fetchone()
            print("Database :", result[0])
            print("User     :", result[1])
            print("Version  :", result[2])

        conn.close()
        print("✅ Connection closed.")

    except Exception as e:
        print("❌ Connection failed:")
        print(e)
 