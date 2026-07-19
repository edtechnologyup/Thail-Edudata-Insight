import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MLModelCreateRequest(BaseModel):
    dataset_id: uuid.UUID
    name: str = Field(min_length=1, max_length=500)
    description: str | None = None
    target_column: str = Field(min_length=1, max_length=255)
    feature_columns: list[str] = Field(min_length=1)


class MLModelUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=500)
    description: str | None = None
    is_public: bool | None = None


class MLModelPredictRequest(BaseModel):
    input_data: dict[str, Any]


class MLModelResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    dataset_id: uuid.UUID
    name: str
    description: str | None
    status: str
    model_type: str | None
    target_column: str
    feature_columns: list[str] | None
    metrics: dict[str, Any] | None
    predict_count: int
    training_duration: float | None
    is_public: bool
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime
    agency_name: str | None = None
    dataset_title: str | None = None

    model_config = {"from_attributes": True}


class DatasetColumnsResponse(BaseModel):
    column_name: str
    dtype: str
    sample_values: list[Any] = Field(default_factory=list)
    unique_count: int = 0
