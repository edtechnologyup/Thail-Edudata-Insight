from __future__ import annotations

import io
import pickle
from typing import Any

import numpy as np
from minio import Minio

from app.core.config import settings


def _get_minio_client() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def _load_model(client: Minio, file_path: str) -> dict[str, Any]:
    response = client.get_object(settings.MINIO_BUCKET_NAME, file_path)
    content = response.read()
    response.close()
    response.release_conn()
    return pickle.loads(content)


def predict(
    file_path: str,
    feature_columns: list[str],
    input_data: dict[str, Any],
) -> Any:
    client = _get_minio_client()
    data = _load_model(client, file_path)
    model = data["model"]
    label_encoders = data["label_encoders"]

    features = []
    for col in feature_columns:
        value = input_data.get(col)
        if value is None:
            raise ValueError(f"ไม่พบค่า input: {col}")

        if col in label_encoders:
            le = label_encoders[col]
            if str(value) not in le.classes_:
                raise ValueError(
                    f"ค่า '{value}' ไม่อยู่ในข้อมูลที่เทรน "
                    f"(ค่าที่รองรับ: {', '.join(le.classes_[:20])})"
                )
            value = le.transform([str(value)])[0]

        features.append(value)

    X = np.array([features])
    result = model.predict(X)[0]

    target_encoder = label_encoders.get("__target__")
    if target_encoder:
        result = target_encoder.inverse_transform([int(result)])[0]

    if isinstance(result, (np.integer, np.floating)):
        result = round(float(result), 4)

    return result
