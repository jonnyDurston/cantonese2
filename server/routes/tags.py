from fastapi import Depends
from psycopg import AsyncConnection

from server.database import get_database_connection
from server.models import POSTTag


async def insert_tag(data: POSTTag, conn: AsyncConnection = Depends(get_database_connection)):
    tag_name = await insert_tag(data.tag_name, conn)
    return {"tag_name": tag_name}
