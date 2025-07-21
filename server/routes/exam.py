import random
from aiosqlite import Connection
from fastapi import Depends, Request
from fastapi.templating import Jinja2Templates

from ..database import get_database_connection
from ..templates import get_jinja_templates
from ..crud import get_all_tags, get_all_vocab, get_vocab_with_tags


async def exam(
    request: Request,
    tags: str = "",
    display_mode: str = "cantonese",
    conn: Connection = Depends(get_database_connection),
    templates: Jinja2Templates = Depends(get_jinja_templates),
):
    """Fetch data from the database and render it using a Jinja2 template."""
    filter_tags = tags.split(",") if tags else []
    if tags:
        vocab = await get_vocab_with_tags(filter_tags, conn)
        print([v["cantonese"] for v in vocab])
    else:
        vocab = await get_all_vocab(conn)

    all_tags = await get_all_tags(conn)
    for tag in all_tags:
        tag["checked"] = tag["tag_name"] in filter_tags

    random.shuffle(vocab)

    return templates.TemplateResponse(
        "exam.html",
        {"request": request, "vocab": vocab, "tags": all_tags, "display_mode": display_mode},
    )
