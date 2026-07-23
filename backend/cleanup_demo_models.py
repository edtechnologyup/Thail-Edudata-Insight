"""
cleanup_demo_models.py — ลบข้อมูล demo models ที่สร้างจาก seed_demo_models.py

รันผ่าน Docker:
  docker compose exec backend python cleanup_demo_models.py
  docker compose -f docker-compose.prod.yml exec backend python cleanup_demo_models.py
"""

import json
import os

from minio import Minio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/datacatalog")
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.environ.get("MINIO_BUCKET_NAME", "datacatalog")

DEMO_MODELS_MARKER = "demo_models_seed_2026"


def main():
    engine = create_engine(DATABASE_URL)
    mc = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)

    with Session(engine) as db:
        row = db.execute(
            text("SELECT value FROM site_settings WHERE key = :k"),
            {"k": DEMO_MODELS_MARKER},
        ).first()

        if not row:
            print("ℹ️  ไม่พบข้อมูล demo models (ยังไม่เคยรัน seed_demo_models.py)")
            return

        data = json.loads(row[0])
        dataset_ids = data.get("dataset_ids", [])
        model_ids = data.get("model_ids", [])
        file_paths = data.get("file_paths", [])

        # 1. ลบ ML prediction logs
        for mid in model_ids:
            db.execute(text("DELETE FROM ml_prediction_logs WHERE model_id = :id"), {"id": mid})
        print(f"   🗑️  ลบ prediction logs ของ {len(model_ids)} models")

        # 2. ลบ ML models
        for mid in model_ids:
            db.execute(text("DELETE FROM ml_models WHERE id = :id"), {"id": mid})
        print(f"   🗑️  ลบ {len(model_ids)} ML models")

        # 3. ลบ dataset_files, data_dictionaries, dataset_tags, dataset_ratings, download_logs
        for did in dataset_ids:
            db.execute(text("DELETE FROM data_dictionaries WHERE dataset_id = :id"), {"id": did})
            db.execute(text("DELETE FROM dataset_files WHERE dataset_id = :id"), {"id": did})
            db.execute(text("DELETE FROM dataset_tags WHERE dataset_id = :id"), {"id": did})
            db.execute(text("DELETE FROM dataset_ratings WHERE dataset_id = :id"), {"id": did})
            db.execute(text("DELETE FROM download_logs WHERE dataset_id = :id"), {"id": did})
        print(f"   🗑️  ลบไฟล์และข้อมูลที่เกี่ยวข้องของ {len(dataset_ids)} datasets")

        # 4. ลบ datasets
        for did in dataset_ids:
            db.execute(text("DELETE FROM datasets WHERE id = :id"), {"id": did})
        print(f"   🗑️  ลบ {len(dataset_ids)} datasets")

        # 5. ลบไฟล์ใน MinIO
        deleted_files = 0
        for fp in file_paths:
            try:
                mc.remove_object(MINIO_BUCKET, fp)
                deleted_files += 1
            except Exception:
                pass
        print(f"   🗑️  ลบ {deleted_files} ไฟล์ใน MinIO")

        # 6. ลบ marker
        db.execute(text("DELETE FROM site_settings WHERE key = :k"), {"k": DEMO_MODELS_MARKER})
        db.commit()

    print("\n✅ cleanup_demo_models.py เสร็จสมบูรณ์!")


if __name__ == "__main__":
    main()
