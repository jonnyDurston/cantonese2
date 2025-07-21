from aiosqlite import Connection
from fastapi import Depends

from ..crud import insert_tag as insert_tag_db
from ..database import get_database_connection
from ..models import POSTTag


async def insert_tag(data: POSTTag, conn: Connection = Depends(get_database_connection)):
    tag_name = await insert_tag_db(data.tag_name, conn)
    return {"tag_name": tag_name}
