"""create new indexes

Revision ID: b1c2d3e4f5a6
Revises: a0b1c2d3e4f5
Create Date: 2026-06-09 00:11:00.000000

"""
from alembic import op

revision = "b1c2d3e4f5a6"
down_revision = "a0b1c2d3e4f5"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "idx_users_status", "users", ["status"], if_not_exists=True
    )
    op.create_index(
        "idx_users_agency_type", "users", ["agency_type"], if_not_exists=True
    )
    op.create_index(
        "idx_users_verify_token",
        "users",
        ["verify_token"],
        unique=True,
        if_not_exists=True,
    )
    op.create_index(
        "idx_users_reset_token",
        "users",
        ["reset_token"],
        unique=True,
        if_not_exists=True,
    )
    op.create_index(
        "idx_users_locked_until",
        "users",
        ["locked_until"],
        if_not_exists=True,
    )
    op.create_index(
        "idx_pdpa_consents_consent_type",
        "pdpa_consents",
        ["consent_type"],
        if_not_exists=True,
    )
    op.create_index(
        "idx_audit_logs_action",
        "audit_logs",
        ["action"],
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index("idx_audit_logs_action", table_name="audit_logs")
    op.drop_index(
        "idx_pdpa_consents_consent_type", table_name="pdpa_consents"
    )
    op.drop_index("idx_users_locked_until", table_name="users")
    op.drop_index("idx_users_reset_token", table_name="users")
    op.drop_index("idx_users_verify_token", table_name="users")
    op.drop_index("idx_users_agency_type", table_name="users")
    op.drop_index("idx_users_status", table_name="users")
