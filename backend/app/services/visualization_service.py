# Module: M5 Visualization
# Feature: Business Logic ตาม #56

import uuid
from typing import Any

from sqlalchemy.orm import Session

import app.repositories.dataset_repository as dataset_repo
import app.repositories.visualization_repository as viz_repo
from app.schemas.dataset_schema import DatasetResponse
from app.schemas.visualization_schema import (
    CompareResponse,
    DashboardLayoutResponse,
    DatasetYearStat,
    NewReleasesResponse,
    StatsOverviewResponse,
    TrendingResponse,
)


def _datasets_to_responses(
    db: Session, datasets: list
) -> list[DatasetResponse]:
    responses: list[DatasetResponse] = []
    for dataset in datasets:
        tag_ids = dataset_repo.get_dataset_tag_ids(db, dataset.id)
        item = DatasetResponse.model_validate(dataset)
        item.tags = tag_ids
        responses.append(item)
    return responses


def get_stats_overview(db: Session) -> StatsOverviewResponse:
    data = viz_repo.get_stats_overview(db)
    return StatsOverviewResponse(
        total_datasets=data["total_datasets"],
        total_downloads=data["total_downloads"],
        total_agencies=data["total_agencies"],
        datasets_by_year=[
            DatasetYearStat(**row) for row in data["datasets_by_year"]
        ],
    )


def get_trending(db: Session, limit: int = 10) -> TrendingResponse:
    datasets = viz_repo.get_trending_datasets(db, limit)
    return TrendingResponse(datasets=_datasets_to_responses(db, datasets))


def get_new_releases(db: Session, limit: int = 10) -> NewReleasesResponse:
    datasets = viz_repo.get_new_releases(db, limit)
    return NewReleasesResponse(datasets=_datasets_to_responses(db, datasets))


def compare_datasets(
    db: Session, dataset_ids: list[uuid.UUID]
) -> CompareResponse:
    datasets = viz_repo.get_datasets_for_compare(db, dataset_ids)
    return CompareResponse(datasets=_datasets_to_responses(db, datasets))


def get_dashboard_layout(
    db: Session, user_id: uuid.UUID
) -> DashboardLayoutResponse | None:
    layout = viz_repo.get_dashboard_layout(db, user_id)
    if layout is None:
        return None
    return DashboardLayoutResponse.model_validate(layout)


def save_dashboard_layout(
    db: Session, user_id: uuid.UUID, layout: dict[str, Any]
) -> DashboardLayoutResponse:
    record = viz_repo.upsert_dashboard_layout(db, user_id, layout)
    db.commit()
    db.refresh(record)
    return DashboardLayoutResponse.model_validate(record)
