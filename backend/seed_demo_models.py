"""
seed_demo_models.py — สร้าง dataset + ML model ตัวอย่าง (demo)

รันผ่าน Docker:
  docker compose exec backend python seed_demo_models.py
  docker compose -f docker-compose.prod.yml exec backend python seed_demo_models.py

สร้าง:
  - 5 datasets ข้อมูลการศึกษาสมจริง (มี pattern)
  - 5 ML models (3 regression + 2 classification) เปิด public
  - โมเดลพร้อมใช้งาน ลองทำนายได้ทันที

ลบด้วย: docker compose exec backend python cleanup_demo_models.py
"""

import csv
import io
import json
import os
import random
import uuid
import time
from datetime import datetime, timezone

from minio import Minio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/datacatalog")
MINIO_ENDPOINT = os.environ.get("MINIO_ENDPOINT", "minio:9000")
MINIO_ACCESS_KEY = os.environ.get("MINIO_ACCESS_KEY", "minioadmin")
MINIO_SECRET_KEY = os.environ.get("MINIO_SECRET_KEY", "minioadmin")
MINIO_BUCKET = os.environ.get("MINIO_BUCKET_NAME", "datacatalog")

DEMO_MODELS_MARKER = "demo_models_seed_2026"

PROVINCES = [
    "กรุงเทพมหานคร", "เชียงใหม่", "ขอนแก่น", "นครราชสีมา", "สงขลา",
    "ชลบุรี", "เชียงราย", "อุดรธานี", "สุราษฎร์ธานี", "พะเยา",
    "ลำปาง", "พิษณุโลก", "นครสวรรค์", "อุบลราชธานี", "ภูเก็ต",
    "ตรัง", "ร้อยเอ็ด", "สุรินทร์", "เพชรบุรี", "นครพนม",
]


def _noise(base, pct=0.1):
    return base * (1 + random.uniform(-pct, pct))


# ── Dataset 1: ทำนายอัตราผ่าน (regression) ──
def gen_pass_rate_data(n=60):
    rows = []
    for i in range(n):
        prov = random.choice(PROVINCES)
        teacher_count = random.randint(500, 50000)
        ratio = round(random.uniform(10, 22), 2)
        student_count = int(teacher_count * ratio)
        school_count = int(_noise(student_count / random.uniform(100, 200)))
        budget = round(_noise(teacher_count * 0.15 + school_count * 1.2), 2)
        # pass_rate: ครูเยอะ(ratio ต่ำ) + งบเยอะต่อหัว → ผ่านสูง
        budget_per_student = budget / max(student_count, 1) * 1000
        base_rate = 90 - ratio * 1.5 + budget_per_student * 0.8
        pass_rate = round(min(max(base_rate + random.uniform(-3, 3), 55), 95), 1)
        rows.append({
            "province": prov,
            "school_count": school_count,
            "student_count": student_count,
            "teacher_count": teacher_count,
            "student_teacher_ratio": ratio,
            "budget_million": budget,
            "pass_rate": pass_rate,
        })
    return rows


# ── Dataset 2: ทำนายระดับชั้น (classification) ──
def gen_level_data(n=60):
    rows = []
    for i in range(n):
        prov = random.choice(PROVINCES)
        level = random.choice(["ประถมศึกษา", "มัธยมศึกษา"])
        if level == "ประถมศึกษา":
            school_count = int(_noise(random.randint(300, 1200)))
            student_count = int(_noise(school_count * random.uniform(150, 250)))
            teacher_count = int(_noise(student_count / random.uniform(15, 18)))
            budget = round(_noise(student_count * 0.012 + 500), 2)
        else:
            school_count = int(_noise(random.randint(100, 600)))
            student_count = int(_noise(school_count * random.uniform(100, 180)))
            teacher_count = int(_noise(student_count / random.uniform(13, 16)))
            budget = round(_noise(student_count * 0.018 + 300), 2)
        rows.append({
            "province": prov,
            "school_count": school_count,
            "student_count": student_count,
            "teacher_count": teacher_count,
            "budget_million": budget,
            "level": level,
        })
    return rows


# ── Dataset 3: ทำนายงบประมาณ (regression) ──
def gen_budget_data(n=60):
    rows = []
    for i in range(n):
        prov = random.choice(PROVINCES)
        population = random.randint(200000, 5000000)
        school_count = int(_noise(population / 3000))
        student_count = int(_noise(population * random.uniform(0.12, 0.18)))
        teacher_count = int(_noise(student_count / random.uniform(14, 17)))
        # budget มี pattern: ประชากร + นักเรียน → งบเยอะ
        budget = round(_noise(population * 0.002 + student_count * 0.01 + school_count * 0.8), 2)
        rows.append({
            "province": prov,
            "population": population,
            "school_count": school_count,
            "student_count": student_count,
            "teacher_count": teacher_count,
            "budget_million": budget,
        })
    return rows


