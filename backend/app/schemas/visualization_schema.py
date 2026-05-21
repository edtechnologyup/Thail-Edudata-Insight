# Module: M5 Visualization
# Feature: Request/Response Schemas

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.dataset_schema import DatasetResponse


class DatasetYearStat(BaseModel):
    year: int
    count: int


class StatsOverviewResponse(BaseModel):
    total_datasets: int
    total_downloads: int
    total_agencies: int
    datasets_by_year: list[DatasetYearStat]


class TrendingResponse(BaseModel):
    datasets: list[DatasetResponse]


class NewReleasesResponse(BaseModel):
    datasets: list[DatasetResponse]


class CompareResponse(BaseModel):
    datasets: list[DatasetResponse]


class DashboardLayoutResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    layout: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class DashboardLayoutRequest(BaseModel):
    layout: dict[str, Any]
