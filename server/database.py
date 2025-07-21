"""
Database connection dependency that will be injected in
"""

import aiosqlite


async def get_database_connection():
    """
    Gets a database connection
    """
    async with aiosqlite.connect("vocabulary.db") as conn:
        conn.row_factory = aiosqlite.Row
        yield conn
