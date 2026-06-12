"""create scholarship tables

Revision ID: g6b7c8d9e0f1
Revises: f5a6b7c8d9e0
Create Date: 2026-06-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "g6b7c8d9e0f1"
down_revision = "f5a6b7c8d9e0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE scholarship_type AS ENUM (
                'government', 'university', 'private',
                'foundation', 'exchange', 'other'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE education_level AS ENUM (
                'high_school', 'bachelor', 'master', 'doctoral', 'any'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE scholarship_status AS ENUM (
                'draft', 'published'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )
    op.execute(
        """
        DO $$ BEGIN
            CREATE TYPE scholarship_source AS ENUM (
                'agency', 'data_go_th', 'api'
            );
        EXCEPTION
            WHEN duplicate_object THEN NULL;
        END $$;
        """
    )

    scholarship_type = postgresql.ENUM(
        "government",
        "university",
        "private",
        "foundation",
        "exchange",
        "other",
        name="scholarship_type",
        create_type=False,
    )
    education_level = postgresql.ENUM(
        "high_school",
        "bachelor",
        "master",
        "doctoral",
        "any",
        name="education_level",
        create_type=False,
    )
    scholarship_status = postgresql.ENUM(
        "draft",
        "published",
        name="scholarship_status",
        create_type=False,
    )
    scholarship_source = postgresql.ENUM(
        "agency",
        "data_go_th",
        "api",
        name="scholarship_source",
        create_type=False,
    )

    op.create_table(
        "scholarships",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.VARCHAR(500), nullable=False),
        sa.Column("description", sa.TEXT(), nullable=True),
        sa.Column("scholarship_type", scholarship_type, nullable=False),
        sa.Column("target_level", education_level, nullable=False),
        sa.Column("amount", sa.Numeric(15, 2), nullable=True),
        sa.Column("amount_note", sa.VARCHAR(500), nullable=True),
        sa.Column("eligibility", sa.TEXT(), nullable=False),
        sa.Column("application_url", sa.VARCHAR(500), nullable=True),
        sa.Column("contact_phone", sa.VARCHAR(50), nullable=True),
        sa.Column("contact_email", sa.VARCHAR(255), nullable=True),
        sa.Column("open_date", sa.DATE(), nullable=False),
        sa.Column("close_date", sa.DATE(), nullable=False),
        sa.Column(
            "status",
            scholarship_status,
            nullable=False,
            server_default="draft",
        ),
        sa.Column(
            "source",
            scholarship_source,
            nullable=False,
            server_default="agency",
        ),
        sa.Column("external_id", sa.VARCHAR(255), nullable=True),
        sa.Column(
            "is_deleted",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("published_at", sa.TIMESTAMP(timezone=True), nullable=True),
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
            ["created_by"],
            ["users.id"],
            name="fk_scholarships_users",
        ),
    )
    op.create_index("idx_scholarships_status", "scholarships", ["status"])
    op.create_index("idx_scholarships_created_by", "scholarships", ["created_by"])
    op.create_index(
        "idx_scholarships_scholarship_type",
        "scholarships",
        ["scholarship_type"],
    )
    op.create_index(
        "idx_scholarships_target_level",
        "scholarships",
        ["target_level"],
    )
    op.create_index("idx_scholarships_close_date", "scholarships", ["close_date"])
    op.create_index("idx_scholarships_source", "scholarships", ["source"])
    op.create_index("idx_scholarships_is_deleted", "scholarships", ["is_deleted"])

    op.create_table(
        "scholarship_bookmarks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("scholarship_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name="fk_scholarship_bookmarks_users",
        ),
        sa.ForeignKeyConstraint(
            ["scholarship_id"],
            ["scholarships.id"],
            name="fk_scholarship_bookmarks_scholarships",
        ),
        sa.UniqueConstraint(
            "user_id",
            "scholarship_id",
            name="uq_scholarship_bookmarks_user_scholarship",
        ),
    )
    op.create_index(
        "idx_scholarship_bookmarks_user_id",
        "scholarship_bookmarks",
        ["user_id"],
    )
    op.create_index(
        "idx_scholarship_bookmarks_scholarship_id",
        "scholarship_bookmarks",
        ["scholarship_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "idx_scholarship_bookmarks_scholarship_id",
        table_name="scholarship_bookmarks",
    )
    op.drop_index(
        "idx_scholarship_bookmarks_user_id",
        table_name="scholarship_bookmarks",
    )
    op.drop_table("scholarship_bookmarks")

    op.drop_index("idx_scholarships_is_deleted", table_name="scholarships")
    op.drop_index("idx_scholarships_source", table_name="scholarships")
    op.drop_index("idx_scholarships_close_date", table_name="scholarships")
    op.drop_index("idx_scholarships_target_level", table_name="scholarships")
    op.drop_index("idx_scholarships_scholarship_type", table_name="scholarships")
    op.drop_index("idx_scholarships_created_by", table_name="scholarships")
    op.drop_index("idx_scholarships_status", table_name="scholarships")
    op.drop_table("scholarships")

    op.execute("DROP TYPE IF EXISTS scholarship_source")
    op.execute("DROP TYPE IF EXISTS scholarship_status")
    op.execute("DROP TYPE IF EXISTS education_level")
    op.execute("DROP TYPE IF EXISTS scholarship_type")
