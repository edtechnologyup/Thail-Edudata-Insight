"""add source to download_logs

Revision ID: d3e4f5a6b7c8
Revises: c2d3e4f5a6b7
Create Date: 2026-06-11 21:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "d3e4f5a6b7c8"
down_revision = "c2d3e4f5a6b7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    download_source = postgresql.ENUM("web", "api", name="download_source")
    download_source.create(op.get_bind(), checkfirst=True)

    # nullable เสมอตามกฎ #18 — แถวเก่าเป็น NULL (แยก web/api ย้อนหลังไม่ได้)
    op.add_column(
        "download_logs",
        sa.Column(
            "source",
            postgresql.ENUM("web", "api", name="download_source", create_type=False),
            nullable=True,
        ),
    )
    op.create_index(
        "idx_download_logs_source",
        "download_logs",
        ["source"],
        if_not_exists=True,
    )


def downgrade() -> None:
    op.drop_index("idx_download_logs_source", table_name="download_logs")
    op.drop_column("download_logs", "source")
    postgresql.ENUM(name="download_source").drop(op.get_bind(), checkfirst=True)
