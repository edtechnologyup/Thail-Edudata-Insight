"""
seed_demo.py — สร้างข้อมูล demo สำหรับนำเสนอกรรมการ

รันผ่าน Docker:
  docker compose exec backend python seed_demo.py

สร้าง:
  - 10 agency (demo, เข้าระบบไม่ได้)
  - 20 fake users (สำหรับยอดโหวต)
  - 3-4 pending users (รออนุมัติ)
  - 10 หมวดหมู่หลัก + หมวดย่อย 2-3 ระดับ
  - 100 datasets (97 published + 3 draft) คละ 11 หน่วยงาน
  - ไฟล์ CSV/Excel/JSON ใน MinIO (30+ แถว)
  - 20 ทุนการศึกษา
  - download_logs กระจาย 2566-2568
  - dataset_ratings 1-5 ดาว

ลบด้วย: docker compose exec backend python cleanup_demo.py
"""

import csv
import io
import json
import random
import uuid
from datetime import date, datetime, timedelta, timezone

import bcrypt
from minio import Minio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session

DATABASE_URL = "postgresql://postgres:postgres@postgres:5432/datacatalog"
MINIO_ENDPOINT = "minio:9000"
MINIO_ACCESS_KEY = "minioadmin"
MINIO_SECRET_KEY = "minioadmin"
MINIO_BUCKET = "datacatalog"

DEMO_MARKER = "demo_seed_2026"

PROVINCES = [
    "กรุงเทพฯ", "เชียงใหม่", "ขอนแก่น", "นครราชสีมา", "สงขลา",
    "พะเยา", "ชลบุรี", "เชียงราย", "ลำปาง", "อุดรธานี",
    "นครสวรรค์", "สุราษฎร์ธานี", "ภูเก็ต", "ตรัง", "พิษณุโลก",
    "เพชรบุรี", "อุบลราชธานี", "ร้อยเอ็ด", "นครพนม", "สุรินทร์",
]

DEMO_AGENCIES = [
    ("สำนักงานปลัดกระทรวงศึกษาธิการ", "Office of the Permanent Secretary", "central"),
    ("สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน", "Office of the Basic Education Commission", "central"),
    ("สำนักงานคณะกรรมการการอาชีวศึกษา", "Office of the Vocational Education Commission", "central"),
    ("สำนักงานคณะกรรมการการอุดมศึกษา", "Office of the Higher Education Commission", "central"),
    ("สำนักงานเลขาธิการสภาการศึกษา", "Office of the Education Council", "central"),
    ("สถาบันทดสอบทางการศึกษาแห่งชาติ", "National Institute of Educational Testing Service", "educational"),
    ("สำนักงานรับรองมาตรฐานและประเมินคุณภาพการศึกษา", "Office for National Education Standards", "educational"),
    ("กรมส่งเสริมการเรียนรู้", "Department of Learning Promotion", "central"),
    ("สำนักงานศึกษาธิการจังหวัดพะเยา", "Phayao Provincial Education Office", "regional"),
    ("สำนักงานศึกษาธิการภาค 16", "Regional Education Office 16", "regional"),
]

PENDING_USERS = [
    ("สำนักงานศึกษาธิการจังหวัดเชียงราย", "pending-cr@edudata.go.th"),
    ("โรงเรียนสาธิต มหาวิทยาลัยพะเยา", "pending-satit@edudata.go.th"),
    ("วิทยาลัยเทคนิคพะเยา", "pending-techpy@edudata.go.th"),
    ("สำนักงาน กศน. จังหวัดพะเยา", "pending-nfe@edudata.go.th"),
]

