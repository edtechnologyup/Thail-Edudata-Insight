"""add site_settings table and image_url to notifications

Revision ID: n1a2b3c4d5e6
Revises: m2b3c4d5e6f7
Create Date: 2026-06-26 00:01:00.000000

"""
import sqlalchemy as sa
from alembic import op

revision = "n1a2b3c4d5e6"
down_revision = "m2b3c4d5e6f7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "site_settings",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("value", sa.Text, server_default="", nullable=False),
        sa.Column("enabled", sa.Boolean, server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.add_column("notifications", sa.Column("image_url", sa.String(500), nullable=True))

    op.execute(
        "INSERT INTO site_settings (key, value, enabled) VALUES "
        "('ribbon_image_url', '', false), "
        "('grayscale', '', false)"
    )


def downgrade() -> None:
    op.drop_column("notifications", "image_url")
    op.drop_table("site_settings")
