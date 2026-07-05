# Module: M7 Public API
# Feature: Business Logic ตาม #5 #56

import uuid

from sqlalchemy.orm import Session

import app.repositories.dataset_repository as dataset_repo
import app.services.dataset_service as dataset_service
from app.core.errors import raise_app_error
from app.core.pagination import PaginationParams
from app.schemas.dataset_schema import DatasetResponse
from app.schemas.public_schema import DatasetStatsResponse, PublicAgencyResponse


def list_published_datasets(
    db: Session, pagination: PaginationParams
) -> tuple[list[DatasetResponse], int]:
    return dataset_service.list_datasets(
        db,
        pagination=pagination,
        status_filter="published",
    )


def get_published_dataset(
    db: Session, dataset_id: uuid.UUID
) -> DatasetResponse:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None or dataset.status != "published":
        raise_app_error("DATASET_NOT_FOUND")
    dataset_service.record_dataset_view(db, dataset_id)
    return dataset_service._build_dataset_response(db, dataset_id)


def list_agencies_with_published_datasets(
    db: Session,
) -> list[PublicAgencyResponse]:
    from sqlalchemy import func

    from app.models.dataset_model import Dataset
    from app.models.user_model import User

    rows = (
        db.query(
            User.id,
            User.agency_name,
            User.agency_name_en,
            User.agency_type,
            User.agency_website,
            User.email,
            User.contact_phone,
            User.image_url,
            func.count(Dataset.id).label("dataset_count"),
            func.coalesce(func.sum(Dataset.download_count), 0).label("total_downloads"),
            func.coalesce(func.sum(Dataset.view_count), 0).label("total_views"),
        )
        .join(Dataset, Dataset.user_id == User.id)
        .filter(
            User.role == "agency",
            User.status == "active",
            User.is_deleted.is_(False),
            Dataset.status == "published",
            Dataset.is_deleted.is_(False),
        )
        .group_by(User.id)
        .order_by(func.count(Dataset.id).desc())
        .all()
    )
    return [
        PublicAgencyResponse(
            agency_user_id=row.id,
            agency_name=row.agency_name or "",
            agency_name_en=row.agency_name_en,
            agency_type=row.agency_type,
            agency_website=row.agency_website,
            contact_email=row.email,
            contact_phone=row.contact_phone,
            image_url=row.image_url,
            dataset_count=row.dataset_count,
            total_downloads=row.total_downloads,
            total_views=row.total_views,
        )
        for row in rows
    ]


def get_agency_detail(
    db: Session, agency_id: uuid.UUID
) -> PublicAgencyResponse:
    from sqlalchemy import func

    from app.models.dataset_model import Dataset
    from app.models.user_model import User

    user = (
        db.query(User)
        .filter(
            User.id == agency_id,
            User.role == "agency",
            User.status == "active",
            User.is_deleted.is_(False),
        )
        .first()
    )
    if user is None:
        raise_app_error("USER_NOT_FOUND")

    stats = (
        db.query(
            func.count(Dataset.id).label("dataset_count"),
            func.coalesce(func.sum(Dataset.download_count), 0).label("total_downloads"),
            func.coalesce(func.sum(Dataset.view_count), 0).label("total_views"),
        )
        .filter(
            Dataset.user_id == agency_id,
            Dataset.status == "published",
            Dataset.is_deleted.is_(False),
        )
        .first()
    )

    return PublicAgencyResponse(
        agency_user_id=user.id,
        agency_name=user.agency_name or "",
        agency_name_en=user.agency_name_en,
        agency_type=user.agency_type,
        agency_website=user.agency_website,
        contact_email=user.email,
        contact_phone=user.contact_phone,
        image_url=user.image_url,
        dataset_count=stats.dataset_count if stats else 0,
        total_downloads=stats.total_downloads if stats else 0,
        total_views=stats.total_views if stats else 0,
    )


def list_agency_published_datasets(
    db: Session, agency_id: uuid.UUID, pagination: PaginationParams
) -> tuple[list[DatasetResponse], int]:
    return dataset_service.list_datasets(
        db,
        pagination=pagination,
        status_filter="published",
        user_id=agency_id,
    )


def get_dataset_stats(
    db: Session, dataset_id: uuid.UUID
) -> DatasetStatsResponse:
    dataset = dataset_repo.get_dataset_by_id(db, dataset_id)
    if dataset is None or dataset.status != "published":
        raise_app_error("DATASET_NOT_FOUND")
    return DatasetStatsResponse(
        dataset_id=dataset.id,
        download_count=dataset.download_count,
        view_count=dataset.view_count,
        quality_score=dataset.quality_score,
        published_at=dataset.published_at,
    )
