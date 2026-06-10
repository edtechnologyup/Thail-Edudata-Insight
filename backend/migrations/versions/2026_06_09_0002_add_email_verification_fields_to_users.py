"""add email verification fields to users

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-06-09 00:02:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "e2f3a4b5c6d7"
down_revision = "d1e2f3a4b5c6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "email_verified_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
    )
    op.add_column(
        "users",
        sa.Column("verify_token", sa.VARCHAR(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column(
            "verify_expires_at",
            sa.TIMESTAMP(timezone=True),
            nullable=True,
        ),
    )
    op.create_unique_constraint(
        "uq_users_verify_token",
        "users",
        ["verify_token"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_users_verify_token", "users")
    op.drop_column("users", "verify_expires_at")
    op.drop_column("users", "verify_token")
    op.drop_column("users", "email_verified_at")
