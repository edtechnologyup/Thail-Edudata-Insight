"""create email_logs table

Revision ID: f9a0b1c2d3e4
Revises: e8f9a0b1c2d3
Create Date: 2026-06-09 00:09:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "f9a0b1c2d3e4"
down_revision = "e8f9a0b1c2d3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "email_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("template_name", sa.VARCHAR(100), nullable=False),
        sa.Column("recipient_email", sa.VARCHAR(255), nullable=False),
        sa.Column("subject", sa.VARCHAR(500), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(
                "pending",
                "sent",
                "delivered",
                "bounced",
                "failed",
                "complained",
                name="email_status",
                create_type=False,
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("error_message", sa.TEXT(), nullable=True),
        sa.Column(
            "retry_count",
            sa.INTEGER(),
            nullable=False,
            server_default="0",
        ),
        sa.Column("provider_message_id", sa.VARCHAR(255), nullable=True),
        sa.Column("sent_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_email_logs_users",
            ondelete="SET NULL",
        ),
    )
    op.create_index("idx_email_logs_user_id", "email_logs", ["user_id"])
    op.create_index(
        "idx_email_logs_recipient_email", "email_logs", ["recipient_email"]
    )
    op.create_index("idx_email_logs_status", "email_logs", ["status"])
    op.create_index("idx_email_logs_created_at", "email_logs", ["created_at"])


def downgrade() -> None:
    op.drop_index("idx_email_logs_created_at", table_name="email_logs")
    op.drop_index("idx_email_logs_status", table_name="email_logs")
    op.drop_index("idx_email_logs_recipient_email", table_name="email_logs")
    op.drop_index("idx_email_logs_user_id", table_name="email_logs")
    op.drop_table("email_logs")
