import uuid

from sqlalchemy import Boolean, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel, SoftDeleteMixin


class MLModel(SoftDeleteMixin, BaseModel):
    __tablename__ = "ml_models"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_ml_models_users"),
        nullable=False,
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", name="fk_ml_models_datasets"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(
        Enum(
            "training", "ready", "failed",
            name="ml_model_status",
            create_type=False,
        ),
        nullable=False,
        server_default="training",
    )
    model_type: Mapped[str] = mapped_column(
        Enum(
            "regression", "classification",
            name="ml_model_type",
            create_type=False,
        ),
        nullable=False,
    )
    target_column: Mapped[str] = mapped_column(String(255), nullable=False)
    feature_columns: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    metrics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    file_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    predict_count: Mapped[int] = mapped_column(
        Integer, nullable=False, server_default="0"
    )
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    training_duration: Mapped[float | None] = mapped_column(
        Float, nullable=True
    )
    is_public: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
