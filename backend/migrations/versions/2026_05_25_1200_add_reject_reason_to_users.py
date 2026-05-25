"""add reject_reason to users

Revision ID: b7c8d9e0f1a2
Revises: a1b2c3d4e5f6
Create Date: 2026-05-25 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "b7c8d9e0f1a2"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("reject_reason", sa.TEXT(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "reject_reason")