CATEGORIES = [
    ("สถิตินักเรียน-นักศึกษา", "Student Statistics", [
        ("จำนวนนักเรียนรายจังหวัด", "Students by Province"),
        ("นักเรียนแยกตามระดับชั้น", "Students by Level"),
        ("อัตราการเข้าเรียนสุทธิ", "Net Enrollment Rate"),
    ]),
    ("สถิติครูและบุคลากร", "Teacher Statistics", [
        ("จำนวนครูรายจังหวัด", "Teachers by Province"),
        ("ครูแยกตามวุฒิการศึกษา", "Teachers by Qualification"),
        ("อัตราส่วนครูต่อนักเรียน", "Teacher-Student Ratio"),
    ]),
    ("สถิติสถานศึกษา", "School Statistics", [
        ("โรงเรียนรายจังหวัด", "Schools by Province"),
        ("โรงเรียนแยกตามขนาด", "Schools by Size"),
    ]),
    ("งบประมาณการศึกษา", "Education Budget", [
        ("งบประมาณรายจังหวัด", "Budget by Province"),
        ("งบลงทุนรายปี", "Annual Investment"),
    ]),
    ("ผลสัมฤทธิ์ทางการเรียน", "Academic Achievement", [
        ("คะแนน O-NET", "O-NET Scores"),
        ("คะแนน NT", "NT Scores"),
        ("ผลสอบ GAT-PAT", "GAT-PAT Results"),
    ]),
    ("ทุนการศึกษา", "Scholarships", [
        ("ทุนรัฐบาล", "Government Scholarships"),
        ("ทุนเอกชน", "Private Scholarships"),
    ]),
    ("การศึกษาพิเศษ", "Special Education", [
        ("เด็กพิเศษรายจังหวัด", "Special Needs by Province"),
    ]),
    ("การอาชีวศึกษา", "Vocational Education", [
        ("นักเรียนอาชีวะรายสาขา", "Vocational Students by Field"),
        ("สถานประกอบการร่วมมือ", "Partner Enterprises"),
    ]),
    ("การศึกษานอกระบบ", "Non-Formal Education", [
        ("ผู้เรียน กศน.", "NFE Learners"),
    ]),
    ("วิจัยและนวัตกรรม", "Research & Innovation", [
        ("งานวิจัยการศึกษา", "Education Research"),
        ("นวัตกรรมการเรียนรู้", "Learning Innovation"),
    ]),
]

TAGS = [
    "การศึกษาขั้นพื้นฐาน", "อุดมศึกษา", "อาชีวศึกษา", "การศึกษาพิเศษ",
    "O-NET", "NT", "GAT-PAT", "PISA", "งบประมาณ", "ทุนการศึกษา",
    "ครู", "นักเรียน", "นักศึกษา", "โรงเรียน", "มหาวิทยาลัย",
    "สถิติ", "รายงานประจำปี", "เชิงพื้นที่", "ภาคเหนือ", "ภาคอีสาน",
    "ภาคกลาง", "ภาคใต้", "พะเยา", "เชียงใหม่", "กรุงเทพฯ",
    "คุณภาพการศึกษา", "หลักสูตร", "ICT การศึกษา", "Open Data", "2567",
]

DATASET_TEMPLATES = [
    ("จำนวนนักเรียนระดับ{level}รายจังหวัด ปี {by}", "ข้อมูลจำนวนนักเรียนระดับ{level}แยกรายจังหวัด ประจำปีการศึกษา {by}"),
    ("สถิติครูและบุคลากรทางการศึกษา {prov} ปี {by}", "ข้อมูลครูและบุคลากรในจังหวัด{prov} ปีการศึกษา {by}"),
    ("อัตราส่วนครูต่อนักเรียน ปี {by}", "อัตราส่วนครูต่อนักเรียนรายจังหวัด ปีการศึกษา {by}"),
    ("งบประมาณการศึกษารายจังหวัด ปี {by}", "งบประมาณด้านการศึกษาแยกรายจังหวัด ประจำปีงบประมาณ {by}"),
    ("คะแนน O-NET ชั้น{onet_level} ปี {by}", "ผลคะแนนสอบ O-NET ระดับชั้น{onet_level} ประจำปีการศึกษา {by}"),
    ("คะแนน NT ชั้นประถมศึกษาปีที่ 3 ปี {by}", "ผลสอบ National Test ป.3 ประจำปี {by}"),
    ("ผลสอบ GAT-PAT รายวิชา ปี {by}", "ผลคะแนนสอบ GAT-PAT แยกรายวิชา ปี {by}"),
    ("โรงเรียนแยกตามขนาดรายจังหวัด ปี {by}", "จำนวนโรงเรียนแยกตามขนาด (เล็ก กลาง ใหญ่) รายจังหวัด ปี {by}"),
    ("นักเรียนอาชีวศึกษาแยกตามสาขา ปี {by}", "จำนวนนักเรียนอาชีวศึกษาแยกตามสาขาวิชา ปี {by}"),
    ("ผู้เรียน กศน. รายจังหวัด ปี {by}", "จำนวนผู้เรียนการศึกษานอกระบบรายจังหวัด ปี {by}"),
    ("ทุนการศึกษาที่เปิดรับ ปี {by}", "รวบรวมข้อมูลทุนการศึกษาที่เปิดรับสมัคร ปี {by}"),
    ("เด็กพิเศษที่ได้รับบริการทางการศึกษา ปี {by}", "สถิติเด็กพิเศษที่ได้รับบริการรายจังหวัด ปี {by}"),
    ("รายงานคุณภาพการศึกษา {prov} ปี {by}", "รายงานผลประเมินคุณภาพการศึกษาจังหวัด{prov} ปี {by}"),
    ("งานวิจัยด้านการศึกษา ปี {by}", "รายการงานวิจัยทางการศึกษาที่ตีพิมพ์ ปี {by}"),
    ("สถิติการใช้ ICT ในสถานศึกษา ปี {by}", "ข้อมูลการใช้เทคโนโลยีในสถานศึกษา ปี {by}"),
    ("อัตราการเข้าเรียนสุทธิระดับ{level} ปี {by}", "อัตราการเข้าเรียนสุทธิ (NER) ระดับ{level}รายจังหวัด ปี {by}"),
    ("รายงานประจำปีการศึกษา {by}", "รายงานสรุปสถานการณ์การศึกษา ประจำปี {by}"),
    ("นักศึกษาระดับอุดมศึกษาแยกสาขา ปี {by}", "จำนวนนักศึกษาระดับอุดมศึกษาแยกตามสาขาวิชา ปี {by}"),
    ("สถานประกอบการร่วมมืออาชีวศึกษา {prov} ปี {by}", "รายชื่อสถานประกอบการร่วมจัดอาชีวศึกษาทวิภาคี จ.{prov} ปี {by}"),
    ("ข้อมูลนวัตกรรมการเรียนรู้ ปี {by}", "รวบรวมนวัตกรรมการเรียนรู้ที่ได้รับรางวัล ปี {by}"),
]