# ── Dataset 4: ทำนายเกรด O-NET (classification) ──
def gen_onet_data(n=80):
    rows = []
    for i in range(n):
        prov = random.choice(PROVINCES)
        study_hours = round(random.uniform(5, 30), 1)
        attendance = round(random.uniform(60, 100), 1)
        teacher_quality = round(random.uniform(50, 100), 1)
        school_size = random.choice(["เล็ก", "กลาง", "ใหญ่", "ใหญ่พิเศษ"])
        size_bonus = {"เล็ก": -8, "กลาง": 0, "ใหญ่": 8, "ใหญ่พิเศษ": 14}[school_size]
        # score มี pattern ชัด
        score = study_hours * 1.8 + attendance * 0.4 + teacher_quality * 0.25 + size_bonus + random.uniform(-3, 3)
        if score >= 70:
            grade = "A"
        elif score >= 55:
            grade = "B"
        elif score >= 40:
            grade = "C"
        else:
            grade = "D"
        rows.append({
            "province": prov,
            "study_hours_per_week": study_hours,
            "attendance_rate": attendance,
            "teacher_quality_score": teacher_quality,
            "school_size": school_size,
            "grade": grade,
        })
    return rows


# ── Dataset 5: ทำนายอัตราครูต่อนักเรียน (regression) ──
def gen_ratio_data(n=60):
    rows = []
    for i in range(n):
        prov = random.choice(PROVINCES)
        school_type = random.choice(["รัฐบาล", "เอกชน", "สาธิต"])
        school_count = random.randint(50, 800)
        if school_type == "รัฐบาล":
            student_count = int(_noise(school_count * random.uniform(120, 200)))
            teacher_count = int(_noise(student_count / random.uniform(15, 20)))
        elif school_type == "เอกชน":
            student_count = int(_noise(school_count * random.uniform(80, 150)))
            teacher_count = int(_noise(student_count / random.uniform(10, 14)))
        else:
            student_count = int(_noise(school_count * random.uniform(60, 100)))
            teacher_count = int(_noise(student_count / random.uniform(8, 12)))
        budget = round(_noise(student_count * 0.015 + teacher_count * 0.5), 2)
        ratio = round(student_count / max(teacher_count, 1), 2)
        rows.append({
            "province": prov,
            "school_type": school_type,
            "school_count": school_count,
            "student_count": student_count,
            "teacher_count": teacher_count,
            "budget_million": budget,
            "student_teacher_ratio": ratio,
        })
    return rows


DATASETS_CONFIG = [
    {
        "title": "สถิตินักเรียนรายจังหวัดและอัตราผ่าน ปี 2567",
        "description": "ข้อมูลสถิตินักเรียน ครู โรงเรียน งบประมาณ และอัตราการสอบผ่านรายจังหวัด ปีการศึกษา 2567",
        "generator": gen_pass_rate_data,
        "model_name": "ทำนายอัตราสอบผ่านรายจังหวัด",
        "model_desc": "ทำนายอัตราการสอบผ่าน (pass_rate) จากจำนวนโรงเรียน นักเรียน ครู และงบประมาณ",
        "target": "pass_rate",
        "features": ["school_count", "student_count", "teacher_count", "student_teacher_ratio", "budget_million"],
    },
    {
        "title": "สถิติโรงเรียนแยกระดับชั้น ปี 2567",
        "description": "ข้อมูลจำนวนโรงเรียน นักเรียน ครู งบประมาณ แยกตามระดับชั้น (ประถม/มัธยม) รายจังหวัด",
        "generator": gen_level_data,
        "model_name": "จำแนกระดับชั้นการศึกษา",
        "model_desc": "จำแนกระดับชั้น (ประถมศึกษา/มัธยมศึกษา) จากสถิติโรงเรียน นักเรียน ครู และงบประมาณ",
        "target": "level",
        "features": ["school_count", "student_count", "teacher_count", "budget_million"],
    },
    {
        "title": "งบประมาณการศึกษารายจังหวัด ปี 2567",
        "description": "ข้อมูลประชากร จำนวนโรงเรียน นักเรียน ครู และงบประมาณการศึกษารายจังหวัด",
        "generator": gen_budget_data,
        "model_name": "ทำนายงบประมาณการศึกษา",
        "model_desc": "ทำนายงบประมาณการศึกษา (ล้านบาท) จากจำนวนประชากร โรงเรียน นักเรียน และครู",
        "target": "budget_million",
        "features": ["population", "school_count", "student_count", "teacher_count"],
    },
    {
        "title": "ผลคะแนนสอบ O-NET รายจังหวัด ปี 2567",
        "description": "ข้อมูลปัจจัยที่ส่งผลต่อคะแนน O-NET: ชั่วโมงเรียน อัตราเข้าเรียน คุณภาพครู ขนาดโรงเรียน",
        "generator": gen_onet_data,
        "model_name": "จำแนกเกรด O-NET",
        "model_desc": "จำแนกเกรด O-NET (A/B/C/D) จากชั่วโมงเรียน อัตราเข้าเรียน คุณภาพครู และขนาดโรงเรียน",
        "target": "grade",
        "features": ["study_hours_per_week", "attendance_rate", "teacher_quality_score", "school_size"],
    },
    {
        "title": "อัตราส่วนครูต่อนักเรียนแยกประเภทโรงเรียน ปี 2567",
        "description": "ข้อมูลอัตราส่วนครูต่อนักเรียนแยกตามประเภทโรงเรียน (รัฐ/เอกชน/สาธิต) รายจังหวัด",
        "generator": gen_ratio_data,
        "model_name": "ทำนายอัตราส่วนครูต่อนักเรียน",
        "model_desc": "ทำนายอัตราส่วนนักเรียนต่อครูจากประเภทโรงเรียน จำนวนนักเรียน ครู และงบประมาณ",
        "target": "student_teacher_ratio",
        "features": ["school_type", "school_count", "student_count", "teacher_count", "budget_million"],
    },
]


