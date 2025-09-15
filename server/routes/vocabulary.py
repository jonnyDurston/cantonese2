from uuid import uuid4
from aiosqlite import Connection
from fastapi import Depends

from server.crud import (
    get_all_tags,
    get_all_vocab,
    get_vocab_with_tags,
    insert_vocab,
    tag_vocab,
    update_vocab,
)
from server.database import get_database_connection
from server.speech import generate_cantonese_tts
from ..models import POSTVocabulary


async def get_vocabulary(tags: str = "", conn: Connection = Depends(get_database_connection)):
    """Fetch vocabulary from the database."""
    filter_tags = tags.split(",") if tags else []
    if tags:
        vocab = await get_vocab_with_tags(filter_tags, conn)
        print([v["cantonese"] for v in vocab])
    else:
        vocab = await get_all_vocab(conn)

    return vocab


async def insert_vocabulary(
    data: POSTVocabulary, conn: Connection = Depends(get_database_connection)
):
    print("Received request payload", data.model_dump())

    mp3_id = None
    # if data.generate_speech:
    #     mp3_id = generate_cantonese_tts(data.cantonese)

    vocab_details = await insert_vocab(data.cantonese, data.jyutping, data.english, mp3_id, conn)
    if data.tags:
        await tag_vocab(vocab_details["vocab_id"], data.tags, conn)
    return vocab_details


async def patch_vocabulary(
    vocab_id: str, data: POSTVocabulary, conn: Connection = Depends(get_database_connection)
):
    print(f"Updating {vocab_id} with payload {data}")
    mp3_id = None
    # if data.generate_speech:
    #     mp3_id = generate_cantonese_tts(data.cantonese)

    return await update_vocab(vocab_id, data.cantonese, data.jyutping, data.english, mp3_id, conn)
