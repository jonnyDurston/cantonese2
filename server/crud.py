from psycopg import AsyncConnection, sql


async def get_all_vocab(conn: AsyncConnection):
    async with conn.cursor() as cur:
        await cur.execute(
            sql.SQL("SELECT cantonese, jyutping, english FROM vocabulary ORDER BY created_date")
        )
        return await cur.fetchall()


async def get_vocab_with_tags(conn: AsyncConnection, tags: list[str]):
    async with conn.cursor() as cur:
        await cur.execute(
            sql.SQL(
                """
                WITH selected_tags AS (SELECT UNNEST(%s::TEXT[]) AS tag_name)
                SELECT v.cantonese, v.jyutping, v.english FROM vocabulary v
                JOIN vocabulary_tags vt ON v.vocab_id = vt.vocab_id
                JOIN selected_tags st ON vt.tag_name = st.tag_name
                GROUP BY v.cantonese, v.jyutping, v.english, v.created_date
                HAVING COUNT(DISTINCT st.tag_name) = (SELECT COUNT(*) FROM selected_tags)
                ORDER BY v.created_date;
                """
            ),
            (tags,),
        )
        return await cur.fetchall()


async def insert_vocab(cantonese: str, jyutping: str, english: str, conn: AsyncConnection):
    async with conn.cursor() as cur:
        response = await cur.execute(
            sql.SQL(
                "INSERT INTO vocabulary (cantonese, jyutping, english) VALUES (%s, %s, %s) RETURNING vocab_id;"
            ),
            (cantonese, jyutping, english),
        )
        return await response.fetchone()


async def get_all_tags(conn: AsyncConnection):
    async with conn.cursor() as cur:
        await cur.execute(sql.SQL("SELECT tag_name FROM tags ORDER BY tag_name"))
        return await cur.fetchall()


async def insert_tag(conn: AsyncConnection, tag_name: str):
    async with conn.cursor() as cur:
        response = await cur.execute(
            sql.SQL("INSERT INTO tags (tag_name) VALUES (%s) RETURNING tag_name;"),
            (tag_name,),
        )
        return await response.fetchone()


async def tag_vocab(vocab_id: int, tags: list[str], conn: AsyncConnection):
    async with conn.cursor() as cur:
        print([(vocab_id, tag_name) for tag_name in tags])
        await cur.executemany(
            sql.SQL("INSERT INTO vocabulary_tags (vocab_id, tag_name) VALUES (%s, %s)"),
            [(vocab_id, tag_name) for tag_name in tags],
        )
