import uuid

from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

import app.services.ml_model_service as ml_model_service
from app.core.database import get_db
from app.core.errors import raise_app_error
from app.core.response import delete_response, list_response, success_response
from app.core.security import (
    get_current_user_payload_with_status,
    get_redis_client,
    require_roles,
    decode_access_token,
    extract_bearer_token,
    validate_token_in_redis,
    get_client_ip,
)
from app.schemas.ml_model_schema import (
    MLModelCreateRequest,
    MLModelPredictRequest,
    MLModelResponse,
    MLModelUpdateRequest,
)

router = APIRouter()
_bearer_optional = HTTPBearer(auto_error=False)

PREDICT_RATE_LIMIT = 60
PREDICT_RATE_WINDOW = 60


def _model_to_dict(m) -> dict:
    return MLModelResponse.model_validate(m).model_dump()


def _check_predict_rate_limit(ip: str) -> None:
    redis = get_redis_client()
    key = f"ml_predict_rate:{ip}"
    count = redis.get(key)
    if count and int(count) >= PREDICT_RATE_LIMIT:
        raise_app_error(
            "RATE_LIMIT_EXCEEDED",
            "เกินจำนวนครั้งที่อนุญาต กรุณารอสักครู่แล้วลองใหม่",
        )
    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, PREDICT_RATE_WINDOW)
    pipe.execute()


@router.get("/datasets/{dataset_id}/columns")
def get_dataset_columns(
    dataset_id: uuid.UUID,
    db: Session = Depends(get_db),
    payload: dict = Depends(require_roles("agency", "admin")),
):
    columns = ml_model_service.get_dataset_columns(db, dataset_id)
    return success_response(columns)


@router.post("/ml-models", status_code=status.HTTP_201_CREATED)
def create_model(
    body: MLModelCreateRequest,
    db: Session = Depends(get_db),
    payload: dict = Depends(require_roles("agency", "admin")),
):
    ml_model = ml_model_service.create_and_train(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        dataset_id=body.dataset_id,
        name=body.name,
        description=body.description,
        target_column=body.target_column,
        feature_columns=body.feature_columns,
    )
    return success_response(_model_to_dict(ml_model))


@router.get("/ml-models")
def list_models(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    public_only: bool = Query(False),
    my_models: bool = Query(False),
    db: Session = Depends(get_db),
    payload: dict | None = Depends(get_current_user_payload_with_status),
):
    user_id = None
    if my_models and payload:
        user_id = uuid.UUID(payload["sub"])

    models, total = ml_model_service.list_models(
        db=db,
        page=page,
        page_size=page_size,
        user_id=user_id,
        public_only=public_only,
    )
    return list_response(
        [_model_to_dict(m) for m in models],
        page,
        page_size,
        total,
    )


@router.get("/ml-models/{model_id}")
def get_model(
    model_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    ml_model = ml_model_service.get_model(db, model_id)
    return success_response(_model_to_dict(ml_model))


@router.put("/ml-models/{model_id}")
def update_model(
    model_id: uuid.UUID,
    body: MLModelUpdateRequest,
    db: Session = Depends(get_db),
    payload: dict = Depends(require_roles("agency", "admin")),
):
    ml_model = ml_model_service.update_model(
        db=db,
        model_id=model_id,
        user_id=uuid.UUID(payload["sub"]),
        name=body.name,
        description=body.description,
        is_public=body.is_public,
    )
    return success_response(_model_to_dict(ml_model))


@router.delete("/ml-models/{model_id}")
def delete_model(
    model_id: uuid.UUID,
    db: Session = Depends(get_db),
    payload: dict = Depends(require_roles("agency", "admin")),
):
    ml_model_service.delete_model(
        db=db,
        model_id=model_id,
        user_id=uuid.UUID(payload["sub"]),
        role=payload.get("role", ""),
    )
    return delete_response("ลบโมเดลเรียบร้อย")


@router.post("/ml-models/{model_id}/predict")
def predict_model(
    model_id: uuid.UUID,
    body: MLModelPredictRequest,
    request: Request,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
):
    _check_predict_rate_limit(get_client_ip(request))

    user_id = None
    user_role = None
    if credentials:
        try:
            token = extract_bearer_token(credentials)
            payload = decode_access_token(token)
            uid = payload.get("sub")
            if uid:
                validate_token_in_redis(uid, token)
                user_id = uuid.UUID(uid)
                user_role = payload.get("role")
        except Exception:
            pass

    result = ml_model_service.predict_model(
        db=db,
        model_id=model_id,
        input_data=body.input_data,
        user_id=user_id,
        user_role=user_role,
    )
    return success_response(result)


@router.post("/ml-models/{model_id}/retrain")
def retrain_model(
    model_id: uuid.UUID,
    db: Session = Depends(get_db),
    payload: dict = Depends(require_roles("agency", "admin")),
):
    ml_model = ml_model_service.retrain_model(
        db=db,
        model_id=model_id,
        user_id=uuid.UUID(payload["sub"]),
    )
    return success_response(_model_to_dict(ml_model))
