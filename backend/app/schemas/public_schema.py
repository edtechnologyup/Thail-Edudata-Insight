# Module: M7 Public API
# Feature: Response Schemas

import uuid
from datetime import datetime

from pydantic import BaseModel


class DatasetStatsResponse(BaseModel):
    dataset_id: uuid.UUID
    download_count: int
    view_count: int
    quality_score: int | None
    published_at: datetime | None


class PublicAgencyResponse(BaseModel):
    agency_user_id: uuid.UUID
    agency_name: str
    agency_name_en: str | None = None
    agency_type: str | None = None
    agency_website: str | None = None
    contact_email: str | None = None
    contact_phone: str | None = None
    image_url: str | None = None
    dataset_count: int = 0
    total_downloads: int = 0
    total_views: int = 0
