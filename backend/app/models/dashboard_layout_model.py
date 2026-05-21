# Module: M5 Visualization
# Feature: Dashboard Layout Model ตาม #11 #12

import uuid

from sqlalchemy import ForeignKey
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel


class DashboardLayout(BaseModel):
    __tablename__ = "dashboard_layouts"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_dashboard_layouts_users"),
        nullable=False,
        unique=True,
    )
    layout: Mapped[dict] = mapped_column(JSONB, nullable=False)
