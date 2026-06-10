"""add password reset fields to users

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-06-09 00:03:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "f3a4b5c6d7e8"
down_revision = "e2f3a4b5c6d7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("reset_token", sa.VARCHAR(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "reset_expires_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
    )
    op.create_unique_constraint(
        "uq_users_reset_token",
        "users",
        ["reset_token"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_users_reset_token", "users")
    op.drop_column("users", "reset_expires_at")
    op.drop_column("users", "reset_token")
