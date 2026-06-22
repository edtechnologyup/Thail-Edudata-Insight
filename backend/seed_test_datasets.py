"""
Seed script: สร้าง Dataset ทดสอบ 55 ชุด (11 หมวด × 5)
พร้อม CSV จริงใน MinIO, download_logs, และ agency users ใหม่ 2 คน

รันครั้งเดียวแล้วลบไฟล์นี้ได้:
  docker compose exec backend python seed_test_datasets.py
"""

import io
import csv
import random
import uuid
from datetime import datetime, timezone, timedelta

import bcrypt
from minio import Minio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

DATABASE_URL = "postgresql://postgres:postgres@postgres:5432/datacatalog"
MINIO_ENDPOINT = "minio:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"
MINIO_BUCKET = "datacatalog"

ROW_COUNTS = [25, 30, 35, 40, 50, 60, 70, 80, 100]
YEARS = [2023, 2024, 2025]  # พ.ศ. 2566, 2567, 2568
PROVINCES = [
    "กรุงเทพฯ", "เชียงใหม่", "ขอนแก่น", "นครราชสีมา", "สงขลา",
    "พะเยา", "ชลบุรี", "เชียงราย", "ลำปาง", "อุดรธานี",
    "นครสวรรค์", "สุราษฎร์ธานี", "ภูเก็ต", "ตรัง", "พิษณุโลก",
]
DATASET_TITLES = {
    "สถิติครู": ["จำนวนครูรายจังหวัด", "ครูแยกตามวุฒิการศึกษา", "อัตราส่วนครูต่อนักเรียน", "ครูแยกตามสังกัด", "ครูแยกตามกลุ่มสาระ"],
    "สถิตินักเรียน": ["จำนวนนักเรียนรายจังหวัด", "นักเรียนแยกตามระดับชั้น", "อัตราการเข้าเรียน", "นักเรียนพิเศษรายภาค", "นักเรียนแยกตามเพศ"],
    "สถิตินักเรียนของการศึกษาไทย": ["นักเรียนระดับประถม", "นักเรียนระดับมัธยม", "นักเรียนอาชีวะ", "นักเรียนทุน", "นักเรียนต่างชาติ"],
    "งบประมาณการศึกษา": ["งบประมาณรายจังหวัด", "งบลงทุนรายปี", "งบเงินเดือนครู", "งบอุปกรณ์การเรียน", "งบพัฒนาโรงเรียน"],
    "ผลการเรียน": ["คะแนน O-NET ม.3", "คะแนน O-NET ม.6", "คะแนน NT ป.3", "ผลสอบ GAT-PAT", "คะแนนเฉลี่ยรายวิชา"],
    "ผลสัมฤทธิ์ทางการเรียน": ["ผลสัมฤทธิ์วิทย์", "ผลสัมฤทธิ์คณิต", "ผลสัมฤทธิ์ภาษาไทย", "ผลสัมฤทธิ์ภาษาอังกฤษ", "ผลสัมฤทธิ์สังคม"],
    "รายชื่อนักศึกษาของประเภทสไทยในจังหวัดพะเยา": ["นักศึกษา ม.พะเยา", "นักศึกษาอาชีวะพะเยา", "นักศึกษาทุนพะเยา", "บัณฑิตจบใหม่พะเยา", "นักศึกษาฝึกงานพะเยา"],
    "สถิติโรงเรียน": ["โรงเรียนรายจังหวัด", "โรงเรียนแยกตามขนาด", "โรงเรียนแยกตามสังกัด", "โรงเรียนขยายโอกาส", "โรงเรียนที่ปิดตัว"],
    "จำนวนครู3": ["ครูระดับประถม", "ครูระดับมัธยม", "ครูอัตราจ้าง", "ครูพิเศษ", "ครูต่างชาติ"],
    "รายการของนักศึกษา": ["นักศึกษาปริญญาตรี", "นักศึกษาปริญญาโท", "นักศึกษา กศน.", "นักศึกษาทางไกล", "นักศึกษาแลกเปลี่ยน"],
    "รายงานการศึกษา": ["รายงานประจำปี 2566", "รายงานประจำปี 2567", "รายงานคุณภาพ", "รายงานตัวชี้วัด", "รายงานผลประเมิน"],
}


def generate_csv(num_rows: int, title: str) -> bytes:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["ลำดับ", "จังหวัด", "จำนวน", "ปี_พศ", "หมายเหตุ"])
    for i in range(1, num_rows + 1):
        writer.writerow([
            i,
            random.choice(PROVINCES),
            random.randint(100, 50000),
            random.choice([2566, 2567, 2568]),
            title,
        ])
    return buf.getvalue().encode("utf-8")


