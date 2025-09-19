from uuid import uuid4
from aiosqlite import Connection
from fastapi import Depends

from server.crud import (
    delete_vocab,
    get_all_vocab,
    get_vocab,
    get_vocab_with_tags,
    insert_vocab,
    tag_vocab,
    update_vocab,
    update_vocab_attempt,
)
from server.database import get_database_connection
from server.speech import generate_cantonese_tts
from ..models import POSTVocabulary, POSTVocabularyAttempt


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
    if data.generate_speech:
        mp3_id = generate_cantonese_tts(data.cantonese)

    vocab_details = await insert_vocab(data.cantonese, data.jyutping, data.english, mp3_id, conn)
    if data.tags:
        await tag_vocab(vocab_details["vocab_id"], data.tags, conn)
    return vocab_details


async def patch_vocabulary(
    vocab_id: str, data: POSTVocabulary, conn: Connection = Depends(get_database_connection)
):
    print(f"Updating {vocab_id} with payload {data}")
    existing_vocab = await get_vocab(vocab_id, conn)

    mp3_id = existing_vocab["mp3_id"]
    if data.generate_speech:
        if existing_vocab["cantonese"] != data.cantonese:
            print("Generating new vocab TTS", existing_vocab["cantonese"], data.cantonese)
            mp3_id = generate_cantonese_tts(data.cantonese, mp3_id)

    return await update_vocab(vocab_id, data.cantonese, data.jyutping, data.english, mp3_id, conn)


async def update_vocabulary_attempt(
    vocab_id: str, data: POSTVocabularyAttempt, conn: Connection = Depends(get_database_connection)
):
    print(f"Updating status for {vocab_id} to {data.correct}")
    return await update_vocab_attempt(vocab_id, data.correct, conn)


async def delete_vocabulary(vocab_id: str, conn: Connection = Depends(get_database_connection)):
    print(f"Deleting {vocab_id}")
    return await delete_vocab(vocab_id, conn)
