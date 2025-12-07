"""Create DB tables for SQLAlchemy models.

Run from the `backend` folder with the same Python environment used by the app:

PowerShell:
    python .\create_tables.py

This will use `DATABASE_URL` if set, otherwise the default sqlite file configured in `main.py`.
"""
from main import app
from models import db

with app.app_context():
    print("Creating tables (if missing) using SQLALCHEMY_DATABASE_URI=", app.config.get("SQLALCHEMY_DATABASE_URI"))
    db.create_all()
    print("Tables created (or already exist).")
