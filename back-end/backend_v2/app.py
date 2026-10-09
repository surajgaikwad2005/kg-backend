from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from db.connection import get_pool, close_pool
from kg.main import router as kg_router
from auth.main import router as auth_router
from utils import get_conf


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm Azure PostgreSQL connection pool on startup
    try:
        get_pool()
    except Exception as e:
        print("[Lifespan] Warning: pool initialization:", e)
    yield
    # Clean up connection pool on shutdown
    close_pool()


app = FastAPI(
    title="SAP PM Knowledge Graph API",
    description="Knowledge Graph service with Authentication & Connection Pooling",
    version="2.0.0",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "SAP PM Knowledge Graph API"}


# Mount Knowledge Graph and Authentication routers
app.include_router(kg_router)
app.include_router(auth_router)


if __name__ == "__main__":
    import uvicorn

    host = get_conf("server", "host", fallback="127.0.0.1")
    port = int(get_conf("server", "port", fallback=8000))
    reload = get_conf("server", "reload", fallback="true").lower() == "true"

    uvicorn.run("app:app", host=host, port=port, reload=reload)
