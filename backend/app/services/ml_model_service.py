from __future__ import annotations

import io
import uuid

import pandas as pd
from minio import Minio
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import raise_app_error
from app.models.dataset_model import Dataset
from app.models.dataset_file_model import DatasetFile
from app.models.ml_model_model import MLModel
from app.ml_engine.trainer import train_model
from app.ml_engine.predictor import predict


TRAINABLE_FORMATS = {"csv", "excel", "json", "xml"}
MAX_MODELS_PER_DATASET = 2


def _get_minio() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def _delete_model_file(file_path: str | None) -> None:
    if not file_path:
        return
    try:
        client = _get_minio()
        client.remove_object(settings.MINIO_BUCKET_NAME, file_path)
    except Exception:
        pass


def get_dataset_columns(
    db: Session, dataset_id: uuid.UUID
) -> list[dict]:
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.is_deleted.is_(False))
        .first()
    )
    if not dataset:
        raise_app_error("NOT_FOUND", "ไม่พบ dataset")

    file = (
        db.query(DatasetFile)
        .filter(
            DatasetFile.dataset_id == dataset_id,
            DatasetFile.is_deleted.is_(False),
        )
        .first()
    )
    if not file:
        raise_app_error("NOT_FOUND", "dataset ไม่มีไฟล์")

    if file.file_format not in TRAINABLE_FORMATS:
        raise_app_error(
            "VALIDATION_ERROR",
            f"ไฟล์ประเภท {file.file_format} ไม่รองรับการเทรน ML",
        )

    client = _get_minio()
    response = client.get_object(settings.MINIO_BUCKET_NAME, file.file_path)
    content = response.read()
    response.close()
    response.release_conn()

    if file.file_format == "csv":
        df = pd.read_csv(io.BytesIO(content))
    elif file.file_format == "excel":
        df = pd.read_excel(io.BytesIO(content))
    elif file.file_format == "json":
        df = pd.read_json(io.BytesIO(content))
    elif file.file_format == "xml":
        df = pd.read_xml(io.BytesIO(content))
    else:
        raise_app_error("VALIDATION_ERROR", "ไม่รองรับประเภทไฟล์นี้")

    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        if dtype.startswith("int") or dtype.startswith("float"):
            dtype_label = "ตัวเลข"
        else:
            dtype_label = "ข้อความ"

        sample = df[col].dropna().head(5).tolist()

        columns.append({
            "column_name": col,
            "dtype": dtype_label,
            "sample_values": sample,
            "unique_count": int(df[col].nunique()),
        })

    return columns


def create_and_train(
    db: Session,
    user_id: uuid.UUID,
    dataset_id: uuid.UUID,
    name: str,
    description: str | None,
    target_column: str,
    feature_columns: list[str],
) -> MLModel:
    dataset = (
        db.query(Dataset)
        .filter(Dataset.id == dataset_id, Dataset.is_deleted.is_(False))
        .first()
    )
    if not dataset:
        raise_app_error("NOT_FOUND", "ไม่พบ dataset")

    model_count = (
        db.query(MLModel)
        .filter(
            MLModel.dataset_id == dataset_id,
            MLModel.user_id == user_id,
            MLModel.is_deleted.is_(False),
        )
        .count()
    )
    if model_count >= MAX_MODELS_PER_DATASET:
        raise_app_error(
            "VALIDATION_ERROR",
            f"สร้างโมเดลได้ไม่เกิน {MAX_MODELS_PER_DATASET} ตัวต่อ dataset",
        )

    file = (
        db.query(DatasetFile)
        .filter(
            DatasetFile.dataset_id == dataset_id,
            DatasetFile.is_deleted.is_(False),
        )
        .first()
    )
    if not file:
        raise_app_error("NOT_FOUND", "dataset ไม่มีไฟล์")

    if file.file_format not in TRAINABLE_FORMATS:
        raise_app_error(
            "VALIDATION_ERROR",
            f"ไฟล์ประเภท {file.file_format} ไม่รองรับการเทรน ML",
        )

    ml_model = MLModel(
        user_id=user_id,
        dataset_id=dataset_id,
        name=name,
        description=description,
        target_column=target_column,
        feature_columns=feature_columns,
        model_type="regression",
        status="training",
    )
    db.add(ml_model)
    db.flush()

    try:
        result = train_model(
            dataset_file_path=file.file_path,
            file_format=file.file_format,
            target_column=target_column,
            feature_columns=feature_columns,
            model_id=ml_model.id,
        )
        ml_model.status = "ready"
        ml_model.model_type = result["model_type"]
        ml_model.metrics = result["metrics"]
        ml_model.file_path = result["file_path"]
        ml_model.training_duration = result["training_duration"]
    except Exception as e:
        ml_model.status = "failed"
        ml_model.error_message = str(e)

    db.commit()
    db.refresh(ml_model)
    return ml_model


