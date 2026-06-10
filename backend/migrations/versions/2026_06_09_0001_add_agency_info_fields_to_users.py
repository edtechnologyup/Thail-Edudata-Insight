"""add agency info fields to users

Revision ID: d1e2f3a4b5c6
Revises: c8d9e0f1a2b3
Create Date: 2026-06-09 00:01:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = "d1e2f3a4b5c6"
down_revision = "c8d9e0f1a2b3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("agency_name_en", sa.VARCHAR(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("agency_code", sa.VARCHAR(100), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("agency_website", sa.VARCHAR(500), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("contact_name", sa.VARCHAR(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("contact_position", sa.VARCHAR(255), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("contact_phone", sa.VARCHAR(50), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("verification_doc_path", sa.VARCHAR(500), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("suspend_reason", sa.TEXT(), nullable=True),
    )
    op.add_column(
        "users",
        sa.Column("agency_type", sa.VARCHAR(50), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "agency_type")
    op.drop_column("users", "suspend_reason")
    op.drop_column("users", "verification_doc_path")
    op.drop_column("users", "contact_phone")
    op.drop_column("users", "contact_position")
    op.drop_column("users", "contact_name")
    op.drop_column("users", "agency_website")
    op.drop_column("users", "agency_code")
    op.drop_column("users", "agency_name_en")
