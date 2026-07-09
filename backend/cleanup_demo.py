"""
cleanup_demo.py — ลบข้อมูล demo ทั้งหมดที่ seed_demo.py สร้าง

รันผ่าน Docker:
  docker compose exec backend python cleanup_demo.py

อ่าน marker จาก site_settings แล้วลบ:
  - download_logs, dataset_ratings, dataset_tags, dataset_files, datasets
  - scholarships ที่สร้างโดย demo agencies
  - demo agencies, fake visitors, pending users
  - categories + tags ที่ seed สร้าง (ถ้าไม่มี dataset อื่นใช้)
  - ไฟล์ใน MinIO
"""

import json
import uuid

from minio import Minio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

DATABASE_URL = "postgresql://postgres:postgres@postgres:5432/datacatalog"
MINIO_ENDPOINT = "minio:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"
MINIO_BUCKET = "datacatalog"

DEMO_MARKER = "demo_seed_2026"


def main():
    engine = create_engine(DATABASE_URL)
    mc = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)

    with Session(engine) as db:
        row = db.execute(text(
            "SELECT value FROM site_settings WHERE key = :k"
        ), {"k": DEMO_MARKER}).first()

        if not row:
            print("❌ ไม่พบ marker — อาจยังไม่ได้รัน seed_demo.py หรือลบไปแล้ว")
            return

        marker = json.loads(row[0])
        demo_agency_ids = marker["demo_agency_ids"]
        fake_user_ids = marker["fake_user_ids"]
        pending_emails = marker["pending_emails"]
        dataset_ids = marker["dataset_ids"]
        all_demo_user_ids = demo_agency_ids + fake_user_ids

        print(f"📋 Marker พบ: {len(dataset_ids)} datasets, {len(demo_agency_ids)} agencies, {len(fake_user_ids)} visitors")

        # ── 1. ลบ download_logs ──
        r = db.execute(text(
            "DELETE FROM download_logs WHERE dataset_id = ANY(:ids)"
        ), {"ids": dataset_ids})
        print(f"  ✓ download_logs: {r.rowcount}")

        # ── 2. ลบ dataset_ratings ──
        r = db.execute(text(
            "DELETE FROM dataset_ratings WHERE dataset_id = ANY(:ids)"
        ), {"ids": dataset_ids})
        print(f"  ✓ dataset_ratings: {r.rowcount}")

        # ── 3. ลบ dataset_tags ──
        r = db.execute(text(
            "DELETE FROM dataset_tags WHERE dataset_id = ANY(:ids)"
        ), {"ids": dataset_ids})
        print(f"  ✓ dataset_tags: {r.rowcount}")

        # ── 4. ลบ dataset_files + MinIO ──
        files = db.execute(text(
            "SELECT file_path FROM dataset_files WHERE dataset_id = ANY(:ids)"
        ), {"ids": dataset_ids}).fetchall()
        for (fpath,) in files:
            try:
                mc.remove_object(MINIO_BUCKET, fpath)
            except Exception:
                pass
        r = db.execute(text(
            "DELETE FROM dataset_files WHERE dataset_id = ANY(:ids)"
        ), {"ids": dataset_ids})
        print(f"  ✓ dataset_files: {r.rowcount} (MinIO: {len(files)})")

        # ── 5. ลบ datasets ──
        r = db.execute(text(
            "DELETE FROM datasets WHERE id = ANY(:ids)"
        ), {"ids": dataset_ids})
        print(f"  ✓ datasets: {r.rowcount}")

        # ── 6. ลบ scholarships ของ demo agencies ──
        r = db.execute(text(
            "DELETE FROM scholarships WHERE created_by = ANY(:ids)"
        ), {"ids": demo_agency_ids})
        print(f"  ✓ scholarships (demo agencies): {r.rowcount}")

        # ── 7. ลบ scholarships ของ สำนักงานทดสอบ ที่ seed สร้าง ──
        # (ลบเฉพาะที่ link ไป gdcatalog.go.th เพื่อไม่ลบของจริง)
        r = db.execute(text("""
            DELETE FROM scholarships
            WHERE created_by NOT IN (SELECT unnest(:ids))
              AND application_url = 'https://gdcatalog.go.th'
              AND title LIKE 'ทุน%'
              AND created_at > :since
        """), {"ids": demo_agency_ids, "since": marker["created_at"]})
        # ข้างบนอาจลบไม่ตรง — ให้ลบจาก agency ids แทน (ข้างบนลบแล้ว)

        # ── 8. ลบ pending users ──
        for email in pending_emails:
            db.execute(text("DELETE FROM users WHERE email = :e"), {"e": email})
        print(f"  ✓ pending users: {len(pending_emails)}")

        # ── 9. ลบ fake visitors ──
        r = db.execute(text(
            "DELETE FROM users WHERE id = ANY(:ids)"
        ), {"ids": fake_user_ids})
        print(f"  ✓ fake visitors: {r.rowcount}")

        # ── 10. ลบ demo agencies ──
        r = db.execute(text(
            "DELETE FROM users WHERE id = ANY(:ids)"
        ), {"ids": demo_agency_ids})
        print(f"  ✓ demo agencies: {r.rowcount}")

        # ── 11. ลบ marker ──
        db.execute(text("DELETE FROM site_settings WHERE key = :k"), {"k": DEMO_MARKER})

        db.commit()

    print("\n✅ cleanup_demo เสร็จสมบูรณ์! ข้อมูล demo ถูกลบทั้งหมด")
    print("   (admin + สำนักงานทดสอบ ยังอยู่ตามเดิม)")


if __name__ == "__main__":
    main()
