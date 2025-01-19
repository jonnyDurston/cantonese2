from fastapi import Depends, Request
from psycopg import sql

from ..database import get_database_connection
from ..templates import get_jinja_templates


async def index(
    request: Request, conn=Depends(get_database_connection), templates=Depends(get_jinja_templates)
):
    """Fetch data from the database and render it using a Jinja2 template."""
    query = sql.SQL("SELECT * FROM vocabulary")
    async with conn.cursor() as cur:
        await cur.execute(query)
        rows = await cur.fetchall()

    # Pass data to the Jinja2 template
    return templates.TemplateResponse("index.html", {"request": request, "rows": rows})
