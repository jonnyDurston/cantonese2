# Adding db connection pool to app
import json

from psycopg_pool import AsyncConnectionPool


with open(".DATABASE_CREDS") as creds_file:
    creds = json.load(creds_file)

database_pool = AsyncConnectionPool(
    f"postgresql://{creds['username']}:{creds['password']}@localhost/{creds['database']}"
)
