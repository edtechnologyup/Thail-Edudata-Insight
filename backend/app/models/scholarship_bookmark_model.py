# Module: Scholarship
# Feature: Scholarship Bookmark Model ตาม #11 #12 #16

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.scholarship_model import Scholarship
    from app.models.user_model import User


class ScholarshipBookmark(Base):
    __tablename__ = "scholarship_bookmarks"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "scholarship_id",
            name="uq_scholarship_bookmarks_user_scholarship",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default="gen_random_uuid()",
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", name="fk_scholarship_bookmarks_users"),
        nullable=False,
    )
    scholarship_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "scholarships.id",
            name="fk_scholarship_bookmarks_scholarships",
        ),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped["User"] = relationship(
        "User",
        foreign_keys=[user_id],
    )
    scholarship: Mapped["Scholarship"] = relationship(
        "Scholarship",
        back_populates="bookmarks",
    )
