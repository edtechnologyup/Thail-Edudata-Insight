"""create agency_type enum

Revision ID: b5c6d7e8f9a0
Revises: a4b5c6d7e8f9
Create Date: 2026-06-09 00:05:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "b5c6d7e8f9a0"
down_revision = "a4b5c6d7e8f9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    agency_type_enum = postgresql.ENUM(
        "central", "regional", "local", "educational", "other",
        name="agency_type",
    )
    agency_type_enum.create(op.get_bind())

    op.execute("""
        UPDATE users
        SET agency_type = NULL
        WHERE agency_type IS NOT NULL
        AND agency_type NOT IN
        ('central','regional','local','educational','other')
    """)

    op.execute("""
        ALTER TABLE users
        ALTER COLUMN agency_type
        TYPE agency_type
        USING agency_type::agency_type
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE users
        ALTER COLUMN agency_type
        TYPE VARCHAR(50)
        USING agency_type::text
    """)

    agency_type_enum = postgresql.ENUM(name="agency_type")
    agency_type_enum.drop(op.get_bind())
