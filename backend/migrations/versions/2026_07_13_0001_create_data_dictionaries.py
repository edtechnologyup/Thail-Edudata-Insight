"""create data_dictionaries table

Revision ID: p1a2b3c4d5e6
Revises: o2a3b4c5d6e7
Create Date: 2026-07-13 00:01:00.000000

"""
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from alembic import op

revision = "p1a2b3c4d5e6"
down_revision = "o2a3b4c5d6e7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "data_dictionaries",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("dataset_id", UUID(as_uuid=True), sa.ForeignKey("datasets.id", name="fk_data_dictionaries_datasets"), nullable=False),
        sa.Column("file_id", UUID(as_uuid=True), sa.ForeignKey("dataset_files.id", name="fk_data_dictionaries_files"), nullable=False),
        sa.Column("column_name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("data_type", sa.String(50), nullable=True),
        sa.Column("sample_value", sa.Text, nullable=True),
        sa.Column("column_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_data_dictionaries_dataset_file", "data_dictionaries", ["dataset_id", "file_id"])


def downgrade() -> None:
    op.drop_index("ix_data_dictionaries_dataset_file")
    op.drop_table("data_dictionaries")
