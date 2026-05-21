# Module: M5 Visualization
# Feature: Database Queries ตาม #56

import uuid
from typing import Any

from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.models.dashboard_layout_model import DashboardLayout
from app.models.dataset_model import Dataset
from app.models.user_model import User


def get_stats_overview(db: Session) -> dict[str, Any]:
    published_filter = (
        Dataset.is_deleted.is_(False),
        Dataset.status == "published",
    )

    total_datasets = (
        db.query(func.count(Dataset.id))
        .filter(*published_filter)
        .scalar()
    ) or 0

    total_downloads = (
        db.query(func.coalesce(func.sum(Dataset.download_count), 0))
        .filter(*published_filter)
        .scalar()
    ) or 0

    total_agencies = (
        db.query(func.count(User.id))
        .filter(
            User.is_deleted.is_(False),
            User.role == "agency",
            User.status == "active",
        )
        .scalar()
    ) or 0

    year_rows = (
        db.query(
            extract("year", Dataset.published_at).label("year"),
            func.count(Dataset.id).label("count"),
        )
        .filter(
            *published_filter,
            Dataset.published_at.isnot(None),
        )
        .group_by(extract("year", Dataset.published_at))
        .order_by(extract("year", Dataset.published_at))
        .all()
    )

    datasets_by_year = [
        {"year": int(row.year), "count": int(row.count)}
        for row in year_rows
        if row.year is not None
    ]

    return {
        "total_datasets": int(total_datasets),
        "total_downloads": int(total_downloads),
        "total_agencies": int(total_agencies),
        "datasets_by_year": datasets_by_year,
    }


def get_trending_datasets(db: Session, limit: int) -> list[Dataset]:
    return (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
        )
        .order_by(Dataset.download_count.desc())
        .limit(limit)
        .all()
    )


def get_new_releases(db: Session, limit: int) -> list[Dataset]:
    return (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
            Dataset.published_at.isnot(None),
        )
        .order_by(Dataset.published_at.desc())
        .limit(limit)
        .all()
    )


def get_datasets_for_compare(
    db: Session, dataset_ids: list[uuid.UUID]
) -> list[Dataset]:
    if not dataset_ids:
        return []
    return (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
            Dataset.id.in_(dataset_ids),
        )
        .all()
    )


def get_dashboard_layout(
    db: Session, user_id: uuid.UUID
) -> DashboardLayout | None:
    return (
        db.query(DashboardLayout)
        .filter(DashboardLayout.user_id == user_id)
        .first()
    )


def upsert_dashboard_layout(
    db: Session, user_id: uuid.UUID, layout: dict
) -> DashboardLayout:
    record = get_dashboard_layout(db, user_id)
    if record is None:
        record = DashboardLayout(user_id=user_id, layout=layout)
        db.add(record)
    else:
        record.layout = layout
    db.flush()
    return record
