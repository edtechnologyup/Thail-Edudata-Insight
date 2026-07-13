import uuid

from pydantic import BaseModel, Field


class DataDictionaryEntry(BaseModel):
    column_name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    data_type: str | None = Field(default=None, max_length=50)
    sample_value: str | None = None
    column_order: int = 0


class DataDictionaryPutRequest(BaseModel):
    entries: list[DataDictionaryEntry] = Field(max_length=500)


class DataDictionaryEntryResponse(BaseModel):
    id: uuid.UUID
    column_name: str
    description: str | None
    data_type: str | None
    sample_value: str | None
    column_order: int

    model_config = {"from_attributes": True}


class DataDictionaryResponse(BaseModel):
    file_id: uuid.UUID
    entries: list[DataDictionaryEntryResponse]


class AutoDetectResponse(BaseModel):
    file_id: uuid.UUID
    entries: list[DataDictionaryEntry]
