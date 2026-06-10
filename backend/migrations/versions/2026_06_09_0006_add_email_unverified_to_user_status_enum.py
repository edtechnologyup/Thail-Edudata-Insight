"""add email_unverified to user_status enum

Revision ID: c6d7e8f9a0b1
Revises: b5c6d7e8f9a0
Create Date: 2026-06-09 00:06:00.000000

"""
from alembic import op

revision = "c6d7e8f9a0b1"
down_revision = "b5c6d7e8f9a0"
branch_labels = None
depends_on = None
transaction = False


def upgrade() -> None:
    connection = op.get_bind()

    raw_conn = connection.connection
    old_isolation = raw_conn.isolation_level
    raw_conn.set_isolation_level(0)

    raw_conn.cursor().execute(
        "ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'email_unverified'"
    )

    raw_conn.set_isolation_level(old_isolation)

    op.execute(
        "ALTER TABLE users ALTER COLUMN status SET DEFAULT 'email_unverified'"
    )


def downgrade() -> None:
    op.execute(
        "ALTER TABLE users ALTER COLUMN status SET DEFAULT 'pending'"
    )
