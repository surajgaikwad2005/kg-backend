from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from routers.graph_router import router
from database.connection import get_pool, close_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm the Azure PostgreSQL connection pool on startup
    try:
        get_pool()
    except Exception as e:
        print("[Lifespan] Warning: pool initialization:", e)
    yield
    # Clean up pool threads on shutdown
    close_pool()


app = FastAPI(title="SAP PM Knowledge Graph API", lifespan=lifespan)


@app.get("/", include_in_schema=False)
def root():
    return RedirectResponse(url="/docs")


@app.get("/health")
def health():
    return {"status": "ok", "service": "SAP PM Knowledge Graph API"}


app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)