# Module: Notification
# Feature: In-app notification API

import uuid

from fastapi import APIRouter, Depends, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

import app.services.notification_service as notification_service
from app.core.database import get_db
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import list_response, success_response
from app.core.security import decode_access_token

router = APIRouter()
_bearer_optional = HTTPBearer(auto_error=False)


def _get_optional_user_id(
    credentials: HTTPAuthorizationCredentials | None,
    request: Request,
) -> uuid.UUID | None:
    token = None
    if credentials is not None and credentials.scheme.lower() == "bearer":
        token = credentials.credentials
    elif request:
        token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = decode_access_token(token)
        sub = payload.get("sub")
        if sub:
            return uuid.UUID(str(sub))
    except Exception:
        return None
    return None


@router.get("/notifications", status_code=status.HTTP_200_OK)
def list_notifications(
    request: Request,
    pagination: PaginationParams = Depends(get_pagination_params),
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
    db: Session = Depends(get_db),
):
    """
    รายการแจ้งเตือน (broadcast + ของตัวเองถ้า login)
    - Auth ❌ (Visitor เห็น broadcast)
    """
    user_id = _get_optional_user_id(credentials, request)
    items, total = notification_service.list_notifications(
        db, pagination=pagination, user_id=user_id
    )
    return list_response(
        data=[item.model_dump(mode="json") for item in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.get("/notifications/unread-count", status_code=status.HTTP_200_OK)
def notification_unread_count(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
    db: Session = Depends(get_db),
):
    """
    จำนวนแจ้งเตือนที่ยังไม่อ่าน
    - Auth ❌ (Visitor นับเฉพาะ broadcast ฝั่ง server)
    """
    user_id = _get_optional_user_id(credentials, request)
    result = notification_service.get_unread_count(db, user_id=user_id)
    return success_response(data=result.model_dump(mode="json"))


@router.patch("/notifications/{notification_id}/read", status_code=status.HTTP_200_OK)
def mark_notification_read(
    notification_id: uuid.UUID,
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
    db: Session = Depends(get_db),
):
    """
    ทำเครื่องหมายว่าอ่านแล้ว
    - broadcast + Visitor: คืนสำเร็จ (Visitor เก็บ read ใน localStorage ฝั่ง client)
    - personal: ต้อง login และเป็นเจ้าของ
    """
    user_id = _get_optional_user_id(credentials, request)
    result = notification_service.mark_read(
        db, notification_id=notification_id, user_id=user_id
    )
    return success_response(data=result.model_dump(mode="json"))


@router.patch("/notifications/read-all", status_code=status.HTTP_200_OK)
def mark_all_notifications_read(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
    db: Session = Depends(get_db),
):
    """
    อ่านทั้งหมด — ต้อง login
    """
    user_id = _get_optional_user_id(credentials, request)
    if user_id is None:
        from app.core.errors import raise_app_error

        raise_app_error("AUTH_TOKEN_MISSING")
    result = notification_service.mark_all_read(db, user_id=user_id)
    return success_response(data=result.model_dump(mode="json"))
