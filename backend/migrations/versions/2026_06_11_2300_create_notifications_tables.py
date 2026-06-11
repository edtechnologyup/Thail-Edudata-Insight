"""create notifications and notification_reads tables

Revision ID: f5a6b7c8d9e0
Revises: e4f5a6b7c8d9
Create Date: 2026-06-11 23:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "f5a6b7c8d9e0"
down_revision = "e4f5a6b7c8d9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE notification_type AS ENUM (
                'announcement', 'new_dataset', 'scholarship', 'system'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )

    notification_type = postgresql.ENUM(
        "announcement",
        "new_dataset",
        "scholarship",
        "system",
        name="notification_type",
        create_type=False,
    )

    op.create_table(
        "notifications",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("type", notification_type, nullable=False),
        sa.Column("title", sa.VARCHAR(500), nullable=False),
        sa.Column("content", sa.TEXT(), nullable=False),
        sa.Column("link", sa.VARCHAR(500), nullable=True),
        sa.Column("reference_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "is_read",
            sa.Boolean(),
            nullable=False,
            server_default="false",
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_notifications_users",
        ),
    )
    op.create_index(
        "idx_notifications_user_id",
        "notifications",
        ["user_id"],
    )
    op.create_index(
        "idx_notifications_type",
        "notifications",
        ["type"],
    )
    op.create_index(
        "idx_notifications_created_at",
        "notifications",
        ["created_at"],
    )

    op.create_table(
        "notification_reads",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("notification_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "read_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["notification_id"],
            ["notifications.id"],
            name="fk_notification_reads_notifications",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_notification_reads_users",
        ),
        sa.UniqueConstraint(
            "notification_id",
            "user_id",
            name="uq_notification_reads_notification_user",
        ),
    )
    op.create_index(
        "idx_notification_reads_user_id",
        "notification_reads",
        ["user_id"],
    )
    op.create_index(
        "idx_notification_reads_notification_id",
        "notification_reads",
        ["notification_id"],
    )


def downgrade() -> None:
    op.drop_index("idx_notification_reads_notification_id", table_name="notification_reads")
    op.drop_index("idx_notification_reads_user_id", table_name="notification_reads")
    op.drop_table("notification_reads")
    op.drop_index("idx_notifications_created_at", table_name="notifications")
    op.drop_index("idx_notifications_type", table_name="notifications")
    op.drop_index("idx_notifications_user_id", table_name="notifications")
    op.drop_table("notifications")
    op.execute("DROP TYPE IF EXISTS notification_type")
