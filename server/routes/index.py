from fastapi import Depends, Request
from fastapi.templating import Jinja2Templates
from psycopg import AsyncConnection

from ..database import get_database_connection
from ..templates import get_jinja_templates
from ..crud import get_all_vocab


async def index(
    request: Request,
    conn: AsyncConnection = Depends(get_database_connection),
    templates: Jinja2Templates = Depends(get_jinja_templates),
):
    """Fetch data from the database and render it using a Jinja2 template."""
    vocab = await get_all_vocab(conn)
    return templates.TemplateResponse("index.html", {"request": request, "vocab": vocab})
