from fastapi import Depends
from psycopg import AsyncConnection

from server.crud import insert_vocab
from server.database import get_database_connection
from ..models import POSTVocabulary


async def insert_vocabulary(
    data: POSTVocabulary, conn: AsyncConnection = Depends(get_database_connection)
):
    vocab_id = await insert_vocab(data.cantonese, data.jyutping, data.english, conn)
    return {"vocab_id": vocab_id}
