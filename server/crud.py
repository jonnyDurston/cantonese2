from psycopg import AsyncConnection, sql


async def get_all_vocab(conn: AsyncConnection):
    async with conn.cursor() as cur:
        await cur.execute(sql.SQL("SELECT cantonese, jyutping, english FROM vocabulary"))
        return await cur.fetchall()


async def insert_vocab(cantonese: str, jyutping: str, english: str, conn: AsyncConnection):
    async with conn.cursor() as cur:
        response = await cur.execute(
            sql.SQL(
                "INSERT INTO vocabulary (cantonese, jyutping, english) VALUES (%s, %s, %s) RETURNING vocab_id;"
            ),
            (cantonese, jyutping, english),
        )
        return response.fetchone()
