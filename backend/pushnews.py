"""Fetch top headlines from NewsAPI and upsert them into the normalized
SQLAlchemy models: `Article`, `Day`, and `DayArticle`.

This script will:
- Fetch top headlines (default country='us').
- Create a Flask app and initialize `models.db` from the environment.
- Upsert `Article` rows by `url` and create or update the `Day` and
  `DayArticle` associations for today's date.

Usage:
  - Set `NEWSAPI_KEY` environment variable to your NewsAPI key.
  - Optionally set `DATABASE_URL` or `DB_PATH` env var. If `DATABASE_URL`
    is provided it is used directly; otherwise `DB_PATH` (path to sqlite
    file) will be used and a `sqlite:///` URI will be constructed.
  - Run: `python pushnews.py` (from the `backend/` folder).
"""
import os
import sys
from datetime import date
import requests

from flask import Flask

import models


NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
if not NEWSAPI_KEY:
    print("ERROR: Please set the NEWSAPI_KEY environment variable.")
    sys.exit(1)

TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines"


def _fetch_top_headlines(api_key: str, country: str = "us", page_size: int = 20):
    """Call NewsAPI top-headlines and return list of article dicts.

    Returns a list of dicts with keys: source, author, title, description,
    url, publishedAt.
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
            "urlToImage": a.get("urlToImage"),
        })
    return out


def _simple_category(title: str, description: str) -> str:
    """Very small heuristic to classify into a few categories used by the UI.

    Returns one of: 'economy', 'health', 'defense', 'general'.
    """
    txt = (title or "") + " " + (description or "")
    t = txt.lower()
    if any(k in t for k in ["econom", "market", "inflation", "stocks", "trade", "economy"]):
        return "economy"
    if any(k in t for k in ["health", "covid", "vaccine", "hospital", "disease", "mental health"]):
        return "health"
    if any(k in t for k in ["defense", "military", "army", "navy", "air force", "war", "troop"]):
        return "defense"
    return "general"


def _make_app_and_init_db():
    """Create a minimal Flask app configured to initialize `models.db`.

    Uses `DATABASE_URL` if present, otherwise builds a sqlite URI from
    `DB_PATH` (defaults to a `today.db` file next to this script).
    """
    app = Flask(__name__)
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        db_path = os.getenv("DB_PATH") or os.path.join(os.path.dirname(__file__), "today.db")
        # If DB_PATH already looks like a URI, use it; otherwise build sqlite URI
        if "://" in db_path:
            database_url = db_path
        else:
            database_url = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    models.db.init_app(app)
    return app


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

    print(f"Fetched {len(articles)} articles.")

    app = _make_app_and_init_db()
    from sqlalchemy.exc import SQLAlchemyError

    with app.app_context():
        session = models.db.session
        try:
            # Upsert articles
            article_objs = []
            for a in articles:
                url = a.get("url")
                if not url:
                    continue
                existing = session.query(models.Article).filter_by(url=url).first()
                if existing:
                    # update some useful fields
                    existing.title = a.get("title") or existing.title
                    existing.description = a.get("description") or existing.description
                    existing.source_name = a.get("source") or existing.source_name
                    existing.author = a.get("author") or existing.author
                    existing.published_at = a.get("publishedAt") or existing.published_at
                    existing.url_to_image = a.get("urlToImage") or existing.url_to_image
                    article_obj = existing
                else:
                    article_obj = models.Article(
                        url=url,
                        title=a.get("title"),
                        description=a.get("description"),
                        source_name=a.get("source"),
                        author=a.get("author"),
                        published_at=a.get("publishedAt"),
                        url_to_image=a.get("urlToImage"),
                    )
                    session.add(article_obj)
                article_objs.append(article_obj)

            # Flush so new Article ids are available
            session.flush()

            # Ensure Day for today exists
            today_dt = date.today()
            day = session.query(models.Day).filter_by(date=today_dt).first()
            if not day:
                day = models.Day(date=today_dt)
                session.add(day)
                session.flush()

            # Create or update DayArticle associations (ranked by position from API)
            for idx, art in enumerate(article_objs, start=1):
                if art is None or art.id is None:
                    continue
                # Find or create mapping
                da = (
                    session.query(models.DayArticle)
                    .filter_by(day_id=day.id, article_id=art.id)
                    .first()
                )
                cat = _simple_category(getattr(art, "title", None), getattr(art, "description", None))
                if da:
                    da.rank = idx
                    da.category = cat
                else:
                    da = models.DayArticle(day_id=day.id, article_id=art.id, rank=idx, category=cat)
                    session.add(da)

            session.commit()
        except SQLAlchemyError as e:
            session.rollback()
            print("Database error during upsert:", e)
            sys.exit(4)
        except Exception as e:
            session.rollback()
            print("Unexpected error during upsert:", e)
            sys.exit(5)

    print("Done.")


if __name__ == "__main__":
    main()
