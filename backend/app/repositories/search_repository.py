# Module: M3 Search
# Feature: Filter options from published datasets ตาม #5 M3

from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category_model import Category
from app.models.dataset_file_model import DatasetFile
from app.models.dataset_model import Dataset
from app.models.user_model import User


def _published_dataset_query(db: Session):
    return db.query(Dataset).filter(
        Dataset.is_deleted.is_(False),
        Dataset.status == "published",
    )


def get_search_filter_options(db: Session) -> dict[str, Any]:
    """คืนตัวเลือก filter ที่มีข้อมูลจริงใน Dataset ที่เผยแพร่แล้ว"""
    category_ids_with_data = {
        row[0]
        for row in _published_dataset_query(db)
        .filter(Dataset.category_id.isnot(None))
        .with_entities(Dataset.category_id)
        .distinct()
        .all()
    }

    categories: list[Category] = []
    if category_ids_with_data:
        categories = (
            db.query(Category)
            .filter(
                Category.is_deleted.is_(False),
                Category.id.in_(category_ids_with_data),
            )
            .order_by(Category.level.asc(), Category.name_th.asc())
            .all()
        )
        parent_ids = {c.parent_id for c in categories if c.parent_id}
        if parent_ids:
            parents = (
                db.query(Category)
                .filter(
                    Category.is_deleted.is_(False),
                    Category.id.in_(parent_ids),
                )
                .all()
            )
            by_id = {c.id: c for c in categories}
            for parent in parents:
                by_id.setdefault(parent.id, parent)
            categories = sorted(
                by_id.values(),
                key=lambda c: (c.level, c.name_th),
            )

    years: set[int] = set()
    for row in _published_dataset_query(db).with_entities(Dataset.dataset_metadata).all():
        meta = row[0] or {}
        for key in ("year", "year_start", "year_end"):
            value = meta.get(key)
            if value is not None:
                try:
                    years.add(int(value))
                except (TypeError, ValueError):
                    continue
    years_sorted = sorted(years, reverse=True)

    province_rows = (
        _published_dataset_query(db)
        .filter(Dataset.dataset_metadata["province"].isnot(None))
        .with_entities(Dataset.dataset_metadata["province"].astext.label("province"))
        .distinct()
        .all()
    )
    provinces = sorted(
        {str(row.province).strip() for row in province_rows if row.province},
        key=lambda v: (v != "all", v),
    )

    latest_file_subq = (
        db.query(
            DatasetFile.dataset_id.label("dataset_id"),
            DatasetFile.file_format.label("file_format"),
            func.row_number()
            .over(
                partition_by=DatasetFile.dataset_id,
                order_by=DatasetFile.created_at.desc(),
            )
            .label("rn"),
        )
        .join(Dataset, Dataset.id == DatasetFile.dataset_id)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
            DatasetFile.is_deleted.is_(False),
        )
        .subquery()
    )
    format_rows = (
        db.query(latest_file_subq.c.file_format)
        .filter(latest_file_subq.c.rn == 1)
        .distinct()
        .all()
    )
    format_order = ["csv", "excel", "json", "xml", "pdf", "sql"]
    formats = [
        fmt
        for fmt in format_order
        if fmt in {row[0] for row in format_rows if row[0]}
    ]

    agency_rows = (
        db.query(User.id, User.agency_name)
        .join(Dataset, Dataset.user_id == User.id)
        .filter(
            User.role == "agency",
            User.status == "active",
            User.is_deleted.is_(False),
            User.agency_name.isnot(None),
            Dataset.is_deleted.is_(False),
            Dataset.status == "published",
        )
        .distinct()
        .order_by(User.agency_name.asc())
        .all()
    )
    agencies = [
        {"agency_user_id": row[0], "agency_name": row[1]}
        for row in agency_rows
        if row[1]
    ]

    return {
        "categories": categories,
        "agencies": agencies,
        "years": years_sorted,
        "provinces": provinces,
        "formats": formats,
    }
