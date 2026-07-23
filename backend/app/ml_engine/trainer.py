from __future__ import annotations

import io
import time
import uuid
import pickle
from typing import Any

import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, r2_score, mean_absolute_error,
    precision_score, recall_score, f1_score, confusion_matrix,
)
from sklearn.preprocessing import LabelEncoder
from xgboost import XGBClassifier, XGBRegressor
from minio import Minio

from app.core.config import settings

SUPPORTED_FORMATS = {"csv", "excel", "json", "xml"}

ALGORITHMS = {
    "regression": [
        ("XGBoost", XGBRegressor),
        ("GradientBoosting", GradientBoostingRegressor),
        ("RandomForest", RandomForestRegressor),
    ],
    "classification": [
        ("XGBoost", XGBClassifier),
        ("GradientBoosting", GradientBoostingClassifier),
        ("RandomForest", RandomForestClassifier),
    ],
}


def _get_minio_client() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def _read_file_from_minio(
    client: Minio, file_path: str, file_format: str
) -> pd.DataFrame:
    bucket = settings.MINIO_BUCKET_NAME
    response = client.get_object(bucket, file_path)
    content = response.read()
    response.close()
    response.release_conn()

    if file_format == "csv":
        return pd.read_csv(io.BytesIO(content))
    elif file_format == "excel":
        return pd.read_excel(io.BytesIO(content))
    elif file_format == "json":
        return pd.read_json(io.BytesIO(content))
    elif file_format == "xml":
        return pd.read_xml(io.BytesIO(content))
    else:
        raise ValueError(f"ไม่รองรับไฟล์ประเภท {file_format}")


def _detect_model_type(series: pd.Series) -> str:
    if series.dtype in ("float64", "float32", "int64", "int32"):
        if series.nunique() <= 10:
            return "classification"
        return "regression"
    return "classification"


def _prepare_data(
    df: pd.DataFrame,
    target_column: str,
    feature_columns: list[str],
) -> tuple[np.ndarray, np.ndarray, dict[str, LabelEncoder]]:
    df_work = df[feature_columns + [target_column]].dropna().copy()

    if len(df_work) < 10:
        raise ValueError("ข้อมูลน้อยเกินไป (ต้องมีอย่างน้อย 10 แถว)")

    label_encoders: dict[str, LabelEncoder] = {}

    for col in feature_columns:
        if not pd.api.types.is_numeric_dtype(df_work[col]):
            le = LabelEncoder()
            encoded = le.fit_transform(df_work[col].astype(str))
            df_work[col] = encoded
            label_encoders[col] = le

    if not pd.api.types.is_numeric_dtype(df_work[target_column]):
        le = LabelEncoder()
        encoded = le.fit_transform(df_work[target_column].astype(str))
        df_work[target_column] = encoded
        label_encoders[target_column] = le

    X = df_work[feature_columns].to_numpy(dtype=float)
    y = df_work[target_column].to_numpy(dtype=float)

    return X, y, label_encoders


def _train_and_evaluate(
    X: np.ndarray,
    y: np.ndarray,
    model_type: str,
    feature_columns: list[str],
) -> tuple[str, Any, dict]:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    best_name = ""
    best_model = None
    best_score = -999.0
    best_metrics: dict = {}
    best_y_pred = None

    for name, ModelClass in ALGORITHMS[model_type]:
        model = ModelClass(random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        if model_type == "regression":
            score = r2_score(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            metrics = {
                "r2_score": round(float(score), 4),
                "mae": round(float(mae), 4),
            }
        else:
            score = accuracy_score(y_test, y_pred)
            avg = "binary" if len(set(y)) == 2 else "weighted"
            metrics = {
                "accuracy": round(float(score), 4),
                "precision": round(float(precision_score(y_test, y_pred, average=avg, zero_division=0)), 4),
                "recall": round(float(recall_score(y_test, y_pred, average=avg, zero_division=0)), 4),
                "f1": round(float(f1_score(y_test, y_pred, average=avg, zero_division=0)), 4),
            }

        if score > best_score:
            best_score = score
            best_name = name
            best_model = model
            best_metrics = metrics
            best_y_pred = y_pred

        del model

    best_metrics["algorithm"] = best_name
    best_metrics["data_rows"] = int(len(y))
    best_metrics["train_rows"] = int(len(y_train))
    best_metrics["test_rows"] = int(len(y_test))

    importances = getattr(best_model, "feature_importances_", None)
    if importances is not None:
        fi = sorted(
            zip(feature_columns, importances.tolist()),
            key=lambda x: x[1],
            reverse=True,
        )
        best_metrics["feature_importance"] = [
            {"column": col, "importance": round(imp, 4)} for col, imp in fi
        ]

    if best_y_pred is not None:
        sample_limit = 200
        if model_type == "regression":
            best_metrics["actual_vs_predicted"] = {
                "actual": [round(float(v), 4) for v in y_test[:sample_limit]],
                "predicted": [round(float(v), 4) for v in best_y_pred[:sample_limit]],
            }
        else:
            cm = confusion_matrix(y_test, best_y_pred)
            best_metrics["confusion_matrix"] = cm.tolist()

    return best_name, best_model, best_metrics


def _save_model_to_minio(
    client: Minio,
    model_id: uuid.UUID,
    model: Any,
    label_encoders: dict[str, LabelEncoder],
) -> str:
    data = {
        "model": model,
        "label_encoders": label_encoders,
    }
    buffer = io.BytesIO()
    pickle.dump(data, buffer)
    buffer.seek(0)

    object_name = f"ml-models/{model_id}/model.pkl"
    client.put_object(
        settings.MINIO_BUCKET_NAME,
        object_name,
        buffer,
        length=buffer.getbuffer().nbytes,
        content_type="application/octet-stream",
    )
    return object_name


def train_model(
    dataset_file_path: str,
    file_format: str,
    target_column: str,
    feature_columns: list[str],
    model_id: uuid.UUID,
) -> dict:
    if file_format not in SUPPORTED_FORMATS:
        raise ValueError(
            f"ไม่รองรับไฟล์ประเภท {file_format} "
            f"(รองรับ: {', '.join(SUPPORTED_FORMATS)})"
        )

    start_time = time.time()
    client = _get_minio_client()

    df = _read_file_from_minio(client, dataset_file_path, file_format)

    missing = [c for c in [target_column] + feature_columns if c not in df.columns]
    if missing:
        raise ValueError(f"ไม่พบคอลัมน์: {', '.join(missing)}")

    model_type = _detect_model_type(df[target_column])
    X, y, label_encoders = _prepare_data(df, target_column, feature_columns)
    algo_name, model, metrics = _train_and_evaluate(X, y, model_type, feature_columns)
    file_path = _save_model_to_minio(client, model_id, model, label_encoders)
    duration = round(time.time() - start_time, 2)

    return {
        "model_type": model_type,
        "metrics": metrics,
        "file_path": file_path,
        "training_duration": duration,
    }
