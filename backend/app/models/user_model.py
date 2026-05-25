# Module: M1 Auth
# Feature: User Model ตาม #11 #12

import uuid
from datetime import datetime

from sqlalchemy import Enum, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.base_model import BaseModel, SoftDeleteMixin


class User(SoftDeleteMixin, BaseModel):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[str] = mapped_column(
        Enum("visitor", "agency", "admin", name="user_role", create_type=False),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum(
            "pending",
            "active",
            "rejected",
            "suspended",
            name="user_status",
            create_type=False,
        ),
        nullable=False,
        server_default="pending",
    )
    agency_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    reject_reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
