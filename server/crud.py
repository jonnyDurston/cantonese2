from psycopg import AsyncConnection, sql


async def get_all_vocab(conn: AsyncConnection):
    async with conn.cursor() as cur:
        await cur.execute(sql.SQL("SELECT cantonese, jyutping, english FROM vocabulary"))
        return await cur.fetchall()
