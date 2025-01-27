from fastapi import Depends, Request
from fastapi.templating import Jinja2Templates
from psycopg import AsyncConnection

from ..database import get_database_connection
from ..templates import get_jinja_templates
from ..crud import get_all_tags, get_all_vocab, get_vocab_with_tags


async def index(
    request: Request,
    tags: str = "",
    conn: AsyncConnection = Depends(get_database_connection),
    templates: Jinja2Templates = Depends(get_jinja_templates),
):
    """Fetch data from the database and render it using a Jinja2 template."""
    filter_tags = tags.split(",") if tags else []
    if tags:
        vocab = await get_vocab_with_tags(filter_tags, conn)
    else:
        vocab = await get_all_vocab(conn)

    all_tags = await get_all_tags(conn)
    for tag in all_tags:
        tag["checked"] = tag["tag_name"] in filter_tags

    return templates.TemplateResponse(
        "index.html", {"request": request, "vocab": vocab, "tags": all_tags}
    )
