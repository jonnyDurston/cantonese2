import asyncio
from contextlib import asynccontextmanager
import sys
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from server.database import init_db_pool, shutdown_db_pool


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Events for startup and shutdown of app
    """
    await init_db_pool()
    yield
    await shutdown_db_pool()


if __name__ == "__main__":

    # https://www.psycopg.org/psycopg3/docs/advanced/async.html#async
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    import uvicorn

    app = FastAPI(lifespan=lifespan)

    from server.routes import index

    app.get("/index.html", response_class=HTMLResponse)(index)
    app.mount("/static", StaticFiles(directory="static"), name="static")

    uvicorn.run(app, host="127.0.0.1", port=8000)
