"""create consent_type enum and update pdpa

Revision ID: e8f9a0b1c2d3
Revises: d7e8f9a0b1c2
Create Date: 2026-06-09 00:08:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "e8f9a0b1c2d3"
down_revision = "d7e8f9a0b1c2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    consent_type_enum = postgresql.ENUM(
        "terms", "pdpa",
        name="consent_type",
    )
    consent_type_enum.create(op.get_bind())

    op.add_column(
        "pdpa_consents",
        sa.Column(
            "consent_type",
            postgresql.ENUM(
                "terms", "pdpa", name="consent_type", create_type=False
            ),
            nullable=True,
        ),
    )

    op.create_unique_constraint(
        "uq_pdpa_consents_user_consent",
        "pdpa_consents",
        ["user_id", "consent_type"],
    )


def downgrade() -> None:
    op.drop_constraint("uq_pdpa_consents_user_consent", "pdpa_consents")
    op.drop_column("pdpa_consents", "consent_type")

    consent_type_enum = postgresql.ENUM(name="consent_type")
    consent_type_enum.drop(op.get_bind())
