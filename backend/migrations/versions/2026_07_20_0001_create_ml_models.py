"""create ml_models table

Revision ID: r1a2b3c4d5e6
Revises: q1a2b3c4d5e6
Create Date: 2026-07-20 00:01:00.000000

"""
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from alembic import op

revision = "r1a2b3c4d5e6"
down_revision = "q1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("DO $$ BEGIN CREATE TYPE ml_model_status AS ENUM ('training', 'ready', 'failed'); EXCEPTION WHEN duplicate_object THEN NULL; END $$")
    op.execute("DO $$ BEGIN CREATE TYPE ml_model_type AS ENUM ('regression', 'classification'); EXCEPTION WHEN duplicate_object THEN NULL; END $$")

    op.create_table(
        "ml_models",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", name="fk_ml_models_users"), nullable=False),
        sa.Column("dataset_id", UUID(as_uuid=True), sa.ForeignKey("datasets.id", name="fk_ml_models_datasets"), nullable=False),
        sa.Column("name", sa.String(500), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.Enum("training", "ready", "failed", name="ml_model_status", create_type=False), nullable=False, server_default="training"),
        sa.Column("model_type", sa.Enum("regression", "classification", name="ml_model_type", create_type=False), nullable=False, server_default="regression"),
        sa.Column("target_column", sa.String(255), nullable=False),
        sa.Column("feature_columns", JSONB, nullable=True),
        sa.Column("metrics", JSONB, nullable=True),
        sa.Column("file_path", sa.String(500), nullable=True),
        sa.Column("predict_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("training_duration", sa.Float, nullable=True),
        sa.Column("is_public", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("is_deleted", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ml_models_user_id", "ml_models", ["user_id"])
    op.create_index("ix_ml_models_dataset_id", "ml_models", ["dataset_id"])


def downgrade() -> None:
    op.drop_index("ix_ml_models_dataset_id")
    op.drop_index("ix_ml_models_user_id")
    op.drop_table("ml_models")
    op.execute("DROP TYPE ml_model_type")
    op.execute("DROP TYPE ml_model_status")