LEVELS = ["ประถมศึกษา", "มัธยมศึกษาตอนต้น", "มัธยมศึกษาตอนปลาย"]
ONET_LEVELS = ["ม.3", "ม.6", "ป.6"]
BUDDHIST_YEARS = [2564, 2565, 2566, 2567, 2568]
FILE_FORMATS = ["csv", "csv", "csv", "csv", "excel", "excel", "json", "json"]
LICENSES = ["open", "open", "open", "conditional", "cc"]

SCHOLARSHIP_TYPES = ["government", "university", "private", "foundation", "exchange"]
EDUCATION_LEVELS = ["high_school", "bachelor", "master", "doctoral", "any"]

SCHOLARSHIPS = [
    ("ทุน กยศ. ประจำปีการศึกษา 2568", "government", "any", 60000, "นักเรียน นักศึกษาที่ขาดแคลนทุนทรัพย์"),
    ("ทุนพัฒนาท้องถิ่น ปี 2568", "government", "bachelor", 80000, "นักศึกษาภูมิลำเนาในพื้นที่ห่างไกล"),
    ("ทุนเรียนดีวิทยาศาสตร์แห่งประเทศไทย", "government", "bachelor", 120000, "ผลการเรียนวิทยาศาสตร์ดีเยี่ยม GPA ≥ 3.50"),
    ("ทุนมหาวิทยาลัยพะเยา สำหรับนักเรียน ม.6", "university", "bachelor", 40000, "นักเรียน ม.6 ในจังหวัดพะเยาและใกล้เคียง"),
    ("ทุนบัณฑิตศึกษา มหาวิทยาลัยเชียงใหม่", "university", "master", 100000, "ผู้สมัครเข้าศึกษาระดับปริญญาโท GPA ≥ 3.25"),
    ("ทุนมูลนิธิยุวพัฒน์", "foundation", "high_school", 30000, "นักเรียนมัธยมต้นที่ขาดแคลนทุนทรัพย์"),
    ("ทุนมูลนิธิทิสโก้เพื่อการกุศล", "foundation", "any", 25000, "นักเรียน นักศึกษาทุกระดับที่ขาดแคลน"),
    ("ทุนซีพี ออลล์ ปี 2568", "private", "bachelor", 50000, "นักศึกษาปริญญาตรีสาขาบริหารธุรกิจ/IT"),
    ("ทุนปตท. เพื่อการศึกษา", "private", "bachelor", 70000, "นักศึกษาสาขาวิศวกรรม/วิทยาศาสตร์"),
    ("ทุนเครือเจริญโภคภัณฑ์", "private", "bachelor", 60000, "นักศึกษาปริญญาตรี GPA ≥ 2.75"),
    ("ทุนแลกเปลี่ยน ASEAN ปี 2568", "exchange", "bachelor", 150000, "นักศึกษาที่ต้องการศึกษาในประเทศอาเซียน"),
    ("ทุน Erasmus Mundus สาขาการศึกษา", "exchange", "master", 500000, "ผู้สมัครปริญญาโทสาขาการศึกษา IELTS ≥ 6.5"),
    ("ทุนรัฐบาลญี่ปุ่น (MEXT) 2568", "exchange", "doctoral", 600000, "ผู้สมัครระดับปริญญาเอก อายุไม่เกิน 35 ปี"),
    ("ทุนเรียนดีมหาวิทยาลัยธรรมศาสตร์", "university", "bachelor", 45000, "นักเรียน ม.6 GPA ≥ 3.50 สอบ admission ได้"),
    ("ทุน กสศ. เสมอภาคทางการศึกษา", "government", "high_school", 35000, "เด็กยากจนพิเศษระดับมัธยมศึกษา"),
    ("ทุนวิจัย สกสว. ด้านการศึกษา", "government", "doctoral", 200000, "นักวิจัยด้านการศึกษาระดับปริญญาเอก"),
    ("ทุนมูลนิธิสมเด็จพระมหิตลาธิเบศร", "foundation", "master", 180000, "ผู้สมัครปริญญาโทด้านสาธารณสุข/การศึกษา"),
    ("ทุนพระราชทาน ม.ท.ศ.", "government", "high_school", 40000, "นักเรียนยากจนเรียนดี ระดับ ม.ปลาย"),
    ("ทุน ADB-JSP ด้านการศึกษา", "exchange", "master", 400000, "ผู้สมัครจากประเทศกำลังพัฒนา ปริญญาโท"),
    ("ทุนบริษัทไทยเบฟเพื่อเยาวชน", "private", "high_school", 20000, "นักเรียนมัธยมปลายผลการเรียนดี"),
]

