"""Initial migration

Revision ID: 8a8aededeaa1
Revises: 
Create Date: 2025-12-07 16:20:25.661674

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a8aededeaa1'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create articles table
    op.create_table(
        'articles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('title', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('source_name', sa.Text(), nullable=True),
        sa.Column('author', sa.Text(), nullable=True),
        sa.Column('url_to_image', sa.Text(), nullable=True),
        sa.Column('published_at', sa.Text(), nullable=True),
        sa.Column('language', sa.String(length=10), nullable=True),
        sa.Column('country', sa.String(length=5), nullable=True),
        sa.Column('fetched', sa.Boolean(), nullable=True),
        sa.Column('fetched_at', sa.Text(), nullable=True),
        sa.Column('fetch_source', sa.Text(), nullable=True),
        sa.Column('summary_short', sa.Text(), nullable=True),
        sa.Column('summary_long', sa.Text(), nullable=True),
        sa.Column('summary_model', sa.Text(), nullable=True),
        sa.Column('summary_updated_at', sa.Text(), nullable=True),
        sa.Column('inserted_at', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_articles_published_at'), 'articles', ['published_at'], unique=False)
    op.create_index(op.f('ix_articles_url'), 'articles', ['url'], unique=True)

    # Create days table
    op.create_table(
        'days',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('created_at', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('date')
    )

    # Create day_articles table
    op.create_table(
        'day_articles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('day_id', sa.Integer(), nullable=False),
        sa.Column('article_id', sa.Integer(), nullable=False),
        sa.Column('rank', sa.Integer(), nullable=False),
        sa.Column('category', sa.Text(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('inserted_at', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['article_id'], ['articles.id'], ),
        sa.ForeignKeyConstraint(['day_id'], ['days.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_day_articles_article_id'), 'day_articles', ['article_id'], unique=False)
    op.create_index(op.f('ix_day_articles_day_id'), 'day_articles', ['day_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables in reverse order
    op.drop_index(op.f('ix_day_articles_day_id'), table_name='day_articles')
    op.drop_index(op.f('ix_day_articles_article_id'), table_name='day_articles')
    op.drop_table('day_articles')
    op.drop_table('days')
    op.drop_index(op.f('ix_articles_url'), table_name='articles')
    op.drop_index(op.f('ix_articles_published_at'), table_name='articles')
    op.drop_table('articles')
