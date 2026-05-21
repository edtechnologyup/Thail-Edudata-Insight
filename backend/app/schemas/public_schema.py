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
