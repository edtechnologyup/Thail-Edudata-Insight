import uuid

from sqlalchemy.orm import Session

from app.models.data_dictionary_model import DataDictionary


def get_entries(
    db: Session, dataset_id: uuid.UUID, file_id: uuid.UUID
) -> list[DataDictionary]:
    return (
        db.query(DataDictionary)
        .filter(
            DataDictionary.dataset_id == dataset_id,
            DataDictionary.file_id == file_id,
        )
        .order_by(DataDictionary.column_order)
        .all()
    )


def get_entries_by_dataset(
    db: Session, dataset_id: uuid.UUID
) -> list[DataDictionary]:
    return (
        db.query(DataDictionary)
        .filter(DataDictionary.dataset_id == dataset_id)
        .order_by(DataDictionary.file_id, DataDictionary.column_order)
        .all()
    )


def delete_entries(
    db: Session, dataset_id: uuid.UUID, file_id: uuid.UUID
) -> None:
    db.query(DataDictionary).filter(
        DataDictionary.dataset_id == dataset_id,
        DataDictionary.file_id == file_id,
    ).delete()


def bulk_create(
    db: Session,
    dataset_id: uuid.UUID,
    file_id: uuid.UUID,
    entries: list[dict],
) -> list[DataDictionary]:
    objects = [
        DataDictionary(
            dataset_id=dataset_id,
            file_id=file_id,
            column_name=e["column_name"],
            description=e.get("description"),
            data_type=e.get("data_type"),
            sample_value=e.get("sample_value"),
            column_order=e.get("column_order", idx),
        )
        for idx, e in enumerate(entries)
    ]
    db.add_all(objects)
    db.flush()
    return objects
