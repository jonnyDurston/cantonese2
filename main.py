import asyncio
from contextlib import asynccontextmanager
import sys
from threading import Thread
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pycantonese import characters_to_jyutping

from server.database import init_db_pool, shutdown_db_pool
from server.routes import favicon, jyutping, insert_vocabulary


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Events for startup and shutdown of app
    """
    await init_db_pool()
    # Hack to load cantonese corpus - do in side thread
    Thread(target=lambda: characters_to_jyutping(" ")).start()
    yield
    await shutdown_db_pool()


if __name__ == "__main__":

    # https://www.psycopg.org/psycopg3/docs/advanced/async.html#async
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    import uvicorn

    app = FastAPI(lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:8000", "http://localhost:8000"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    from server.routes import index

    app.get("/index.html", response_class=HTMLResponse)(index)
    app.get("/jyutping")(jyutping)
    app.post("/vocabulary")(insert_vocabulary)
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.get("/favicon.ico", include_in_schema=False)(favicon)

    uvicorn.run(app, host="127.0.0.1", port=8000)