PURPOSES = ["วิจัย", "การศึกษา", "วิเคราะห์ข้อมูล", "รายงาน", "ประกอบการตัดสินใจ", "วิทยานิพนธ์"]

# ---------------------------------------------------------------------------


def generate_csv_bytes(num_rows: int, title: str) -> bytes:
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["ลำดับ", "จังหวัด", "จำนวน", "ปี_พศ", "หมายเหตุ"])
    for i in range(1, num_rows + 1):
        w.writerow([
            i,
            random.choice(PROVINCES),
            random.randint(50, 80000),
            random.choice(BUDDHIST_YEARS),
            title[:30],
        ])
    return buf.getvalue().encode("utf-8")


def generate_json_bytes(num_rows: int, title: str) -> bytes:
    rows = []
    for i in range(1, num_rows + 1):
        rows.append({
            "id": i,
            "province": random.choice(PROVINCES),
            "value": random.randint(50, 80000),
            "year": random.choice(BUDDHIST_YEARS),
            "note": title[:30],
        })
    return json.dumps(rows, ensure_ascii=False, indent=2).encode("utf-8")


def generate_excel_bytes(num_rows: int, title: str) -> bytes:
    try:
        import openpyxl
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Data"
        ws.append(["ลำดับ", "จังหวัด", "จำนวน", "ปี_พศ", "หมายเหตุ"])
        for i in range(1, num_rows + 1):
            ws.append([
                i,
                random.choice(PROVINCES),
                random.randint(50, 80000),
                random.choice(BUDDHIST_YEARS),
                title[:30],
            ])
        buf = io.BytesIO()
        wb.save(buf)
        return buf.getvalue()
    except ImportError:
        return generate_csv_bytes(num_rows, title)


def make_file_bytes(fmt: str, num_rows: int, title: str):
    if fmt == "json":
        return generate_json_bytes(num_rows, title), "application/json"
    elif fmt == "excel":
        return generate_excel_bytes(num_rows, title), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        return generate_csv_bytes(num_rows, title), "text/csv"


def ext_for_format(fmt: str) -> str:
    return {"csv": ".csv", "excel": ".xlsx", "json": ".json"}.get(fmt, ".csv")


def random_ip() -> str:
    return f"{random.choice(['10','172','192'])}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"


def rand_date_between(start: datetime, end: datetime) -> datetime:
    delta = (end - start).total_seconds()
    return start + timedelta(seconds=random.randint(0, int(delta)))


