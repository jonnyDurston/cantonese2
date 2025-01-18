import json
from fastapi import FastAPI, Depends, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from psycopg_pool import AsyncConnectionPool
from psycopg import sql
import os


# Jinja2 templates directory
templates = Jinja2Templates(directory="templates")


async def get_db_connection():
    """Dependency to get a database connection from the pool."""
    async with pool.connection() as conn:
        yield conn


@app.get("/index.html", response_class=HTMLResponse)
async def index(request: Request, conn=Depends(get_db_connection)):
    """Fetch data from the database and render it using a Jinja2 template."""
    query = sql.SQL("SELECT * FROM foo")
    async with conn.cursor() as cur:
        await cur.execute(query)
        rows = await cur.fetchall()

    # Pass data to the Jinja2 template
    return templates.TemplateResponse("index.html", {"request": request, "rows": rows})


if __name__ == "__main__":
    import uvicorn

    app = FastAPI()

    # Adding db connection pool to app
    with open(".DATABASE_CREDS") as creds_file:
        creds = json.load(creds_file)
        database_pool = AsyncConnectionPool(
            f"postgresql://{creds['username']}:{creds['password']}@localhost/{creds['database']}"
        )

    uvicorn.run(app, host="127.0.0.1", port=8000)
