"""add image_url to announcements

Revision ID: o2a3b4c5d6e7
Revises: n1a2b3c4d5e6
Create Date: 2026-06-26 00:02:00.000000

"""
import sqlalchemy as sa
from alembic import op

revision = "o2a3b4c5d6e7"
down_revision = "n1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("announcements", sa.Column("image_url", sa.String(500), nullable=True))


def downgrade() -> None:
    op.drop_column("announcements", "image_url")
