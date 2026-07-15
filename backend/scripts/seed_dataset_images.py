"""
อัปโหลดรูปภาพปกให้ทุก Dataset ที่ยังไม่มีรูป

รันผ่าน Docker:
  docker exec datacatalog-backend-1 python scripts/seed_dataset_images.py

ลบรูป demo:
  docker exec datacatalog-backend-1 python scripts/seed_dataset_images.py --cleanup
"""

from __future__ import annotations

import os
import sys
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user_model import User  # noqa: F401
from app.models.category_model import Category  # noqa: F401
from app.models.dataset_file_model import DatasetFile  # noqa: F401
from app.models.dataset_model import Dataset
from minio import Minio

IMAGE_DIR = "/tmp/dataset-images"

IMAGES = [
    "1200_630_children8866.jpg",
    "19491224298_640c7f754f_k.jpg",
    "edu-meeting.jpg",
    "graduate.jpg",
    "p20-21-weekly-edu-02.jpg",
    "students-writing.jpg",
    "thai-education-1068x561.jpg",
]


def get_minio_client() -> Minio:
    return Minio(
        settings.MINIO_ENDPOINT,
        access_key=settings.MINIO_ACCESS_KEY,
        secret_key=settings.MINIO_SECRET_KEY,
        secure=False,
    )


def seed(db, client: Minio):
    bucket = settings.MINIO_BUCKET_NAME

    image_paths = []
    for name in IMAGES:
        path = os.path.join(IMAGE_DIR, name)
        if os.path.exists(path):
            image_paths.append(path)
        else:
            print(f"  ⚠ ไม่พบ: {path}")

    if not image_paths:
        print("❌ ไม่พบรูปภาพเลย")
        sys.exit(1)

    datasets = (
        db.query(Dataset)
        .filter(Dataset.is_deleted.is_(False))
        .all()
    )

    count = 0
    for ds in datasets:
        src = random.choice(image_paths)
        object_name = f"datasets/{ds.id}/image.jpg"

        client.fput_object(
            bucket, object_name, src, content_type="image/jpeg"
        )

        ds.image_url = f"/datasets/{ds.id}/image-file"
        count += 1
        if count % 20 == 0:
            print(f"  ... {count} datasets")

    db.commit()
    print(f"\n✅ อัปโหลดรูป + อัปเดต image_url ให้ {count} datasets")


def cleanup(db, client: Minio):
    bucket = settings.MINIO_BUCKET_NAME

    datasets = (
        db.query(Dataset)
        .filter(
            Dataset.is_deleted.is_(False),
            Dataset.image_url.isnot(None),
        )
        .all()
    )

    removed = 0
    for ds in datasets:
        for ext in ["jpg", "png", "webp"]:
            try:
                client.remove_object(bucket, f"datasets/{ds.id}/image.{ext}")
            except Exception:
                pass
        ds.image_url = None
        removed += 1

    db.commit()
    print(f"🗑️  ลบรูป + ล้าง image_url: {removed} datasets")


def main():
    is_cleanup = "--cleanup" in sys.argv
    client = get_minio_client()
    db = SessionLocal()
    try:
        if is_cleanup:
            print("=== Cleanup dataset images ===")
            cleanup(db, client)
        else:
            print("=== Seed dataset images ===")
            seed(db, client)
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
