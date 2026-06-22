import uuid
from datetime import date, datetime, timezone

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.page_view_model import PageView


def record_view(db: Session, page_name: str, ip_address: str) -> None:
    pv = PageView(
        id=uuid.uuid4(),
        page_name=page_name,
        ip_address=ip_address,
    )
    db.add(pv)
    db.commit()


def get_counts(db: Session, page_name: str) -> dict:
    today_start = datetime(
        *date.today().timetuple()[:3],
        tzinfo=timezone.utc,
    )

    total = db.query(func.count(PageView.id)).filter(
        PageView.page_name == page_name,
    ).scalar() or 0

    today = db.query(func.count(PageView.id)).filter(
        PageView.page_name == page_name,
        PageView.created_at >= today_start,
    ).scalar() or 0

    return {"today": today, "total": total}
