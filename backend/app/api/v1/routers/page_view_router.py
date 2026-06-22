from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_client_ip
from app.repositories import page_view_repository

router = APIRouter(prefix="/page-views", tags=["PageView"])

ALLOWED_PAGES = frozenset({
    "home", "search", "categories", "stats", "api-docs",
    "dataset-detail", "scholarship", "help-center",
})


@router.post("", status_code=204)
def record_page_view(
    request: Request,
    page: str = Query(..., min_length=1, max_length=100),
    db: Session = Depends(get_db),
):
    if page not in ALLOWED_PAGES:
        return
    ip = get_client_ip(request)
    page_view_repository.record_view(db, page, ip)


@router.get("")
def get_page_view_counts(
    page: str = Query(..., min_length=1, max_length=100),
    db: Session = Depends(get_db),
):
    counts = page_view_repository.get_counts(db, page)
    return {"status": "success", "data": counts}
