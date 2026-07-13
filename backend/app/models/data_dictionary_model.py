import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel


class DataDictionary(BaseModel):
    __tablename__ = "data_dictionaries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("datasets.id", name="fk_data_dictionaries_datasets"),
        nullable=False,
    )
    file_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("dataset_files.id", name="fk_data_dictionaries_files"),
        nullable=False,
    )
    column_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    data_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    sample_value: Mapped[str | None] = mapped_column(Text, nullable=True)
    column_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
