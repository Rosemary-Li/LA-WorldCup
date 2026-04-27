"""One-shot script to apply database/migrations/001_journey_share.sql.

Reads DB credentials from backend/.env (same as queries.py). Idempotent —
the SQL uses CREATE TABLE IF NOT EXISTS, so re-running is safe.

Usage:
    cd backend && python scripts/init_share_table.py
"""

import os
import sys
import psycopg2
from dotenv import load_dotenv

HERE = os.path.dirname(os.path.abspath(__file__))
BACKEND = os.path.dirname(HERE)
REPO    = os.path.dirname(BACKEND)
MIGRATION = os.path.join(REPO, "database", "migrations", "001_journey_share.sql")


def main():
    load_dotenv(os.path.join(BACKEND, ".env"))
    if not os.path.exists(MIGRATION):
        print(f"Migration file not found: {MIGRATION}", file=sys.stderr)
        sys.exit(1)
    with open(MIGRATION, "r", encoding="utf-8") as f:
        sql = f.read()

    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 5432)),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        sslmode=os.getenv("DB_SSLMODE", "require"),
    )
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        print("✓ journey_share table created (or already existed)")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
