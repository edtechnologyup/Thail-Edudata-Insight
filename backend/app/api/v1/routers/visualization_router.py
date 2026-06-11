# Module: M5 Visualization
# Feature: Visualization API Endpoints ตาม #20

import uuid

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

import app.services.visualization_service as visualization_service
from app.core.database import get_db
from app.core.response import success_response
from app.core.security import get_current_user_payload_with_status
from app.schemas.visualization_schema import DashboardLayoutRequest

router = APIRouter()


@router.get("/stats/by-category", status_code=status.HTTP_200_OK)
def stats_by_category(
    category_id: uuid.UUID | None = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    สถิติ Dataset แยกตามหมวดหมู่ระดับ 1 และแนวโน้มรายปี
    - Auth ❌
    - Query: category_id (หมวดหมู่ระดับ 1 — ไม่ส่ง = ทั้งหมด)
    - Errors: CATEGORY_NOT_FOUND
    """
    result = visualization_service.get_stats_by_category(db, category_id=category_id)
    return success_response(result.model_dump(mode="json"))


@router.get("/stats/overview", status_code=status.HTTP_200_OK)
def stats_overview(db: Session = Depends(get_db)):
    """
    สถิติภาพรวมการศึกษาไทย ตาม #20
    - Auth ❌
    """
    result = visualization_service.get_stats_overview(db)
    return success_response(result.model_dump(mode="json"))


@router.get("/stats/trending", status_code=status.HTTP_200_OK)
def stats_trending(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Dataset ยอดนิยม เรียงตาม view_count (การเข้าชม) ตาม #20
    - Auth ❌
    """
    result = visualization_service.get_trending(db, limit=limit)
    return success_response(result.model_dump(mode="json"))


@router.get("/stats/new-releases", status_code=status.HTTP_200_OK)
def stats_new_releases(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Dataset ใหม่ล่าสุด ตาม #20
    - Auth ❌
    """
    result = visualization_service.get_new_releases(db, limit=limit)
    return success_response(result.model_dump(mode="json"))


@router.get("/stats/compare", status_code=status.HTTP_200_OK)
def stats_compare(
    ids: list[uuid.UUID] = Query(default=[]),
    db: Session = Depends(get_db),
):
    """
    เปรียบเทียบข้อมูลระหว่าง Dataset ตาม #20
    - Auth ❌
    - Query: ids (รายการ dataset_id)
    """
    result = visualization_service.compare_datasets(db, dataset_ids=ids)
    return success_response(result.model_dump(mode="json"))


@router.get("/dashboard-layouts", status_code=status.HTTP_200_OK)
def get_dashboard_layout(
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    ดู Dashboard Layout ตาม #20
    - Auth ✅
    """
    user_id = uuid.UUID(payload["sub"])
    result = visualization_service.get_dashboard_layout(db, user_id=user_id)
    data = result.model_dump(mode="json") if result else None
    return success_response(data)


@router.put("/dashboard-layouts", status_code=status.HTTP_200_OK)
def save_dashboard_layout(
    request_body: DashboardLayoutRequest,
    payload: dict = Depends(get_current_user_payload_with_status),
    db: Session = Depends(get_db),
):
    """
    บันทึก Dashboard Layout ตาม #20
    - Auth ✅
    """
    user_id = uuid.UUID(payload["sub"])
    result = visualization_service.save_dashboard_layout(
        db,
        user_id=user_id,
        layout=request_body.layout,
    )
    return success_response(result.model_dump(mode="json"))
