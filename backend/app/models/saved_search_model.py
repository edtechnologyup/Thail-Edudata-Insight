# Module: M3 Search
# Feature: Saved Search Model ตาม #11 #12

import uuid

from sqlalchemy import ForeignKey, String
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel, SoftDeleteMixin


class SavedSearch(SoftDeleteMixin, BaseModel):
    __tablename__ = "saved_searches"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_saved_searches_users"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    filters: Mapped[dict] = mapped_column(JSONB, nullable=False)
