from aiosqlite import Connection
from fastapi import Depends

from server.crud import insert_vocab, tag_vocab
from server.database import get_database_connection
from ..models import POSTVocabulary


async def insert_vocabulary(
    data: POSTVocabulary, conn: Connection = Depends(get_database_connection)
):
    print("Received request payload", data.model_dump())
    vocab_details = await insert_vocab(data.cantonese, data.jyutping, data.english, conn)
    if data.tags:
        await tag_vocab(vocab_details["vocab_id"], data.tags, conn)
    return vocab_details
