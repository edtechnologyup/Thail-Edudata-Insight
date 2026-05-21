# Module: M3 Search
# Feature: Database Queries ตาม #56

import uuid

from sqlalchemy.orm import Session

from app.models.saved_search_model import SavedSearch


def create_saved_search(
    db: Session,
    user_id: uuid.UUID,
    name: str,
    filters: dict,
) -> SavedSearch:
    saved_search = SavedSearch(
        user_id=user_id,
        name=name,
        filters=filters,
    )
    db.add(saved_search)
    db.flush()
    return saved_search


def get_saved_searches(db: Session, user_id: uuid.UUID) -> list[SavedSearch]:
    return (
        db.query(SavedSearch)
        .filter(SavedSearch.user_id == user_id)
        .order_by(SavedSearch.created_at.desc())
        .all()
    )


def get_saved_search_by_id(
    db: Session, saved_search_id: uuid.UUID
) -> SavedSearch | None:
    return (
        db.query(SavedSearch)
        .filter(SavedSearch.id == saved_search_id)
        .first()
    )


def soft_delete_saved_search(db: Session, saved_search_id: uuid.UUID) -> None:
    from app.core.errors import raise_app_error

    saved_search = get_saved_search_by_id(db, saved_search_id)
    if saved_search is None:
        raise_app_error("NOT_FOUND")
    saved_search.is_deleted = True
    db.flush()