def fill_template(tmpl_title: str, tmpl_desc: str) -> tuple[str, str]:
    by = random.choice(BUDDHIST_YEARS)
    prov = random.choice(PROVINCES)
    level = random.choice(LEVELS)
    onet_level = random.choice(ONET_LEVELS)
    title = tmpl_title.format(by=by, prov=prov, level=level, onet_level=onet_level)
    desc = tmpl_desc.format(by=by, prov=prov, level=level, onet_level=onet_level)
    return title, desc


# ===========================================================================


def main():
    engine = create_engine(DATABASE_URL)
    mc = Minio(MINIO_ENDPOINT, access_key=MINIO_ACCESS_KEY, secret_key=MINIO_SECRET_KEY, secure=False)
    if not mc.bucket_exists(MINIO_BUCKET):
        mc.make_bucket(MINIO_BUCKET)

    pw_hash = bcrypt.hashpw(b"DemoNoLogin!", bcrypt.gensalt()).decode()
    now = datetime.now(timezone.utc)

    with Session(engine) as db:

        # ── ดึง สำนักงานทดสอบ (agency เดิม) ──
        row = db.execute(text(
            "SELECT id FROM users WHERE agency_name = 'สำนักงานทดสอบ' AND is_deleted = false LIMIT 1"
        )).first()
        if not row:
            print("❌ ไม่พบ agency 'สำนักงานทดสอบ' — ต้องมีอยู่ในระบบก่อน")
            return
        existing_agency_id = str(row[0])
        print(f"  ✓ พบสำนักงานทดสอบ: {existing_agency_id}")

        # ── ดึง admin ──
        admin_row = db.execute(text(
            "SELECT id FROM users WHERE role = 'admin' AND is_deleted = false LIMIT 1"
        )).first()
        if not admin_row:
            print("❌ ไม่พบ admin — ต้องมีอยู่ในระบบก่อน")
            return
        admin_id = str(admin_row[0])

        # ── 1. สร้าง 10 demo agencies ──
        print("\n📌 สร้าง demo agencies...")
        demo_agency_ids = []
        for name_th, name_en, atype in DEMO_AGENCIES:
            uid = uuid.uuid4()
            email = f"demo-{uid.hex[:8]}@edudata.go.th"
            db.execute(text("""
                INSERT INTO users (id, email, password_hash, role, status,
                    agency_name, agency_name_en, agency_type,
                    is_deleted, email_verified_at, created_at, updated_at)
                VALUES (:id, :email, :pw, 'agency', 'active',
                    :name_th, :name_en, :atype,
                    false, NOW(), :ts, :ts)
            """), {
                "id": str(uid), "email": email, "pw": pw_hash,
                "name_th": name_th, "name_en": name_en, "atype": atype,
                "ts": now - timedelta(days=random.randint(60, 365)),
            })
            demo_agency_ids.append(str(uid))
            print(f"    {name_th}")
        db.commit()

        all_agency_ids = [existing_agency_id] + demo_agency_ids

        # ── 2. สร้าง 25 fake visitor users ──
        print("\n📌 สร้าง fake visitors...")
        fake_names = [
            "สมชาย", "สมหญิง", "วิชัย", "ประภา", "นิพนธ์",
            "สุรีย์", "กิตติ", "อรพรรณ", "ธนา", "จิราพร",
            "วรพล", "ศิริวรรณ", "พงศ์พัฒน์", "กัลยา", "ณัฐพล",
            "รัตนา", "เจษฎา", "ดวงกมล", "ปิยะ", "สุภาพร",
            "อภิชาติ", "พรทิพย์", "ชัยวัฒน์", "บุษบา", "ธีรเดช",
        ]
        fake_user_ids = []
        for i, name in enumerate(fake_names):
            uid = uuid.uuid4()
            email = f"user-{uid.hex[:8]}@example.com"
            db.execute(text("""
                INSERT INTO users (id, email, password_hash, role, status,
                    agency_name, is_deleted, email_verified_at, created_at, updated_at)
                VALUES (:id, :email, :pw, 'visitor', 'active',
                    :name, false, NOW(), :ts, :ts)
            """), {
                "id": str(uid), "email": email, "pw": pw_hash,
                "name": name, "ts": now - timedelta(days=random.randint(30, 300)),
            })
            fake_user_ids.append(str(uid))
        db.commit()
        print(f"    สร้าง {len(fake_user_ids)} visitors")

        # ── 3. สร้าง pending users (รออนุมัติ) ──
        print("\n📌 สร้าง pending users...")
        for agency_name, email in PENDING_USERS:
            uid = uuid.uuid4()
            db.execute(text("""
                INSERT INTO users (id, email, password_hash, role, status,
                    agency_name, agency_type, is_deleted,
                    email_verified_at, created_at, updated_at)
                VALUES (:id, :email, :pw, 'agency', 'pending',
                    :name, 'educational', false,
                    NOW(), :ts, :ts)
            """), {
                "id": str(uid), "email": email, "pw": pw_hash,
                "name": agency_name,
                "ts": now - timedelta(days=random.randint(1, 14)),
            })
            print(f"    {agency_name} ({email})")
        db.commit()

        # ── 4. สร้าง Categories (10 หลัก + หมวดย่อย) ──
        print("\n📌 สร้าง categories...")
        cat_ids = []
        for cat_th, cat_en, subs in CATEGORIES:
            cat_id = uuid.uuid4()
            slug = cat_en.lower().replace(" ", "-").replace("&", "and")
            db.execute(text("""
                INSERT INTO categories (id, parent_id, created_by, level, name_th, name_en, slug,
                    is_deleted, created_at, updated_at)
                VALUES (:id, NULL, :admin, 1, :th, :en, :slug, false, NOW(), NOW())
                ON CONFLICT (slug) DO UPDATE SET name_th = EXCLUDED.name_th
                RETURNING id
            """), {"id": str(cat_id), "admin": admin_id, "th": cat_th, "en": cat_en, "slug": slug})
            real_row = db.execute(text("SELECT id FROM categories WHERE slug = :s"), {"s": slug}).first()
            real_cat_id = str(real_row[0])
            cat_ids.append(real_cat_id)

            for sub_th, sub_en in subs:
                sub_id = uuid.uuid4()
                sub_slug = slug + "-" + sub_en.lower().replace(" ", "-")
                db.execute(text("""
                    INSERT INTO categories (id, parent_id, created_by, level, name_th, name_en, slug,
                        is_deleted, created_at, updated_at)
                    VALUES (:id, :pid, :admin, 2, :th, :en, :slug, false, NOW(), NOW())
                    ON CONFLICT (slug) DO NOTHING
                """), {"id": str(sub_id), "pid": real_cat_id, "admin": admin_id,
                       "th": sub_th, "en": sub_en, "slug": sub_slug})
        db.commit()
        print(f"    {len(CATEGORIES)} หมวดหลัก + หมวดย่อย")

        # ── 5. สร้าง Tags ──
        print("\n📌 สร้าง tags...")
        tag_ids = []
        for tname in TAGS:
            tid = uuid.uuid4()
            db.execute(text("""
                INSERT INTO tags (id, name, is_deleted, created_at, updated_at)
                VALUES (:id, :name, false, NOW(), NOW())
                ON CONFLICT (name) DO NOTHING
            """), {"id": str(tid), "name": tname})
            real_row = db.execute(text("SELECT id FROM tags WHERE name = :n"), {"n": tname}).first()
            tag_ids.append(str(real_row[0]))
        db.commit()
        print(f"    {len(tag_ids)} tags")

        # ── 6. สร้าง 100 Datasets ──
        print("\n📌 สร้าง 100 datasets...")
        dataset_ids = []
        dataset_count = 0

        distribution = []
        for aid in all_agency_ids:
            count = random.randint(7, 12)
            distribution.extend([aid] * count)
        random.shuffle(distribution)
        distribution = distribution[:100]
        while len(distribution) < 100:
            distribution.append(random.choice(all_agency_ids))

        for idx in range(100):
            tmpl_title, tmpl_desc = random.choice(DATASET_TEMPLATES)
            title, desc = fill_template(tmpl_title, tmpl_desc)
            # ป้องกันชื่อซ้ำ
            title = f"{title} #{idx+1:03d}"

            ds_id = uuid.uuid4()
            file_id = uuid.uuid4()
            owner_id = distribution[idx]
            cat_id = random.choice(cat_ids)
            fmt = random.choice(FILE_FORMATS)
            num_rows = random.randint(30, 120)
            by = random.choice(BUDDHIST_YEARS)
            ce_year = by - 543
            pub_date = datetime(ce_year, random.randint(1, 12), random.randint(1, 28), 8, 0, tzinfo=timezone.utc)

            status = "published"
            if idx >= 97:
                status = "draft"

            dl_count = random.randint(20, 500) if status == "published" else 0
            api_dl_count = random.randint(10, 200) if status == "published" else 0
            view_count = random.randint(50, 2000) if status == "published" else random.randint(0, 5)
            quality = random.randint(55, 100)

            file_bytes, content_type = make_file_bytes(fmt, num_rows, title)
            ext = ext_for_format(fmt)
            file_path = f"datasets/{ds_id}/{file_id}{ext}"
            mc.put_object(MINIO_BUCKET, file_path, io.BytesIO(file_bytes), len(file_bytes), content_type=content_type)

            db.execute(text("""
                INSERT INTO datasets (id, user_id, category_id, title, description, status, license,
                    metadata, quality_score, download_count, api_download_count, view_count,
                    published_at, is_deleted, created_at, updated_at)
                VALUES (:id, :uid, :cid, :title, :desc, :status, :lic,
                    :meta, :qs, :dl, :api_dl, :vc,
                    :pub, false, :ts, :ts)
            """), {
                "id": str(ds_id), "uid": owner_id, "cid": cat_id,
                "title": title, "desc": desc, "status": status,
                "lic": random.choice(LICENSES),
                "meta": json.dumps({"year_start": by, "province": random.choice(PROVINCES)}),
                "qs": quality, "dl": dl_count, "api_dl": api_dl_count, "vc": view_count,
                "pub": pub_date if status == "published" else None,
                "ts": pub_date if status == "published" else now,
            })

            db.execute(text("""
                INSERT INTO dataset_files (id, dataset_id, file_name, file_path, file_size, file_format,
                    is_deleted, created_at, updated_at)
                VALUES (:id, :did, :fname, :fpath, :fsize, :fmt, false, :ts, :ts)
            """), {
                "id": str(file_id), "did": str(ds_id),
                "fname": f"{title[:60]}{ext}", "fpath": file_path,
                "fsize": len(file_bytes), "fmt": fmt, "ts": pub_date or now,
            })

            # บาง dataset ให้มี 2 ไฟล์
            if random.random() < 0.2 and status == "published":
                f2_id = uuid.uuid4()
                f2_fmt = "json" if fmt != "json" else "csv"
                f2_bytes, f2_ct = make_file_bytes(f2_fmt, num_rows, title)
                f2_ext = ext_for_format(f2_fmt)
                f2_path = f"datasets/{ds_id}/{f2_id}{f2_ext}"
                mc.put_object(MINIO_BUCKET, f2_path, io.BytesIO(f2_bytes), len(f2_bytes), content_type=f2_ct)
                db.execute(text("""
                    INSERT INTO dataset_files (id, dataset_id, file_name, file_path, file_size, file_format,
                        is_deleted, created_at, updated_at)
                    VALUES (:id, :did, :fname, :fpath, :fsize, :fmt, false, :ts, :ts)
                """), {
                    "id": str(f2_id), "did": str(ds_id),
                    "fname": f"{title[:60]}{f2_ext}", "fpath": f2_path,
                    "fsize": len(f2_bytes), "fmt": f2_fmt, "ts": pub_date,
                })

            # Tags (2-4 per dataset)
            chosen_tags = random.sample(tag_ids, min(random.randint(2, 4), len(tag_ids)))
            for tid in chosen_tags:
                db.execute(text("""
                    INSERT INTO dataset_tags (dataset_id, tag_id, created_at)
                    VALUES (:did, :tid, NOW())
                    ON CONFLICT DO NOTHING
                """), {"did": str(ds_id), "tid": tid})

            dataset_ids.append((str(ds_id), status, owner_id, pub_date, dl_count, api_dl_count))
            dataset_count += 1

        db.commit()
        print(f"    สร้าง {dataset_count} datasets (97 published + 3 draft)")

        # ── 7. Download Logs กระจาย 2566-2568 ──
        print("\n📌 สร้าง download_logs...")
        log_count = 0
        start_2566 = datetime(2023, 1, 1, tzinfo=timezone.utc)
        end_2568 = datetime(2025, 12, 31, tzinfo=timezone.utc)
        for ds_id, status, _, pub_date, dl_web, dl_api in dataset_ids:
            if status != "published":
                continue
            effective_start = pub_date if pub_date and pub_date > start_2566 else start_2566
            # web downloads
            for _ in range(min(dl_web, 80)):
                log_date = rand_date_between(effective_start, end_2568)
                db.execute(text("""
                    INSERT INTO download_logs (id, dataset_id, user_id, ip_address, purpose, file_format, source, created_at)
                    VALUES (:id, :did, :uid, :ip, :purpose, 'csv', 'web', :ts)
                """), {
                    "id": str(uuid.uuid4()), "did": ds_id,
                    "uid": random.choice(fake_user_ids) if random.random() < 0.6 else None,
                    "ip": random_ip(), "purpose": random.choice(PURPOSES), "ts": log_date,
                })
                log_count += 1
            # api downloads
            for _ in range(min(dl_api, 40)):
                log_date = rand_date_between(effective_start, end_2568)
                db.execute(text("""
                    INSERT INTO download_logs (id, dataset_id, ip_address, purpose, file_format, source, created_at)
                    VALUES (:id, :did, :ip, :purpose, 'csv', 'api', :ts)
                """), {
                    "id": str(uuid.uuid4()), "did": ds_id,
                    "ip": random_ip(), "purpose": random.choice(PURPOSES), "ts": log_date,
                })
                log_count += 1
        db.commit()
        print(f"    {log_count} download logs")

        # ── 8. Dataset Ratings ──
        print("\n📌 สร้าง dataset ratings...")
        rating_count = 0
        for ds_id, status, *_ in dataset_ids:
            if status != "published":
                continue
            n_ratings = random.randint(3, 20)
            for _ in range(n_ratings):
                score = random.choices([1, 2, 3, 4, 5], weights=[5, 10, 20, 35, 30])[0]
                r_date = rand_date_between(start_2566, end_2568)
                db.execute(text("""
                    INSERT INTO dataset_ratings (id, dataset_id, ip_address, score, rated_date, created_at)
                    VALUES (:id, :did, :ip, :score, :rd, :ts)
                """), {
                    "id": str(uuid.uuid4()), "did": ds_id,
                    "ip": random_ip(), "score": score,
                    "rd": r_date.date(), "ts": r_date,
                })
                rating_count += 1
        db.commit()
        print(f"    {rating_count} ratings")

        # ── 9. Scholarships ──
        print("\n📌 สร้าง 20 ทุนการศึกษา...")
        for title, stype, level, amount, elig in SCHOLARSHIPS:
            sid = uuid.uuid4()
            creator = random.choice(all_agency_ids)
            open_d = date(2025, random.randint(1, 6), random.randint(1, 28))
            close_d = open_d + timedelta(days=random.randint(30, 120))
            db.execute(text("""
                INSERT INTO scholarships (id, created_by, title, description, scholarship_type,
                    target_level, amount, eligibility, application_url,
                    open_date, close_date, status, source, is_deleted,
                    published_at, created_at, updated_at)
                VALUES (:id, :creator, :title, :desc, :stype,
                    :level, :amount, :elig, :url,
                    :open, :close, 'published', 'agency', false,
                    :pub, :pub, :pub)
            """), {
                "id": str(sid), "creator": creator,
                "title": title,
                "desc": f"รายละเอียดทุนการศึกษา: {title}",
                "stype": stype, "level": level, "amount": amount,
                "elig": elig,
                "url": "https://gdcatalog.go.th",
                "open": open_d, "close": close_d,
                "pub": datetime(2025, open_d.month, open_d.day, 8, 0, tzinfo=timezone.utc),
            })
        db.commit()
        print(f"    20 scholarships")

        # ── 10. บันทึก marker สำหรับ cleanup ──
        db.execute(text("""
            INSERT INTO site_settings (id, key, value, created_at, updated_at)
            VALUES (:id, :key, :val, NOW(), NOW())
            ON CONFLICT DO NOTHING
        """), {"id": str(uuid.uuid4()), "key": DEMO_MARKER, "val": json.dumps({
            "demo_agency_ids": demo_agency_ids,
            "fake_user_ids": fake_user_ids,
            "pending_emails": [e for _, e in PENDING_USERS],
            "dataset_ids": [d[0] for d in dataset_ids],
            "created_at": now.isoformat(),
        })})
        db.commit()

    print("\n" + "=" * 60)
    print("✅ seed_demo.py เสร็จสมบูรณ์!")
    print(f"   - 10 demo agencies + 1 สำนักงานทดสอบ")
    print(f"   - 25 fake visitors")
    print(f"   - {len(PENDING_USERS)} pending users (รออนุมัติ)")
    print(f"   - {len(CATEGORIES)} หมวดหมู่หลัก + หมวดย่อย")
    print(f"   - {dataset_count} datasets (97 published + 3 draft)")
    print(f"   - {log_count} download logs (web + API)")
    print(f"   - {rating_count} ratings")
    print(f"   - 20 scholarships")
    print(f"\n🧹 ลบด้วย: docker compose exec backend python cleanup_demo.py")


if __name__ == "__main__":
    main()
