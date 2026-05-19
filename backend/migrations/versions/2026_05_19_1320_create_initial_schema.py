"""create initial schema

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-05-19 13:20:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "a1b2c3d4e5f6"
down_revision = None
branch_labels = None
depends_on = None

_user_role = postgresql.ENUM("visitor", "agency", "admin", name="user_role")
_user_status = postgresql.ENUM(
    "pending", "active", "rejected", "suspended", name="user_status"
)
_dataset_status = postgresql.ENUM(
    "draft", "submitted", "published", "rejected", name="dataset_status"
)
_dataset_license = postgresql.ENUM("open", "conditional", "cc", name="dataset_license")
_file_format = postgresql.ENUM("csv", "excel", "json", "xml", name="file_format")


def upgrade() -> None:
    # ------------------------------------------------------------------ #
    # ENUM Types ตาม #14  (checkfirst=True เพื่อความปลอดภัย)            #
    # ------------------------------------------------------------------ #
    _user_role.create(op.get_bind(), checkfirst=True)
    _user_status.create(op.get_bind(), checkfirst=True)
    _dataset_status.create(op.get_bind(), checkfirst=True)
    _dataset_license.create(op.get_bind(), checkfirst=True)
    _file_format.create(op.get_bind(), checkfirst=True)

    # ------------------------------------------------------------------ #
    # ลำดับที่ 1 — users  (#12, #15, #16)                                #
    # ------------------------------------------------------------------ #
    op.create_table(
        "users",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("email", sa.VARCHAR(255), nullable=False),
        sa.Column("password_hash", sa.VARCHAR(255), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("visitor", "agency", "admin", name="user_role", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "status",
            postgresql.ENUM(
                "pending", "active", "rejected", "suspended",
                name="user_status", create_type=False,
            ),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("agency_name", sa.VARCHAR(255), nullable=True),
        sa.Column(
            "is_deleted",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("false"),
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
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("idx_users_email", "users", ["email"])
    op.create_index("idx_users_role", "users", ["role"])
    op.create_index("idx_users_is_deleted", "users", ["is_deleted"])

    # ------------------------------------------------------------------ #
    # ลำดับที่ 2 — categories  (#12, #15, #16)                           #
    # ------------------------------------------------------------------ #
    op.create_table(
        "categories",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("parent_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("level", sa.INTEGER, nullable=False, server_default="1"),
        sa.Column("name_th", sa.VARCHAR(255), nullable=False),
        sa.Column("name_en", sa.VARCHAR(255), nullable=False),
        sa.Column("slug", sa.VARCHAR(255), nullable=False),
        sa.Column(
            "is_deleted",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("false"),
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
            ["parent_id"], ["categories.id"], name="fk_categories_categories"
        ),
        sa.ForeignKeyConstraint(
            ["created_by"], ["users.id"], name="fk_categories_users"
        ),
        sa.UniqueConstraint("slug", name="uq_categories_slug"),
    )
    op.create_index("idx_categories_slug", "categories", ["slug"])
    op.create_index("idx_categories_parent_id", "categories", ["parent_id"])
    op.create_index("idx_categories_level", "categories", ["level"])

    # ------------------------------------------------------------------ #
    # ลำดับที่ 3 — tags  (#12, #15, #16)                                 #
    # ------------------------------------------------------------------ #
    op.create_table(
        "tags",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("name", sa.VARCHAR(100), nullable=False),
        sa.Column(
            "is_deleted",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("false"),
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
        sa.UniqueConstraint("name", name="uq_tags_name"),
    )
    op.create_index("idx_tags_name", "tags", ["name"])

    # ------------------------------------------------------------------ #
    # ลำดับที่ 4 — datasets  (#12, #15, #16)                             #
    # ------------------------------------------------------------------ #
    op.create_table(
        "datasets",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.VARCHAR(500), nullable=False),
        sa.Column("description", sa.TEXT, nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM(
                "draft", "submitted", "published", "rejected",
                name="dataset_status", create_type=False,
            ),
            nullable=False,
            server_default="draft",
        ),
        sa.Column(
            "license",
            postgresql.ENUM("open", "conditional", "cc", name="dataset_license", create_type=False),
            nullable=False,
        ),
        sa.Column("metadata", postgresql.JSONB, nullable=True),
        sa.Column("quality_score", sa.INTEGER, nullable=True),
        sa.Column(
            "download_count", sa.INTEGER, nullable=False, server_default="0"
        ),
        sa.Column("view_count", sa.INTEGER, nullable=False, server_default="0"),
        sa.Column("reject_comment", sa.TEXT, nullable=True),
        sa.Column("published_at", sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column(
            "is_deleted",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("false"),
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
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], name="fk_datasets_users"),
        sa.ForeignKeyConstraint(
            ["category_id"], ["categories.id"], name="fk_datasets_categories"
        ),
    )
    op.create_index("idx_datasets_status", "datasets", ["status"])
    op.create_index("idx_datasets_user_id", "datasets", ["user_id"])
    op.create_index("idx_datasets_category_id", "datasets", ["category_id"])
    op.create_index("idx_datasets_is_deleted", "datasets", ["is_deleted"])
    op.create_index("idx_datasets_published_at", "datasets", ["published_at"])

    # ------------------------------------------------------------------ #
    # ลำดับที่ 5 — dataset_versions  (#12, #16 ไม่มี updated_at)         #
    # ------------------------------------------------------------------ #
    op.create_table(
        "dataset_versions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.INTEGER, nullable=False),
        sa.Column("file_path", sa.VARCHAR(500), nullable=False),
        sa.Column("changelog", sa.TEXT, nullable=True),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"], name="fk_dataset_versions_datasets"
        ),
        sa.ForeignKeyConstraint(
            ["created_by"], ["users.id"], name="fk_dataset_versions_users"
        ),
    )
    op.create_index(
        "idx_dataset_versions_dataset_id", "dataset_versions", ["dataset_id"]
    )
    op.create_index(
        "uq_dataset_versions_dataset_version",
        "dataset_versions",
        ["dataset_id", "version_number"],
        unique=True,
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 6 — dataset_files  (#12, #15, #16)                        #
    # ------------------------------------------------------------------ #
    op.create_table(
        "dataset_files",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("file_name", sa.VARCHAR(255), nullable=False),
        sa.Column("file_path", sa.VARCHAR(500), nullable=False),
        sa.Column("file_size", sa.BIGINT, nullable=False),
        sa.Column(
            "file_format",
            postgresql.ENUM("csv", "excel", "json", "xml", name="file_format", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "is_deleted",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("false"),
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
            ["dataset_id"], ["datasets.id"], name="fk_dataset_files_datasets"
        ),
    )
    op.create_index(
        "idx_dataset_files_dataset_id", "dataset_files", ["dataset_id"]
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 7 — dataset_tags  (#12, #16 ไม่มี id, ไม่มี updated_at)  #
    # ------------------------------------------------------------------ #
    op.create_table(
        "dataset_tags",
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("tag_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"], name="fk_dataset_tags_datasets"
        ),
        sa.ForeignKeyConstraint(
            ["tag_id"], ["tags.id"], name="fk_dataset_tags_tags"
        ),
        sa.UniqueConstraint(
            "dataset_id", "tag_id", name="uq_dataset_tags_dataset_tag"
        ),
    )
    op.create_index(
        "idx_dataset_tags_dataset_id", "dataset_tags", ["dataset_id"]
    )
    op.create_index("idx_dataset_tags_tag_id", "dataset_tags", ["tag_id"])

    # ------------------------------------------------------------------ #
    # ลำดับที่ 8 — bookmarks  (#12, #16 ไม่มี updated_at)               #
    # ------------------------------------------------------------------ #
    op.create_table(
        "bookmarks",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_bookmarks_users"
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"], name="fk_bookmarks_datasets"
        ),
    )
    op.create_index("idx_bookmarks_user_id", "bookmarks", ["user_id"])
    op.create_index(
        "uq_bookmarks_user_dataset",
        "bookmarks",
        ["user_id", "dataset_id"],
        unique=True,
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 9 — subscriptions  (#12, #16 ไม่มี updated_at)           #
    # ------------------------------------------------------------------ #
    op.create_table(
        "subscriptions",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("agency_user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_subscriptions_users"
        ),
        sa.ForeignKeyConstraint(
            ["category_id"], ["categories.id"], name="fk_subscriptions_categories"
        ),
        sa.ForeignKeyConstraint(
            ["agency_user_id"], ["users.id"], name="fk_subscriptions_agency_users"
        ),
    )
    op.create_index("idx_subscriptions_user_id", "subscriptions", ["user_id"])
    op.create_index(
        "uq_subscriptions_user_category",
        "subscriptions",
        ["user_id", "category_id"],
        unique=True,
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 10 — saved_searches  (#12, #15, #16)                      #
    # ------------------------------------------------------------------ #
    op.create_table(
        "saved_searches",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.VARCHAR(255), nullable=False),
        sa.Column("filters", postgresql.JSONB, nullable=False),
        sa.Column(
            "is_deleted",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("false"),
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
            ["user_id"], ["users.id"], name="fk_saved_searches_users"
        ),
    )
    op.create_index(
        "idx_saved_searches_user_id", "saved_searches", ["user_id"]
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 11 — download_logs  (#12, #16 ไม่มี updated_at)          #
    # ------------------------------------------------------------------ #
    op.create_table(
        "download_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("ip_address", sa.VARCHAR(45), nullable=False),
        sa.Column("purpose", sa.TEXT, nullable=False),
        sa.Column(
            "file_format",
            postgresql.ENUM("csv", "excel", "json", "xml", name="file_format", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"], name="fk_download_logs_datasets"
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_download_logs_users"
        ),
    )
    op.create_index(
        "idx_download_logs_dataset_id", "download_logs", ["dataset_id"]
    )
    op.create_index("idx_download_logs_user_id", "download_logs", ["user_id"])
    op.create_index(
        "idx_download_logs_created_at", "download_logs", ["created_at"]
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 12 — dashboard_layouts  (#12, #16)                        #
    # ------------------------------------------------------------------ #
    op.create_table(
        "dashboard_layouts",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("layout", postgresql.JSONB, nullable=False),
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
            ["user_id"], ["users.id"], name="fk_dashboard_layouts_users"
        ),
        sa.UniqueConstraint("user_id", name="uq_dashboard_layouts_user_id"),
    )
    op.create_index(
        "idx_dashboard_layouts_user_id", "dashboard_layouts", ["user_id"]
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 13 — announcements  (#12, #15, #16)                       #
    # ------------------------------------------------------------------ #
    op.create_table(
        "announcements",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.VARCHAR(500), nullable=False),
        sa.Column("content", sa.TEXT, nullable=False),
        sa.Column(
            "is_active",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("true"),
        ),
        sa.Column(
            "is_deleted",
            sa.BOOLEAN,
            nullable=False,
            server_default=sa.text("false"),
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
            ["created_by"], ["users.id"], name="fk_announcements_users"
        ),
    )
    op.create_index(
        "idx_announcements_is_active", "announcements", ["is_active"]
    )

    # ------------------------------------------------------------------ #
    # ลำดับที่ 14 — audit_logs  (#12, #16 ไม่มี updated_at)             #
    # ------------------------------------------------------------------ #
    op.create_table(
        "audit_logs",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.VARCHAR(100), nullable=False),
        sa.Column("target_type", sa.VARCHAR(100), nullable=False),
        sa.Column("target_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("detail", postgresql.JSONB, nullable=True),
        sa.Column("ip_address", sa.VARCHAR(45), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_audit_logs_users"
        ),
    )
    op.create_index("idx_audit_logs_user_id", "audit_logs", ["user_id"])
    op.create_index("idx_audit_logs_created_at", "audit_logs", ["created_at"])

    # ------------------------------------------------------------------ #
    # ลำดับที่ 15 — pdpa_consents  (#12, #16 ไม่มี updated_at)          #
    # ------------------------------------------------------------------ #
    op.create_table(
        "pdpa_consents",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version", sa.VARCHAR(50), nullable=False),
        sa.Column(
            "consented_at",
            sa.TIMESTAMP(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column("ip_address", sa.VARCHAR(45), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"], name="fk_pdpa_consents_users"
        ),
    )
    op.create_index("idx_pdpa_consents_user_id", "pdpa_consents", ["user_id"])


def downgrade() -> None:
    # ------------------------------------------------------------------ #
    # Drop tables ลำดับย้อนกลับ (FK order) ตาม #18                      #
    # ------------------------------------------------------------------ #
    op.drop_table("pdpa_consents")
    op.drop_table("audit_logs")
    op.drop_table("announcements")
    op.drop_table("dashboard_layouts")
    op.drop_table("download_logs")
    op.drop_table("saved_searches")
    op.drop_table("subscriptions")
    op.drop_table("bookmarks")
    op.drop_table("dataset_tags")
    op.drop_table("dataset_files")
    op.drop_table("dataset_versions")
    op.drop_table("datasets")
    op.drop_table("tags")
    op.drop_table("categories")
    op.drop_table("users")

    # ------------------------------------------------------------------ #
    # Drop ENUM types ลำดับย้อนกลับ ตาม #14                             #
    # ------------------------------------------------------------------ #
    _file_format.drop(op.get_bind(), checkfirst=True)
    _dataset_license.drop(op.get_bind(), checkfirst=True)
    _dataset_status.drop(op.get_bind(), checkfirst=True)
    _user_status.drop(op.get_bind(), checkfirst=True)
    _user_role.drop(op.get_bind(), checkfirst=True)
