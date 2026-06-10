"""add user_agent to audit_logs

Revision ID: a0b1c2d3e4f5
Revises: f9a0b1c2d3e4
Create Date: 2026-06-09 00:10:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "a0b1c2d3e4f5"
down_revision = "f9a0b1c2d3e4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "audit_logs",
        sa.Column("user_agent", sa.VARCHAR(500), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("audit_logs", "user_agent")
