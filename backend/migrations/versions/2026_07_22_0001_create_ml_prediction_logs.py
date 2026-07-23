"""create ml_prediction_logs table

Revision ID: s1a2b3c4d5e6
Revises: r1a2b3c4d5e6
Create Date: 2026-07-22 00:01:00.000000

"""
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB
from alembic import op

revision = "s1a2b3c4d5e6"
down_revision = "r1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ml_prediction_logs",
        sa.Column("id", UUID(as_uuid=True), server_default=sa.text("gen_random_uuid()"), primary_key=True),
        sa.Column("model_id", UUID(as_uuid=True), sa.ForeignKey("ml_models.id", name="fk_prediction_logs_ml_models"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", name="fk_prediction_logs_users"), nullable=False),
        sa.Column("input_data", JSONB, nullable=False),
        sa.Column("result", JSONB, nullable=False),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_ml_prediction_logs_model_id", "ml_prediction_logs", ["model_id"])
    op.create_index("ix_ml_prediction_logs_user_id", "ml_prediction_logs", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_ml_prediction_logs_user_id")
    op.drop_index("ix_ml_prediction_logs_model_id")
    op.drop_table("ml_prediction_logs")
