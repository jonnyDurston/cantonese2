"""
Dependencies that will be injected in
"""

from .database import database_pool


async def get_db_connection():
    """
    Dependency to get a database connection from the pool.
    """
    async with database_pool.connection() as conn:
        yield conn
