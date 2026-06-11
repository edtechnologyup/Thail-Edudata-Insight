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
    import app.repositories.search_repository as search_repo

    raw = search_repo.get_search_filter_options(db)
    return [
        PublicAgencyResponse(
            agency_user_id=item["agency_user_id"],
            agency_name=item["agency_name"],
        )
        for item in raw["agencies"]
    ]


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
