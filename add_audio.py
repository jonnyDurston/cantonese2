"""
Slightly hacky script that goes through and adds audio to all rows that don't have it
"""

import asyncio
import random
from time import sleep

import aiosqlite
from server.crud import get_vocab_with_tags
from server.speech import generate_cantonese_tts


async def main():
    async with aiosqlite.connect("vocabulary.db", isolation_level=None) as conn:
        conn.row_factory = aiosqlite.Row

        vocab = await get_vocab_with_tags(["Adjectives"], conn)

        for word in vocab:
            if word["mp3_id"]:
                continue

            print("Doing word", word)
            mp3_id = generate_cantonese_tts(word["cantonese"])
            await conn.execute(
                "UPDATE vocabulary SET mp3_id = ? WHERE cantonese = ?",
                (mp3_id, word["cantonese"]),
            )
            sleep(random.random() * 5)

            await conn.commit()

        # Save changes and close
        await conn.commit()
        await conn.close()


asyncio.run(main())
