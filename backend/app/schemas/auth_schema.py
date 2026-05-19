# Module: M1 Auth
# Feature: Request/Response Schemas ตาม #21 #22

import re
import uuid
from datetime import datetime

from pydantic import BaseModel, Field, field_validator

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class RegisterRequest(BaseModel):
    agency_name: str = Field(min_length=3, max_length=255)
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    pdpa_version: str = Field(min_length=1, max_length=50)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not _EMAIL_RE.match(v.strip()):
            raise ValueError("รูปแบบ Email ไม่ถูกต้อง")
        return v.strip().lower()


class LoginRequest(BaseModel):
    email: str = Field(min_length=5, max_length=255)
    password: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if not _EMAIL_RE.match(v.strip()):
            raise ValueError("รูปแบบ Email ไม่ถูกต้อง")
        return v.strip().lower()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    status: str
    agency_name: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BookmarkRequest(BaseModel):
    dataset_id: uuid.UUID


class BookmarkResponse(BaseModel):
    id: uuid.UUID
    dataset_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class SubscriptionRequest(BaseModel):
    category_id: uuid.UUID | None = None
    agency_user_id: uuid.UUID | None = None


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    category_id: uuid.UUID | None
    agency_user_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}
