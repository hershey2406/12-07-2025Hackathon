"""Fetch top headlines from NewsAPI and store them in a local SQLite 'Today' table.

Usage:
  - Set `NEWSAPI_KEY` environment variable to your NewsAPI key.
  - Optionally set `DB_PATH` env var to change the SQLite file path (default: `backend/today.db`).
  - Run: `python pushnews.py` (from the `backend/` folder or via python -m backend.pushnews).

The script will create a `Today` table if it doesn't exist and store a JSON
array of the top headlines for the current date. Existing row for today's
date will be replaced.
"""
import os
import sys
import sqlite3
import json
from datetime import date
import requests


NEWSAPI_KEY = os.getenv("NEWS_API_KEY")
if not NEWSAPI_KEY:
    print("ERROR: Please set the NEWSAPI_KEY environment variable.")
    sys.exit(1)

# DB path (default to a file next to this script)
DB_PATH = os.getenv("DB_PATH") or os.path.join(os.path.dirname(__file__), "today.db")

TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines"


def _fetch_top_headlines(api_key: str, country: str = "us", page_size: int = 20):
    """Call NewsAPI top-headlines and return list of article dicts.

    We return only useful fields to keep storage small.
    """
    params = {"apiKey": api_key, "country": country, "pageSize": page_size}
    resp = requests.get(TOP_HEADLINES_URL, params=params, timeout=10)
    resp.raise_for_status()
    data = resp.json()
    articles = data.get("articles") or []
    out = []
    for a in articles:
        out.append({
            "source": (a.get("source") or {}).get("name"),
            "author": a.get("author"),
            "title": a.get("title"),
            "description": a.get("description"),
            "url": a.get("url"),
            "publishedAt": a.get("publishedAt"),
        })
    return out


def _ensure_table(conn: sqlite3.Connection):
    """Create Today table if it doesn't exist.

    Columns:
      - id INTEGER PRIMARY KEY
      - date TEXT UNIQUE (YYYY-MM-DD)
      - headlines TEXT (JSON string)
    """
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS Today (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            headlines TEXT NOT NULL
        )
        """
    )
    conn.commit()


def store_headlines_for_today(db_path: str, headlines: list):
    today = date.today().isoformat()
    conn = sqlite3.connect(db_path)
    try:
        _ensure_table(conn)
        # Upsert: replace existing row for today's date
        conn.execute("DELETE FROM Today WHERE date = ?", (today,))
        conn.execute(
            "INSERT INTO Today (date, headlines) VALUES (?, ?)",
            (today, json.dumps(headlines, ensure_ascii=False)),
        )
        conn.commit()
    finally:
        conn.close()


def main():
    # Limit headlines to US only per user's request
    country = "us"
    page_size = int(os.getenv("NEWS_COUNT", "20"))
    print(f"Fetching top {page_size} headlines for country={country}...")
    try:
        articles = _fetch_top_headlines(NEWSAPI_KEY, country=country, page_size=page_size)
    except Exception as e:
        print("Failed to fetch headlines:", e)
        sys.exit(2)

    print(f"Fetched {len(articles)} articles. Storing in {DB_PATH}...")
    try:
        store_headlines_for_today(DB_PATH, articles)
    except Exception as e:
        print("Failed to store headlines:", e)
        sys.exit(3)

    print("Done.")


if __name__ == "__main__":
    main()
