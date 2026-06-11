"""add sql and pdf to file_format enum

Revision ID: e4f5a6b7c8d9
Revises: d3e4f5a6b7c8
Create Date: 2026-06-11 22:30:00.000000

"""
from alembic import op

revision = "e4f5a6b7c8d9"
down_revision = "d3e4f5a6b7c8"
branch_labels = None
depends_on = None
transaction = False


def upgrade() -> None:
    connection = op.get_bind()
    raw_conn = connection.connection
    old_isolation = raw_conn.isolation_level
    raw_conn.set_isolation_level(0)

    cursor = raw_conn.cursor()
    cursor.execute("ALTER TYPE file_format ADD VALUE IF NOT EXISTS 'sql'")
    cursor.execute("ALTER TYPE file_format ADD VALUE IF NOT EXISTS 'pdf'")

    raw_conn.set_isolation_level(old_isolation)


def downgrade() -> None:
    # PostgreSQL ไม่รองรับการลบค่า ENUM โดยตรง — คงไว้ตามกฎ deprecate
    pass
