# Alembic Migration Guide

This project now uses Alembic for database migrations with PostgreSQL.

## Environment Variables

The migration system uses the `DATABASE_URL` environment variable from your `.env` file:
```
DATABASE_URL=postgresql://postgres:yWcFSGUoYKRWApdcHRlJXYyRXIiDDkEO@postgres.railway.internal:5432/railway
```

## Common Commands

**Note:** These commands should be run from the `backend` directory and require access to the database.

### Check current migration status
```bash
python -m alembic current
```

### Apply all pending migrations
```bash
python -m alembic upgrade head
```

### Rollback one migration
```bash
python -m alembic downgrade -1
```

### Create a new migration (after model changes)
```bash
python -m alembic revision --autogenerate -m "Description of changes"
```

### View migration history
```bash
python -m alembic history
```

## Initial Migration

An initial migration has been created that includes:
- **articles** table: Stores article data with fields for URL, title, content, summaries, etc.
- **days** table: Represents individual dates
- **day_articles** table: Links articles to days with ranking and categorization

## Running Migrations on Railway

When deploying to Railway, migrations will need to be run using the public database URL. The internal hostname `postgres.railway.internal` is only accessible from within Railway's network.

For Railway deployments, you can:
1. Add a migration step to your Procfile
2. Run migrations manually via Railway's CLI or dashboard
3. Use a public database URL for local development

## Files Structure

- `alembic.ini` - Main Alembic configuration
- `alembic/env.py` - Migration environment setup (uses DATABASE_URL from .env)
- `alembic/versions/` - Individual migration files
- `models.py` - SQLAlchemy models that migrations are based on
