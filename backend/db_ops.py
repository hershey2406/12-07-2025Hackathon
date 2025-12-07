"""Database helper utilities for common read/write operations.

These functions operate on the SQLAlchemy models defined in `models.py` and
are intended to centralize common patterns: upserting articles, creating a
`Day`, associating articles with a day (rank/category), and saving summaries.

All functions accept an optional `session` argument (a SQLAlchemy session).
If not provided, `models.db.session` is used. By default operations commit at
the end; pass `commit=False` to batch multiple operations before committing.
"""
from typing import List, Dict, Optional, Any
from datetime import datetime, date as _date

import models


def _to_date(d: Any) -> _date:
    if isinstance(d, _date):
        return d
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, str):
        return _date.fromisoformat(d)
    raise ValueError("Unsupported date type")


def upsert_article(
    session=None,
    url: str = None,
    title: Optional[str] = None,
    description: Optional[str] = None,
    source_name: Optional[str] = None,
    author: Optional[str] = None,
    published_at: Optional[str] = None,
    url_to_image: Optional[str] = None,
    content: Optional[str] = None,
    language: Optional[str] = None,
    country: Optional[str] = None,
    fetch_source: Optional[str] = None,
    commit: bool = True,
):
    """Insert or update an Article by `url` and return the Article instance.

    If `session` is None the default `models.db.session` is used. By default
    the function will commit the session; pass `commit=False` to defer.
    """
    if session is None:
        session = models.db.session
    if not url:
        raise ValueError("url is required for upsert_article")

    article = session.query(models.Article).filter_by(url=url).first()
    if article:
        # update fields when provided
        if title is not None:
            article.title = title
        if description is not None:
            article.description = description
        if source_name is not None:
            article.source_name = source_name
        if author is not None:
            article.author = author
        if published_at is not None:
            article.published_at = published_at
        if url_to_image is not None:
            article.url_to_image = url_to_image
        if content is not None:
            article.content = content
        if language is not None:
            article.language = language
        if country is not None:
            article.country = country
        if fetch_source is not None:
            article.fetch_source = fetch_source
    else:
        article = models.Article(
            url=url,
            title=title,
            description=description,
            source_name=source_name,
            author=author,
            published_at=published_at,
            url_to_image=url_to_image,
            content=content,
            language=language,
            country=country,
            fetch_source=fetch_source,
        )
        session.add(article)

    if commit:
        session.commit()
    else:
        session.flush()
    return article


def ensure_day(session=None, day: Any = None, commit: bool = True) -> models.Day:
    """Ensure a `Day` row exists for `day` (date or ISO string) and return it."""
    if session is None:
        session = models.db.session
    d = _to_date(day or _date.today())
    day_row = session.query(models.Day).filter_by(date=d).first()
    if not day_row:
        day_row = models.Day(date=d)
        session.add(day_row)
        if commit:
            session.commit()
        else:
            session.flush()
    return day_row


def set_day_articles(session=None, day: Any = None, article_info: List[Dict] = None, commit: bool = True):
    """Set the list of articles for `day`.

    `article_info` is a list of dicts with at least a `url` key and optional
    fields: `title`, `description`, `category`, `rank`, `urlToImage`.

    This function upserts articles, creates or updates the DayArticle mapping
    with the provided `rank` and `category`, and removes mappings for articles
    that are not present in the new `article_info` list.
    """
    if session is None:
        session = models.db.session
    if article_info is None:
        article_info = []

    day_row = ensure_day(session=session, day=day, commit=False)

    # Build map of url -> metadata
    info_map = {item.get("url"): item for item in article_info if item.get("url")}

    # Ensure all articles exist and collect their ids
    article_objs = {}
    for url, meta in info_map.items():
        art = upsert_article(
            session=session,
            url=url,
            title=meta.get("title"),
            description=meta.get("description"),
            url_to_image=meta.get("urlToImage"),
            commit=False,
        )
        article_objs[url] = art

    session.flush()

    # Existing mappings for the day
    existing_map = {
        (da.article.url): da
        for da in session.query(models.DayArticle).join(models.Article).filter(models.DayArticle.day_id == day_row.id).all()
    }

    # Upsert mappings and set rank/category
    desired_urls = set(info_map.keys())
    for url, meta in info_map.items():
        art = article_objs.get(url)
        if not art:
            continue
        rank = meta.get("rank") or 0
        category = meta.get("category") or (meta.get("cat") or "general")
        da = existing_map.get(url)
        if da:
            da.rank = rank
            da.category = category
        else:
            da = models.DayArticle(day_id=day_row.id, article_id=art.id, rank=rank, category=category)
            session.add(da)

    # Remove mappings that are not in desired list
    for url, da in existing_map.items():
        if url not in desired_urls:
            session.delete(da)

    if commit:
        session.commit()
    else:
        session.flush()


def get_day_articles(session=None, day: Any = None) -> List[Dict]:
    """Return a list of articles for `day` ordered by rank.

    Each item is a dict: { 'rank', 'category', 'article': article.to_dict() }
    """
    if session is None:
        session = models.db.session
    d = _to_date(day or _date.today())
    day_row = session.query(models.Day).filter_by(date=d).first()
    if not day_row:
        return []
    results = (
        session.query(models.DayArticle)
        .filter_by(day_id=day_row.id)
        .order_by(models.DayArticle.rank.asc())
        .all()
    )
    out = []
    for da in results:
        out.append({
            "rank": da.rank,
            "category": da.category,
            "article": da.article.to_dict() if da.article else None,
        })
    return out


def save_article_summary(
    session=None,
    article_id: Optional[int] = None,
    url: Optional[str] = None,
    summary_short: Optional[str] = None,
    summary_long: Optional[str] = None,
    summary_model: Optional[str] = None,
    commit: bool = True,
):
    """Save summary fields onto an Article and return the Article."""
    if session is None:
        session = models.db.session
    if not article_id and not url:
        raise ValueError("article_id or url is required")
    query = session.query(models.Article)
    if article_id:
        art = query.filter_by(id=article_id).first()
    else:
        art = query.filter_by(url=url).first()
    if not art:
        raise ValueError("Article not found for summary")
    if summary_short is not None:
        art.summary_short = summary_short
    if summary_long is not None:
        art.summary_long = summary_long
    if summary_model is not None:
        art.summary_model = summary_model
    art.summary_updated_at = datetime.utcnow().isoformat()
    if commit:
        session.commit()
    else:
        session.flush()
    return art
