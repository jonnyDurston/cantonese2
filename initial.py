import sqlite3

# Read the SQL file
with open("initial.sql", "r", encoding="utf-8") as f:
    sql_script = f.read()

# Connect to (or create) the database
conn = sqlite3.connect("vocabulary.db")

# Execute the full script — handles multiple statements
conn.executescript(sql_script)

# Save changes and close
conn.commit()
conn.close()
