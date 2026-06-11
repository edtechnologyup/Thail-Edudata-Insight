"""add reset token hash to users

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-06-11 15:35:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "c2d3e4f5a6b7"
down_revision = "b1c2d3e4f5a6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("reset_token_hash", sa.VARCHAR(64), nullable=True),
    )
    op.create_index(
        "idx_users_reset_token_hash",
        "users",
        ["reset_token_hash"],
        unique=True,
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index("idx_users_reset_token_hash", table_name="users")
    op.drop_column("users", "reset_token_hash")
