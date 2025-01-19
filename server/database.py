"""
Database connection dependency that will be injected in
"""

import json

from psycopg_pool import AsyncConnectionPool
from psycopg.rows import dict_row

# Create an AsyncConnectionPool
database_pool: AsyncConnectionPool | None = None


async def init_db_pool():
    """
    Creates connection pool
    """
    print("Loading connection pool...")
    global database_pool
    if database_pool is None:
        with open(".DATABASE_CREDS") as creds_file:
            creds = json.load(creds_file)

        database_pool = AsyncConnectionPool(
            f"postgresql://{creds['username']}:{creds['password']}@localhost/{creds['database']}",
            open=False,
        )
        await database_pool.open(wait=True)

    print("Connection pool loaded.")


async def shutdown_db_pool():
    """
    Closes database pool, if not instantiated already
    """
    global database_pool
    if database_pool is not None:
        await database_pool.close()


async def get_database_connection():
    """
    Gets a database connection
    """
    if database_pool is None:
        raise RuntimeError("Database pool is not initialized.")

    async with database_pool.connection() as conn:
        conn.row_factory = dict_row
        yield conn
