from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from datetime import datetime

class Article(db.Model):
    """Canonical stored article row."""
    __tablename__ = "articles"
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.Text, unique=True, nullable=False, index=True)
    title = db.Column(db.Text)
    description = db.Column(db.Text)
    content = db.Column(db.Text)
    source_name = db.Column(db.Text)
    author = db.Column(db.Text)
    url_to_image = db.Column(db.Text)
    published_at = db.Column(db.Text, index=True)
    language = db.Column(db.String(10))
    country = db.Column(db.String(5))
    fetched = db.Column(db.Boolean, default=False)
    fetched_at = db.Column(db.Text)
    fetch_source = db.Column(db.Text)
    summary_short = db.Column(db.Text)
    summary_long = db.Column(db.Text)
    summary_model = db.Column(db.Text)
    summary_updated_at = db.Column(db.Text)
    inserted_at = db.Column(db.Text, default=lambda: datetime.utcnow().isoformat())
    updated_at = db.Column(db.Text, default=lambda: datetime.utcnow().isoformat())

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "title": self.title,
            "description": self.description,
            "content": self.content,
            "source_name": self.source_name,
            "author": self.author,
            "url_to_image": self.url_to_image,
            "published_at": self.published_at,
            "summary_short": self.summary_short,
            "summary_long": self.summary_long,
        }

class Day(db.Model):
    """Day table representing a date (replaces the old Today JSON row)."""
    __tablename__ = "days"
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), unique=True, nullable=False)
    created_at = db.Column(db.Text, default=lambda: datetime.utcnow().isoformat())
    updated_at = db.Column(db.Text, default=lambda: datetime.utcnow().isoformat())
    top_articles = db.relationship("DayArticle", back_populates="day", cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "date": self.date}

class DayArticle(db.Model):
    """Association between a Day and an Article with category and rank."""
    __tablename__ = "day_articles"
    id = db.Column(db.Integer, primary_key=True)
    day_id = db.Column(db.Integer, db.ForeignKey("days.id"), nullable=False, index=True)
    article_id = db.Column(db.Integer, db.ForeignKey("articles.id"), nullable=False, index=True)
    rank = db.Column(db.Integer, nullable=False, default=0)
    category = db.Column(db.Text, nullable=False, default="general")
    notes = db.Column(db.Text)
    inserted_at = db.Column(db.Text, default=lambda: datetime.utcnow().isoformat())

    day = db.relationship("Day", back_populates="top_articles")
    article = db.relationship("Article")
    