def list_models(
    db: Session,
    page: int,
    page_size: int,
    user_id: uuid.UUID | None = None,
    public_only: bool = False,
) -> tuple[list[MLModel], int]:
    q = db.query(MLModel).filter(MLModel.is_deleted.is_(False))

    if user_id:
        q = q.filter(MLModel.user_id == user_id)
    if public_only:
        q = q.filter(MLModel.is_public.is_(True), MLModel.status == "ready")

    total = q.count()
    models = (
        q.order_by(MLModel.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return models, total


def get_model(db: Session, model_id: uuid.UUID) -> MLModel:
    ml_model = (
        db.query(MLModel)
        .filter(MLModel.id == model_id, MLModel.is_deleted.is_(False))
        .first()
    )
    if not ml_model:
        raise_app_error("NOT_FOUND", "ไม่พบโมเดล")
    return ml_model


def update_model(
    db: Session,
    model_id: uuid.UUID,
    user_id: uuid.UUID,
    name: str | None,
    description: str | None,
    is_public: bool | None,
) -> MLModel:
    ml_model = get_model(db, model_id)

    if str(ml_model.user_id) != str(user_id):
        raise_app_error("AUTH_PERMISSION_DENIED")

    if name is not None:
        ml_model.name = name
    if description is not None:
        ml_model.description = description
    if is_public is not None:
        ml_model.is_public = is_public

    db.commit()
    db.refresh(ml_model)
    return ml_model


def delete_model(
    db: Session,
    model_id: uuid.UUID,
    user_id: uuid.UUID,
    role: str,
) -> None:
    ml_model = get_model(db, model_id)

    if role != "admin" and str(ml_model.user_id) != str(user_id):
        raise_app_error("AUTH_PERMISSION_DENIED")

    _delete_model_file(ml_model.file_path)
    ml_model.is_deleted = True
    db.commit()


def predict_model(
    db: Session,
    model_id: uuid.UUID,
    input_data: dict,
    user_id: uuid.UUID | None = None,
    user_role: str | None = None,
) -> dict:
    ml_model = get_model(db, model_id)

    if ml_model.status != "ready":
        raise_app_error("VALIDATION_ERROR", "โมเดลยังไม่พร้อมใช้งาน")

    if not ml_model.file_path:
        raise_app_error("VALIDATION_ERROR", "ไม่พบไฟล์โมเดล")

    if not ml_model.is_public:
        if not user_id:
            raise_app_error("AUTH_PERMISSION_DENIED", "โมเดลนี้ยังไม่เปิดให้สาธารณะใช้งาน")
        is_owner = str(ml_model.user_id) == str(user_id)
        if not is_owner and user_role != "admin":
            raise_app_error("AUTH_PERMISSION_DENIED", "โมเดลนี้ยังไม่เปิดให้สาธารณะใช้งาน")

    result = predict(
        file_path=ml_model.file_path,
        feature_columns=ml_model.feature_columns,
        input_data=input_data,
    )

    ml_model.predict_count = (ml_model.predict_count or 0) + 1
    db.commit()

    return {
        "prediction": result,
        "model_name": ml_model.name,
        "model_type": ml_model.model_type,
    }


def retrain_model(
    db: Session, model_id: uuid.UUID, user_id: uuid.UUID
) -> MLModel:
    ml_model = get_model(db, model_id)

    if str(ml_model.user_id) != str(user_id):
        raise_app_error("AUTH_PERMISSION_DENIED")

    file = (
        db.query(DatasetFile)
        .filter(
            DatasetFile.dataset_id == ml_model.dataset_id,
            DatasetFile.is_deleted.is_(False),
        )
        .first()
    )
    if not file:
        raise_app_error("NOT_FOUND", "dataset ไม่มีไฟล์")

    ml_model.status = "training"
    ml_model.error_message = None
    db.flush()

    try:
        result = train_model(
            dataset_file_path=file.file_path,
            file_format=file.file_format,
            target_column=ml_model.target_column,
            feature_columns=ml_model.feature_columns,
            model_id=ml_model.id,
        )
        ml_model.status = "ready"
        ml_model.model_type = result["model_type"]
        ml_model.metrics = result["metrics"]
        ml_model.file_path = result["file_path"]
        ml_model.training_duration = result["training_duration"]
    except Exception as e:
        ml_model.status = "failed"
        ml_model.error_message = str(e)

    db.commit()
    db.refresh(ml_model)
    return ml_model
