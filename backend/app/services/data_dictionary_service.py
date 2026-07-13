import io
import uuid

import pandas as pd
from minio import Minio
from sqlalchemy.orm import Session

import app.repositories.data_dictionary_repository as dd_repo
import app.repositories.dataset_repository as dataset_repo
from app.core.config import settings
from app.core.errors import raise_app_error
from app.models.dataset_file_model import DatasetFile
from app.schemas.data_dictionary_schema import (
    AutoDetectResponse,
    DataDictionaryEntry,
    DataDictionaryEntryResponse,
    DataDictionaryPutRequest,
    DataDictionaryResponse,
)

SAMPLE_ROW_COUNT = 3


def _get_dataset_and_file(
    db: Session, dataset_id: uuid.UUID, file_id: uuid.UUID, current_user: dict
):
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None:
        raise_app_error("DATASET_NOT_FOUND")
    if (
        current_user.get("role") != "admin"
        and str(dataset.user_id) != current_user.get("sub")
    ):
        raise_app_error("DATASET_PERMISSION_DENIED")

    file = (
        db.query(DatasetFile)
        .filter(
            DatasetFile.id == file_id,
            DatasetFile.dataset_id == dataset_id,
            DatasetFile.is_deleted.is_(False),
        )
        .first()
    )
    if file is None:
        raise_app_error("FILE_NOT_FOUND")
    return dataset, file


def _infer_format(file_path: str) -> str:
    ext = file_path.rsplit(".", 1)[-1].lower()
    mapping = {"json": "json", "xlsx": "excel", "xls": "excel", "csv": "csv"}
    return mapping.get(ext, "csv")


def _read_columns_and_samples(
    minio_client: Minio, file_path: str, file_format: str
) -> list[dict]:
    response = minio_client.get_object(settings.MINIO_BUCKET_NAME, file_path)
    try:
        content = response.read()
    finally:
        response.close()
        response.release_conn()

    fmt = file_format.lower()
    if fmt == "csv":
        df = pd.read_csv(io.BytesIO(content), nrows=SAMPLE_ROW_COUNT + 1)
    elif fmt == "json":
        df = pd.read_json(io.BytesIO(content))
        df = df.head(SAMPLE_ROW_COUNT + 1)
    elif fmt in ("excel", "xlsx", "xls"):
        df = pd.read_excel(io.BytesIO(content), nrows=SAMPLE_ROW_COUNT + 1)
    else:
        return []

    result = []
    for idx, col in enumerate(df.columns):
        samples = df[col].dropna().head(SAMPLE_ROW_COUNT).astype(str).tolist()
        sample_str = ", ".join(samples) if samples else None
        result.append({
            "column_name": str(col),
            "sample_value": sample_str,
            "column_order": idx,
        })
    return result


def get_dictionary(
    db: Session, dataset_id: uuid.UUID, file_id: uuid.UUID
) -> DataDictionaryResponse:
    entries = dd_repo.get_entries(db, dataset_id, file_id)
    return DataDictionaryResponse(
        file_id=file_id,
        entries=[DataDictionaryEntryResponse.model_validate(e) for e in entries],
    )


def save_dictionary(
    db: Session,
    dataset_id: uuid.UUID,
    file_id: uuid.UUID,
    request: DataDictionaryPutRequest,
    current_user: dict,
) -> DataDictionaryResponse:
    _get_dataset_and_file(db, dataset_id, file_id, current_user)

    dd_repo.delete_entries(db, dataset_id, file_id)

    entry_dicts = [
        {
            "column_name": e.column_name,
            "description": e.description,
            "data_type": e.data_type,
            "sample_value": e.sample_value,
            "column_order": e.column_order,
        }
        for e in request.entries
    ]
    created = dd_repo.bulk_create(db, dataset_id, file_id, entry_dicts)
    db.commit()

    return DataDictionaryResponse(
        file_id=file_id,
        entries=[DataDictionaryEntryResponse.model_validate(e) for e in created],
    )


def auto_detect(
    db: Session,
    minio_client: Minio,
    dataset_id: uuid.UUID,
    file_id: uuid.UUID,
    current_user: dict,
) -> AutoDetectResponse:
    _, file = _get_dataset_and_file(db, dataset_id, file_id, current_user)

    fmt = file.file_format or _infer_format(file.file_path)
    if fmt in ("pdf", "sql", "xml"):
        raise_app_error(
            "VALIDATION_ERROR",
            message="ไม่สามารถตรวจจับ column จากไฟล์ประเภทนี้ได้",
        )

    detected = _read_columns_and_samples(minio_client, file.file_path, fmt)

    existing = dd_repo.get_entries(db, dataset_id, file_id)
    existing_map = {e.column_name: e for e in existing}

    merged: list[DataDictionaryEntry] = []
    for col_info in detected:
        name = col_info["column_name"]
        prev = existing_map.get(name)
        merged.append(DataDictionaryEntry(
            column_name=name,
            description=prev.description if prev else None,
            data_type=prev.data_type if prev else None,
            sample_value=col_info.get("sample_value"),
            column_order=col_info["column_order"],
        ))

    return AutoDetectResponse(file_id=file_id, entries=merged)
