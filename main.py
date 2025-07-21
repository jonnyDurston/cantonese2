import asyncio
from contextlib import asynccontextmanager
import sys
from threading import Thread
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pycantonese import characters_to_jyutping

from server.routes import exam, favicon, jyutping, insert_vocabulary, insert_tag


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Events for startup and shutdown of app
    """
    # Hack to load cantonese corpus - do in side thread
    Thread(target=lambda: characters_to_jyutping(" ")).start()
    yield


if __name__ == "__main__":

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
    app.get("/exam.html", response_class=HTMLResponse)(exam)
    app.get("/jyutping")(jyutping)
    app.post("/vocabulary")(insert_vocabulary)
    app.post("/tags")(insert_tag)
    app.mount("/static", StaticFiles(directory="static"), name="static")
    app.get("/favicon.ico", include_in_schema=False)(favicon)

    uvicorn.run(app, host="127.0.0.1", port=8000)
