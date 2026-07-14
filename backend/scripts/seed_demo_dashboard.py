"""
Seed ข้อมูล demo สำหรับ Agency Dashboard:
  1. download_logs  — กระจายย้อนหลัง 12 เดือน
  2. audit_logs     — กิจกรรมล่าสุด 30 วัน
  3. อัปเดต download_count ใน datasets

รันผ่าน Docker:
  docker exec -it thail-datacatalog-backend-1 python scripts/seed_demo_dashboard.py

ลบข้อมูล demo:
  docker exec -it thail-datacatalog-backend-1 python scripts/seed_demo_dashboard.py --cleanup
"""

from __future__ import annotations

import os
import sys
import uuid
import random
from datetime import datetime, timedelta, timezone

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import func
from app.core.database import SessionLocal
from app.models.user_model import User
from app.models.category_model import Category  # noqa: F401 — FK resolve
from app.models.dataset_model import Dataset
from app.models.dataset_file_model import DatasetFile  # noqa: F401 — FK resolve
from app.models.download_log_model import DownloadLog
from app.models.audit_log_model import AuditLog

AGENCY_EMAIL = "tatsaneewanyenwattana@gmail.com"
DEMO_IP = "203.0.113.50"
DEMO_USER_AGENT = "seed_demo_dashboard.py"

MONTHLY_DOWNLOADS = [
    (12, 3),
    (11, 8),
    (10, 15),
    (9, 5),
    (8, 22),
    (7, 10),
    (6, 18),
    (5, 7),
    (4, 12),
    (3, 25),
    (2, 9),
    (1, 14),
]

PURPOSES = [
    "วิจัยเชิงวิชาการ",
    "จัดทำรายงานประจำปี",
    "วิเคราะห์ข้อมูลสถิติ",
    "ประกอบการสอน",
    "ศึกษาข้อมูลเพื่อวางแผน",
]

FORMATS = ["csv", "excel", "json"]

ACTIVITY_TEMPLATES = [
    {"action": "dataset.upload", "age_days": 2},
    {"action": "dataset.update", "age_days": 3},
    {"action": "dataset.upload", "age_days": 5},
    {"action": "dataset.update", "age_days": 7},
    {"action": "dataset.upload", "age_days": 10},
    {"action": "dataset.update", "age_days": 14},
    {"action": "dataset.update", "age_days": 18},
    {"action": "dataset.upload", "age_days": 22},
    {"action": "dataset.update", "age_days": 25},
    {"action": "dataset.upload", "age_days": 28},
]


def get_agency_user(db):
    user = (
        db.query(User)
        .filter(User.email == AGENCY_EMAIL, User.is_deleted.is_(False))
        .first()
    )
    if user is None:
        print(f"❌ ไม่พบ user: {AGENCY_EMAIL}")
        sys.exit(1)
    return user


def get_agency_datasets(db, user_id):
    datasets = (
        db.query(Dataset)
        .filter(Dataset.user_id == user_id, Dataset.is_deleted.is_(False))
        .all()
    )
    if not datasets:
        print("❌ ไม่พบ dataset ของ agency นี้ — ต้องอัปโหลด dataset ก่อน")
        sys.exit(1)
    return datasets


def seed_download_logs(db, user_id, datasets):
    now = datetime.now(timezone.utc)
    created = 0
    download_counts = {ds.id: 0 for ds in datasets}

    for months_ago, count in MONTHLY_DOWNLOADS:
        for _ in range(count):
            ds = random.choice(datasets)
            day = random.randint(1, 28)
            target_month = now.month - months_ago
            target_year = now.year
            while target_month <= 0:
                target_month += 12
                target_year -= 1

            ts = datetime(
                target_year, target_month, day,
                random.randint(8, 22), random.randint(0, 59),
                tzinfo=timezone.utc,
            )

            log = DownloadLog(
                id=uuid.uuid4(),
                dataset_id=ds.id,
                user_id=None,
                ip_address=DEMO_IP,
                purpose=random.choice(PURPOSES),
                file_format=random.choice(FORMATS),
                source="web",
                created_at=ts,
            )
            db.add(log)
            download_counts[ds.id] += 1
            created += 1

    for ds in datasets:
        ds.download_count = (ds.download_count or 0) + download_counts[ds.id]

    db.flush()
    return created


def seed_audit_logs(db, user_id, datasets):
    now = datetime.now(timezone.utc)
    created = 0

    for tmpl in ACTIVITY_TEMPLATES:
        ds = random.choice(datasets)
        ts = now - timedelta(
            days=tmpl["age_days"],
            hours=random.randint(0, 12),
            minutes=random.randint(0, 59),
        )

        detail = {"title": ds.title}
        if tmpl["action"] == "dataset.upload":
            detail["status"] = ds.status

        log = AuditLog(
            id=uuid.uuid4(),
            user_id=user_id,
            action=tmpl["action"],
            target_type="dataset",
            target_id=ds.id,
            detail=detail,
            ip_address=DEMO_IP,
            user_agent=DEMO_USER_AGENT,
            created_at=ts,
        )
        db.add(log)
        created += 1

    db.flush()
    return created


def cleanup(db, user_id):
    dl_count = (
        db.query(DownloadLog)
        .filter(DownloadLog.ip_address == DEMO_IP)
        .delete()
    )

    al_count = (
        db.query(AuditLog)
        .filter(
            AuditLog.user_id == user_id,
            AuditLog.user_agent == DEMO_USER_AGENT,
        )
        .delete()
    )

    datasets = get_agency_datasets(db, user_id)
    for ds in datasets:
        real_count = (
            db.query(func.count(DownloadLog.id))
            .filter(DownloadLog.dataset_id == ds.id)
            .scalar()
        ) or 0
        ds.download_count = real_count

    db.commit()
    print(f"🗑️  ลบ download_logs: {dl_count} แถว")
    print(f"🗑️  ลบ audit_logs: {al_count} แถว")
    print("✅ download_count sync แล้ว")


def main():
    is_cleanup = "--cleanup" in sys.argv

    db = SessionLocal()
    try:
        user = get_agency_user(db)
        print(f"Agency: {user.email} (id={user.id})")

        if is_cleanup:
            print("\n=== Cleanup demo data ===")
            cleanup(db, user.id)
            return

        datasets = get_agency_datasets(db, user.id)
        print(f"Datasets: {len(datasets)} ชุด")
        for ds in datasets:
            print(f"  - {ds.title} ({ds.id})")

        print("\n=== Seed download_logs ===")
        dl_count = seed_download_logs(db, user.id, datasets)
        print(f"  สร้าง {dl_count} แถว (กระจาย 12 เดือน)")

        print("\n=== Seed audit_logs ===")
        al_count = seed_audit_logs(db, user.id, datasets)
        print(f"  สร้าง {al_count} แถว (30 วันล่าสุด)")

        db.commit()
        print("\n✅ Seed demo dashboard สำเร็จ")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Error: {e}")
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
