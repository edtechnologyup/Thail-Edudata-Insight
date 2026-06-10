"""create email_status enum

Revision ID: d7e8f9a0b1c2
Revises: c6d7e8f9a0b1
Create Date: 2026-06-09 00:07:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "d7e8f9a0b1c2"
down_revision = "c6d7e8f9a0b1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    email_status_enum = postgresql.ENUM(
        "pending", "sent", "delivered", "bounced", "failed", "complained",
        name="email_status",
    )
    email_status_enum.create(op.get_bind())


def downgrade() -> None:
    email_status_enum = postgresql.ENUM(name="email_status")
    email_status_enum.drop(op.get_bind())
