# Module: M1 Auth
# Feature: API Endpoints ตาม #20 #27

import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, Request, status
from sqlalchemy.orm import Session

import app.services.auth_service as auth_service
from app.core.database import get_db
from app.core.pagination import PaginationParams, get_pagination_params
from app.core.response import (
    delete_response,
    list_response,
    success_response,
)
from app.core.security import (
    get_current_user_payload_with_status,
    get_redis_client,
    require_roles,
)
from app.schemas.auth_schema import (
    BookmarkRequest,
    LoginRequest,
    RegisterRequest,
    SubscriptionRequest,
)

router = APIRouter()


@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register(
    request_body: RegisterRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """
    สมัครสมาชิก (Agency)
    - Auth ❌
    - คืน 201 Created
    - Errors: USER_EMAIL_EXISTS 409, VALIDATION_ERROR 422
    """
    from app.core.security import get_client_ip

    ip = get_client_ip(request)
    user = auth_service.register(
        db=db,
        request=request_body,
        ip_address=ip,
        background_tasks=background_tasks,
    )
    return success_response(data=user.model_dump(mode="json"), message="สมัครสำเร็จ รอ Admin อนุมัติ")


@router.post("/auth/login", status_code=status.HTTP_200_OK)
def login(
    request_body: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Login ด้วย Email + Password
    - Auth ❌
    - คืน 200 OK พร้อม Token
    - Errors: AUTH_INVALID_CREDENTIALS 401, AUTH_ACCOUNT_SUSPENDED 403
    """
    redis_client = get_redis_client()
    token_response = auth_service.login(
        db=db,
        redis_client=redis_client,
        email=request_body.email,
        password=request_body.password,
    )
    return success_response(data=token_response.model_dump(), message="ok")


@router.post("/auth/logout", status_code=status.HTTP_200_OK)
def logout(
    payload: dict = Depends(get_current_user_payload_with_status),
):
    """
    Logout — ลบ Token ออกจาก Redis
    - Auth ✅
    - คืน 200 OK
    """
    redis_client = get_redis_client()
    auth_service.logout(redis_client=redis_client, user_id=payload["sub"])
    return delete_response()


@router.get("/auth/me", status_code=status.HTTP_200_OK)
def get_me(
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ดูข้อมูลตัวเอง
    - Auth ✅
    - คืน 200 OK
    """
    user = auth_service.get_me(db=db, user_id=uuid.UUID(payload["sub"]))
    return success_response(data=user.model_dump(mode="json"))


@router.post("/bookmarks", status_code=status.HTTP_201_CREATED)
def add_bookmark(
    request_body: BookmarkRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    เพิ่ม Bookmark — Agency/Admin เท่านั้น ตาม #4
    - Auth ✅
    - คืน 201 Created
    """
    bookmark = auth_service.add_bookmark(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        dataset_id=request_body.dataset_id,
    )
    return success_response(data=bookmark.model_dump(mode="json"))


@router.delete("/bookmarks/{dataset_id}", status_code=status.HTTP_200_OK)
def remove_bookmark(
    dataset_id: uuid.UUID,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ลบ Bookmark
    - Auth ✅
    - คืน 200 OK
    """
    auth_service.remove_bookmark(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        dataset_id=dataset_id,
    )
    return delete_response()


@router.get("/bookmarks", status_code=status.HTTP_200_OK)
def list_bookmarks(
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
    pagination: PaginationParams = Depends(get_pagination_params),
):
    """
    ดูรายการ Bookmark พร้อม Pagination ตาม #23
    - Auth ✅
    - คืน 200 OK
    """
    items, total = auth_service.list_bookmarks(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        pagination=pagination,
    )
    return list_response(
        data=[b.model_dump(mode="json") for b in items],
        page=pagination.page,
        page_size=pagination.page_size,
        total_items=total,
    )


@router.post("/subscriptions", status_code=status.HTTP_201_CREATED)
def add_subscription(
    request_body: SubscriptionRequest,
    payload: dict = Depends(require_roles("agency", "admin")),
    db: Session = Depends(get_db),
):
    """
    เพิ่ม Subscription — Agency/Admin เท่านั้น ตาม #4
    - Auth ✅
    - คืน 201 Created
    """
    sub = auth_service.add_subscription(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        category_id=request_body.category_id,
        agency_user_id=request_body.agency_user_id,
    )
    return success_response(data=sub.model_dump(mode="json"))


@router.delete("/subscriptions/{subscription_id}", status_code=status.HTTP_200_OK)
def remove_subscription(
    subscription_id: uuid.UUID,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ลบ Subscription
    - Auth ✅
    - คืน 200 OK
    """
    auth_service.remove_subscription(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
        subscription_id=subscription_id,
    )
    return delete_response()


@router.get("/subscriptions", status_code=status.HTTP_200_OK)
def list_subscriptions(
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ดูรายการ Subscription
    - Auth ✅
    - คืน 200 OK
    """
    items = auth_service.list_subscriptions(
        db=db,
        user_id=uuid.UUID(payload["sub"]),
    )
    return success_response(data=[s.model_dump(mode="json") for s in items])
