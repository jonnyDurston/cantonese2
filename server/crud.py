import json
from aiosqlite import Connection


async def get_all_vocab(conn: Connection):
    async with conn.cursor() as cur:
        await cur.execute(
            "SELECT cantonese, jyutping, english FROM vocabulary ORDER BY created_date"
        )
        response = await cur.fetchall()
        return [dict(item) for item in response]


async def get_vocab_with_tags(tags: list[str], conn: Connection):
    async with conn.cursor() as cur:
        await cur.execute(
            """
            WITH sel(tag_name) AS (
                SELECT value FROM json_each(?)
            )
            SELECT v.cantonese, v.jyutping, v.english
            FROM vocabulary AS v
            JOIN vocabulary_tags AS vt ON v.vocab_id = vt.vocab_id
            JOIN sel ON vt.tag_name = sel.tag_name
            GROUP BY v.vocab_id
            HAVING COUNT(DISTINCT sel.tag_name) = (SELECT COUNT(*) FROM sel)
            ORDER BY v.created_date;
            """,
            (json.dumps(tags),),
        )
        response = await cur.fetchall()
        return [dict(item) for item in response]


async def insert_vocab(cantonese: str, jyutping: str, english: str, conn: Connection):
    async with conn.cursor() as cur:
        response = await cur.execute(
            "INSERT INTO vocabulary (cantonese, jyutping, english) VALUES (?, ?, ?) RETURNING vocab_id;",
            (cantonese, jyutping, english),
        )
        response = await cur.fetchone()
        return dict(response)


async def get_all_tags(conn: Connection):
    async with conn.cursor() as cur:
        await cur.execute("SELECT tag_name FROM tags ORDER BY tag_name")
        response = await cur.fetchall()
        return [dict(item) for item in response]


async def insert_tag(tag_name: str, conn: Connection):
    async with conn.cursor() as cur:
        response = await cur.execute(
            "INSERT INTO tags (tag_name) VALUES (?) RETURNING tag_name;",
            (tag_name,),
        )
        response = await cur.fetchone()
        return dict(response)


async def tag_vocab(vocab_id: int, tags: list[str], conn: Connection):
    async with conn.cursor() as cur:
        print([(vocab_id, tag_name) for tag_name in tags])
        await cur.executemany(
            "INSERT INTO vocabulary_tags (vocab_id, tag_name) VALUES (?, ?)",
            [(vocab_id, tag_name) for tag_name in tags],
        )