def main():
    engine = create_engine(DATABASE_URL)
    minio_client = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)

    if not minio_client.bucket_exists(MINIO_BUCKET):
        minio_client.make_bucket(MINIO_BUCKET)

    pw_hash = bcrypt.hashpw(b"admintest12345", bcrypt.gensalt()).decode()

    with Session(engine) as db:
        # --- สร้าง Agency ใหม่ 2 คน ---
        new_agencies = [
            {
                "id": str(uuid.uuid4()),
                "email": "agency-gov1@edudata.go.th",
                "password_hash": pw_hash,
                "role": "agency",
                "status": "active",
                "agency_name": "หน่วยงานรัฐที่ 1",
                "agency_name_en": "Government Agency 1",
            },
            {
                "id": str(uuid.uuid4()),
                "email": "agency-gov2@edudata.go.th",
                "password_hash": pw_hash,
                "role": "agency",
                "status": "active",
                "agency_name": "หน่วยงานรัฐที่ 2",
                "agency_name_en": "Government Agency 2",
            },
        ]

        existing_user_id = "5aec9a86-9820-4587-afb6-fa64f9eaa527"
        user_ids = [existing_user_id]

        for ag in new_agencies:
            exists = db.execute(text("SELECT 1 FROM users WHERE email = :e"), {"e": ag["email"]}).first()
            if exists:
                row = db.execute(text("SELECT id FROM users WHERE email = :e"), {"e": ag["email"]}).first()
                user_ids.append(str(row[0]))
                print(f"  ✓ Agency '{ag['agency_name']}' มีอยู่แล้ว")
            else:
                db.execute(text("""
                    INSERT INTO users (id, email, password_hash, role, status, agency_name, agency_name_en,
                                       is_deleted, email_verified_at, created_at, updated_at)
                    VALUES (:id, :email, :pw, :role, :status, :name, :name_en,
                            false, NOW(), NOW(), NOW())
                """), {
                    "id": ag["id"], "email": ag["email"], "pw": ag["password_hash"],
                    "role": ag["role"], "status": ag["status"],
                    "name": ag["agency_name"], "name_en": ag["agency_name_en"],
                })
                user_ids.append(ag["id"])
                print(f"  ✓ สร้าง Agency '{ag['agency_name']}' ({ag['email']})")

        db.commit()

        # --- ดึงหมวดหมู่ระดับ 1 ---
        cats = db.execute(text(
            "SELECT id, name_th FROM categories WHERE is_deleted = false AND level = 1 ORDER BY name_th"
        )).fetchall()
        print(f"\nพบ {len(cats)} หมวดหมู่ระดับ 1")

        created_count = 0
        for cat_id, cat_name in cats:
            titles = DATASET_TITLES.get(cat_name, [f"{cat_name} ชุดที่ {i}" for i in range(1, 6)])

            for i, title in enumerate(titles):
                dataset_id = uuid.uuid4()
                file_id = uuid.uuid4()
                num_rows = random.choice(ROW_COUNTS)
                year = random.choice(YEARS)
                month = random.randint(1, 12)
                day = random.randint(1, 28)
                published_at = datetime(year, month, day, 8, 0, 0, tzinfo=timezone.utc)
                owner_id = random.choice(user_ids)

                dl_count = random.randint(50, 100)
                api_dl_count = random.randint(50, 100)
                view_count = random.randint(100, 500)
                quality_score = random.randint(60, 100)
                rating_avg = round(random.uniform(2.5, 5.0), 2)
                rating_count = random.randint(3, 30)

                # สร้าง CSV แล้วอัปโหลด MinIO
                csv_bytes = generate_csv(num_rows, title)
                file_path = f"datasets/{dataset_id}/{file_id}.csv"
                minio_client.put_object(
                    MINIO_BUCKET, file_path,
                    io.BytesIO(csv_bytes), len(csv_bytes),
                    content_type="text/csv",
                )

                # INSERT dataset
                db.execute(text("""
                    INSERT INTO datasets (id, user_id, category_id, title, description, status, license,
                                          quality_score, download_count, api_download_count, view_count,
                                          rating_avg, rating_count,
                                          published_at, is_deleted, created_at, updated_at)
                    VALUES (:id, :uid, :cid, :title, :desc, 'published', 'open',
                            :qs, :dl, :api_dl, :vc,
                            :ravg, :rcnt,
                            :pub, false, :pub, :pub)
                """), {
                    "id": str(dataset_id), "uid": owner_id, "cid": str(cat_id),
                    "title": f"{title} ปี {year + 543}",
                    "desc": f"ข้อมูล{title} ประจำปีการศึกษา {year + 543} จำนวน {num_rows} รายการ",
                    "qs": quality_score, "dl": dl_count, "api_dl": api_dl_count, "vc": view_count,
                    "ravg": rating_avg, "rcnt": rating_count,
                    "pub": published_at,
                })

                # INSERT dataset_file
                db.execute(text("""
                    INSERT INTO dataset_files (id, dataset_id, file_name, file_path, file_size, file_format,
                                                is_deleted, created_at, updated_at)
                    VALUES (:id, :did, :fname, :fpath, :fsize, 'csv', false, :ts, :ts)
                """), {
                    "id": str(file_id), "did": str(dataset_id),
                    "fname": f"{title}.csv", "fpath": file_path,
                    "fsize": len(csv_bytes), "ts": published_at,
                })

                # INSERT download_logs (web + api) คละเดือน
                for _ in range(dl_count):
                    log_date = published_at + timedelta(days=random.randint(0, 365))
                    source = "web" if random.random() < 0.55 else "api"
                    db.execute(text("""
                        INSERT INTO download_logs (id, dataset_id, ip_address, purpose, file_format, source, created_at)
                        VALUES (:id, :did, :ip, 'research', 'csv', :src, :ts)
                    """), {
                        "id": str(uuid.uuid4()), "did": str(dataset_id),
                        "ip": f"192.168.1.{random.randint(1, 254)}",
                        "src": source, "ts": log_date,
                    })

                created_count += 1

        db.commit()
        print(f"\n✅ สร้าง {created_count} datasets สำเร็จ!")
        print(f"   - Agency users: {len(user_ids)} คน")
        print(f"   - ไฟล์ CSV ใน MinIO: {created_count} ไฟล์")
        print(f"   - download_logs: หลายพันรายการ (web + api)")
        print(f"\n📊 เปิด http://127.0.0.1:3000/th/stats ดูกราฟได้เลย")


if __name__ == "__main__":
    main()