def rows_to_csv_bytes(rows: list[dict]) -> bytes:
    buf = io.StringIO()
    w = csv.DictWriter(buf, fieldnames=rows[0].keys())
    w.writeheader()
    w.writerows(rows)
    return buf.getvalue().encode("utf-8")


def main():
    random.seed(42)

    engine = create_engine(DATABASE_URL)
    mc = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)
    if not mc.bucket_exists(MINIO_BUCKET):
        mc.make_bucket(MINIO_BUCKET)

    now = datetime.now(timezone.utc)

    with Session(engine) as db:
        # ── ตรวจว่าเคยรันแล้วยัง ──
        existing = db.execute(
            text("SELECT value FROM site_settings WHERE key = :k"),
            {"k": DEMO_MODELS_MARKER},
        ).first()
        if existing:
            print("⚠️  เคยรัน seed_demo_models.py แล้ว")
            print("   ลบก่อนด้วย: python cleanup_demo_models.py")
            return

        # ── หา agency owner ──
        owner_row = db.execute(text(
            "SELECT id FROM users WHERE role IN ('agency', 'admin') AND status = 'active' AND is_deleted = false ORDER BY role DESC LIMIT 1"
        )).first()
        if not owner_row:
            print("❌ ไม่พบ user (agency/admin) — ต้องมีอยู่ในระบบก่อน")
            return
        owner_id = str(owner_row[0])
        print(f"  ✓ ใช้ owner: {owner_id}")

        # ── หา category ──
        cat_row = db.execute(text(
            "SELECT id FROM categories WHERE is_deleted = false LIMIT 1"
        )).first()
        cat_id = str(cat_row[0]) if cat_row else None

        created_dataset_ids = []
        created_model_ids = []
        created_file_paths = []

        for idx, cfg in enumerate(DATASETS_CONFIG):
            print(f"\n{'='*50}")
            print(f"📊 Dataset {idx+1}/5: {cfg['title']}")

            # 1. Generate data
            rows = cfg["generator"]()
            csv_bytes = rows_to_csv_bytes(rows)
            print(f"   สร้างข้อมูล {len(rows)} แถว")

            # 2. Upload to MinIO
            ds_id = uuid.uuid4()
            file_id = uuid.uuid4()
            file_path = f"datasets/{ds_id}/{file_id}.csv"
            mc.put_object(MINIO_BUCKET, file_path, io.BytesIO(csv_bytes), len(csv_bytes), content_type="text/csv")
            created_file_paths.append(file_path)
            print(f"   อัปโหลดไฟล์: {file_path}")

            # 3. Insert dataset
            db.execute(text("""
                INSERT INTO datasets (id, user_id, category_id, title, description, status, license,
                    metadata, quality_score, download_count, view_count,
                    published_at, is_deleted, created_at, updated_at)
                VALUES (:id, :uid, :cid, :title, :desc, 'published', 'open',
                    :meta, :qs, :dl, :vc,
                    :pub, false, :ts, :ts)
            """), {
                "id": str(ds_id), "uid": owner_id, "cid": cat_id,
                "title": cfg["title"], "desc": cfg["description"],
                "meta": json.dumps({
                    "data_type": "สถิติ",
                    "geographic_scope": "ระดับจังหวัด",
                    "contact_email": "demo@edudata.go.th",
                }),
                "qs": random.randint(75, 95),
                "dl": random.randint(50, 300),
                "vc": random.randint(100, 1000),
                "pub": now, "ts": now,
            })

            # 4. Insert dataset_file
            db.execute(text("""
                INSERT INTO dataset_files (id, dataset_id, file_name, file_path, file_size, file_format,
                    is_deleted, created_at, updated_at)
                VALUES (:id, :did, :fname, :fpath, :fsize, 'csv', false, :ts, :ts)
            """), {
                "id": str(file_id), "did": str(ds_id),
                "fname": f"{cfg['title']}.csv", "fpath": file_path,
                "fsize": len(csv_bytes), "ts": now,
            })

            created_dataset_ids.append(str(ds_id))
            db.commit()

            # 5. Create ML model + train
            model_id = uuid.uuid4()
            db.execute(text("""
                INSERT INTO ml_models (id, user_id, dataset_id, name, description,
                    target_column, feature_columns, model_type, status,
                    is_public, is_deleted, created_at, updated_at)
                VALUES (:id, :uid, :did, :name, :desc,
                    :target, :features, 'regression', 'training',
                    false, false, :ts, :ts)
            """), {
                "id": str(model_id), "uid": owner_id, "did": str(ds_id),
                "name": cfg["model_name"], "desc": cfg["model_desc"],
                "target": cfg["target"],
                "features": json.dumps(cfg["features"]),
                "ts": now,
            })
            db.commit()

            print(f"   🤖 เทรนโมเดล: {cfg['model_name']}...")
            try:
                from app.ml_engine.trainer import train_model
                start = time.time()
                result = train_model(
                    dataset_file_path=file_path,
                    file_format="csv",
                    target_column=cfg["target"],
                    feature_columns=cfg["features"],
                    model_id=model_id,
                )
                duration = round(time.time() - start, 2)

                db.execute(text("""
                    UPDATE ml_models
                    SET status = 'ready',
                        model_type = :mtype,
                        metrics = :metrics,
                        file_path = :fpath,
                        training_duration = :dur,
                        is_public = true,
                        updated_at = :ts
                    WHERE id = :id
                """), {
                    "id": str(model_id),
                    "mtype": result["model_type"],
                    "metrics": json.dumps(result["metrics"]),
                    "fpath": result["file_path"],
                    "dur": result["training_duration"],
                    "ts": now,
                })
                db.commit()

                created_file_paths.append(result["file_path"])
                algo = result["metrics"].get("algorithm", "?")
                mtype = result["model_type"]

                if mtype == "regression":
                    r2 = result["metrics"].get("r2_score", 0)
                    print(f"   ✅ {mtype} ({algo}) — R²={r2} ({duration}s)")
                else:
                    acc = result["metrics"].get("accuracy", 0)
                    print(f"   ✅ {mtype} ({algo}) — Accuracy={acc} ({duration}s)")

            except Exception as e:
                db.execute(text("""
                    UPDATE ml_models SET status = 'failed', error_message = :err, updated_at = :ts
                    WHERE id = :id
                """), {"id": str(model_id), "err": str(e), "ts": now})
                db.commit()
                print(f"   ❌ เทรนล้มเหลว: {e}")

            created_model_ids.append(str(model_id))

        # ── บันทึก marker สำหรับ cleanup ──
        db.execute(text("""
            INSERT INTO site_settings (id, key, value, created_at, updated_at)
            VALUES (:id, :key, :val, NOW(), NOW())
            ON CONFLICT DO NOTHING
        """), {
            "id": str(uuid.uuid4()),
            "key": DEMO_MODELS_MARKER,
            "val": json.dumps({
                "dataset_ids": created_dataset_ids,
                "model_ids": created_model_ids,
                "file_paths": created_file_paths,
                "created_at": now.isoformat(),
            }),
        })
        db.commit()

    print("\n" + "=" * 60)
    print("✅ seed_demo_models.py เสร็จสมบูรณ์!")
    print(f"   - {len(created_dataset_ids)} datasets")
    print(f"   - {len(created_model_ids)} ML models (public)")
    print(f"\n🧹 ลบด้วย: docker compose exec backend python cleanup_demo_models.py")


if __name__ == "__main__":
    main()
