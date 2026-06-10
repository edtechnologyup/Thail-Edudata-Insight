# Cursor Prompt — Migration กลุ่ม 1 (Database)

> Copy ทั้งหมดนี้ไปวางใน Cursor
> แนบ claude-v3.md เป็น context ด้วยทุกครั้ง

---

## 📌 Context ของระบบ (ส่วนนี้บอก Cursor ว่าระบบเป็นยังไง)

```
ระบบชื่อ Thai EduData Insight
Backend: FastAPI + Python, อยู่ที่ D:\thail-datacatalog\backend
Database: PostgreSQL 15, ใช้ SQLAlchemy + Alembic
Spec อ้างอิง: claude-v3.md (แนบมาแล้ว)

Migration ที่รันไปแล้ว (อย่าแตะ):
- 2026_05_19_1320_create_initial_schema.py
- 2026_05_25_1200_add_reject_reason_to_users.py
- 2026_05_25_1400_add_page_contents_table.py  ← ล่าสุด revision = c8d9e0f1a2b3

DB ปัจจุบัน users table มี column:
id, email, password_hash, role, status, agency_name,
is_deleted, created_at, updated_at, reject_reason

DB ปัจจุบัน user_status ENUM มี:
pending, active, rejected, suspended

DB ปัจจุบัน dataset_status ENUM มี:
draft, published  ← ตรงแล้ว ไม่ต้องแก้

DB ปัจจุบัน pdpa_consents มี column:
id, user_id, version, consented_at, ip_address
```

---

## 🚫 กฎเหล็ก (ห้ามละเมิดเด็ดขาด)

```
1. ห้ามแก้ไข migration ไฟล์เก่าทั้ง 3 ไฟล์ที่มีอยู่แล้ว
2. ห้ามเพิ่ม column / table / index ที่ไม่อยู่ใน claude-v3.md
3. ห้ามเปลี่ยนชื่อ column ที่มีอยู่แล้ว (reject_reason ถูกแล้ว)
4. ทุก column ใหม่ต้องเป็น nullable หรือมี server_default
   เพราะมี row อยู่แล้วใน DB
5. ทุก migration ต้องมีทั้ง upgrade() และ downgrade()
6. ห้าม hardcode ค่าใดๆ ที่ควรมาจาก .env
7. ห้ามแตะ dataset_status ENUM (ตรงแล้ว ไม่ต้องแก้)
8. ทำทีละ migration ไฟล์ รอ confirm ก่อนทำอันถัดไป
9. ห้ามเพิ่ม logic อื่นนอกจาก DDL (ไม่มี seed data นอกจากที่ระบุ)
10. down_revision ของไฟล์แรกต้องเป็น "c8d9e0f1a2b3" เสมอ
```

---

## 📋 งานที่ต้องทำ — 11 Migration ตามลำดับ

อ่าน claude-v3.md #12 #14 #17 #18 ก่อนเริ่มทุกครั้ง

---

### Migration 1: add_agency_info_fields_to_users

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0001_add_agency_info_fields_to_users.py`

```
revision  = "d1e2f3a4b5c6"
down_revision = "c8d9e0f1a2b3"
```

เพิ่ม column ต่อไปนี้ใน users table (ทุกอันเป็น nullable):
- agency_name_en     VARCHAR(255)  NULL
- agency_code        VARCHAR(100)  NULL
- agency_website     VARCHAR(500)  NULL
- contact_name       VARCHAR(255)  NULL
- contact_position   VARCHAR(255)  NULL
- contact_phone      VARCHAR(50)   NULL
- verification_doc_path VARCHAR(500) NULL
- suspend_reason     TEXT          NULL
- agency_type        VARCHAR(50)   NULL  ← VARCHAR ก่อน จะเปลี่ยนเป็น ENUM ใน Migration 5

downgrade: ลบ column ทั้งหมดที่เพิ่ม

---

### Migration 2: add_email_verification_fields_to_users

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0002_add_email_verification_fields_to_users.py`

```
revision  = "e2f3a4b5c6d7"
down_revision = "d1e2f3a4b5c6"
```

เพิ่ม column ใน users table (ทุกอันเป็น nullable):
- email_verified_at   TIMESTAMPTZ  NULL
- verify_token        VARCHAR(255)  NULL
- verify_expires_at   TIMESTAMPTZ  NULL

เพิ่ม UNIQUE constraint บน verify_token:
- uq_users_verify_token

⚠️ ยังไม่แก้ default ของ status ในไฟล์นี้
   (ต้องรอ Migration 6 เพิ่ม email_unverified เข้า ENUM ก่อน)

downgrade: ลบ column + ลบ constraint

---

### Migration 3: add_password_reset_fields_to_users

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0003_add_password_reset_fields_to_users.py`

```
revision  = "f3a4b5c6d7e8"
down_revision = "e2f3a4b5c6d7"
```

เพิ่ม column ใน users table (ทุกอันเป็น nullable):
- reset_token        VARCHAR(255)  NULL
- reset_expires_at   TIMESTAMPTZ   NULL

เพิ่ม UNIQUE constraint:
- uq_users_reset_token

downgrade: ลบ column + ลบ constraint

---

### Migration 4: add_account_lockout_fields_to_users

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0004_add_account_lockout_fields_to_users.py`

```
revision  = "a4b5c6d7e8f9"
down_revision = "f3a4b5c6d7e8"
```

เพิ่ม column ใน users table:
- failed_login_count  INTEGER  NOT NULL  DEFAULT 0
- locked_until        TIMESTAMPTZ  NULL

downgrade: ลบ column ทั้งสอง

---

### Migration 5: create_agency_type_enum

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0005_create_agency_type_enum.py`

```
revision  = "b5c6d7e8f9a0"
down_revision = "a4b5c6d7e8f9"
```

1. สร้าง ENUM type ชื่อ agency_type:
   values: central, regional, local, educational, other

2. ALTER TABLE users
   ALTER COLUMN agency_type
   TYPE agency_type USING agency_type::agency_type

   ⚠️ ก่อน ALTER ต้องทำ:
   UPDATE users SET agency_type = NULL WHERE agency_type IS NOT NULL
   AND agency_type NOT IN ('central','regional','local','educational','other')

downgrade:
   ALTER COLUMN agency_type TYPE VARCHAR(50) USING agency_type::text
   DROP TYPE agency_type

---

### Migration 6: add_email_unverified_to_user_status_enum

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0006_add_email_unverified_to_user_status_enum.py`

```
revision  = "c6d7e8f9a0b1"
down_revision = "b5c6d7e8f9a0"
```

1. เพิ่มค่า email_unverified เข้า user_status ENUM:
   ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'email_unverified'

2. แก้ default ของ users.status:
   ALTER TABLE users ALTER COLUMN status SET DEFAULT 'email_unverified'

⚠️ ALTER TYPE ADD VALUE ไม่สามารถทำใน transaction ได้
   ต้องใช้ op.execute() และตั้ง transaction=False ใน Alembic

downgrade:
   แก้ default กลับเป็น 'pending'
   ⚠️ ไม่สามารถลบค่าออกจาก ENUM ใน PostgreSQL ได้
   downgrade ทำได้แค่แก้ default กลับ

---

### Migration 7: create_email_status_enum

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0007_create_email_status_enum.py`

```
revision  = "d7e8f9a0b1c2"
down_revision = "c6d7e8f9a0b1"
```

สร้าง ENUM type ชื่อ email_status:
values: pending, sent, delivered, bounced, failed, complained

downgrade: DROP TYPE email_status

---

### Migration 8: create_consent_type_enum_and_update_pdpa

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0008_create_consent_type_enum_and_update_pdpa.py`

```
revision  = "e8f9a0b1c2d3"
down_revision = "d7e8f9a0b1c2"
```

1. สร้าง ENUM type ชื่อ consent_type:
   values: terms, pdpa

2. เพิ่ม column ใน pdpa_consents:
   - consent_type  consent_type  NULL  (nullable เพราะ row เก่าไม่มีค่า)

3. เพิ่ม UNIQUE constraint:
   uq_pdpa_consents_user_consent (user_id, consent_type)

downgrade:
   DROP constraint
   DROP column consent_type
   DROP TYPE consent_type

---

### Migration 9: create_email_logs_table

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0009_create_email_logs_table.py`

```
revision  = "f9a0b1c2d3e4"
down_revision = "e8f9a0b1c2d3"
```

สร้างตาราง email_logs ตาม claude-v3.md #12:
- id                  UUID         PK  gen_random_uuid()
- user_id             UUID         NULL  FK → users(id)
- template_name       VARCHAR(100) NOT NULL
- recipient_email     VARCHAR(255) NOT NULL
- subject             VARCHAR(500) NOT NULL
- status              email_status NOT NULL  DEFAULT 'pending'
- error_message       TEXT         NULL
- retry_count         INTEGER      NOT NULL  DEFAULT 0
- provider_message_id VARCHAR(255) NULL
- sent_at             TIMESTAMPTZ  NULL
- delivered_at        TIMESTAMPTZ  NULL
- created_at          TIMESTAMPTZ  NOT NULL  DEFAULT now()

FK: user_id → users(id) ON DELETE SET NULL

สร้าง Index:
- idx_email_logs_user_id
- idx_email_logs_recipient_email
- idx_email_logs_status
- idx_email_logs_created_at

downgrade: DROP TABLE email_logs (cascade)

---

### Migration 10: add_user_agent_to_audit_logs

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0010_add_user_agent_to_audit_logs.py`

```
revision  = "a0b1c2d3e4f5"
down_revision = "f9a0b1c2d3e4"
```

เพิ่ม column ใน audit_logs:
- user_agent  VARCHAR(500)  NULL

downgrade: DROP COLUMN user_agent

---

### Migration 11: create_new_indexes

สร้างไฟล์:
`backend/migrations/versions/2026_06_09_0011_create_new_indexes.py`

```
revision  = "b1c2d3e4f5a6"
down_revision = "a0b1c2d3e4f5"
```

สร้าง Index ต่อไปนี้ตาม claude-v3.md #17
(ข้ามถ้ามีอยู่แล้ว ใช้ if_not_exists=True):

users:
- idx_users_status          (status)
- idx_users_agency_type     (agency_type)
- idx_users_verify_token    (verify_token)   UNIQUE
- idx_users_reset_token     (reset_token)    UNIQUE
- idx_users_locked_until    (locked_until)

pdpa_consents:
- idx_pdpa_consents_consent_type  (consent_type)

audit_logs:
- idx_audit_logs_action     (action)

⚠️ idx_users_email, idx_users_role, idx_users_is_deleted
   มีอยู่แล้วใน DB → ข้ามทั้งหมด ห้ามสร้างซ้ำ

downgrade: DROP INDEX ทุกอันที่สร้างใหม่

---

## 🔁 ขั้นตอนที่ Cursor ต้องทำ

```
1. อ่าน claude-v3.md #12 #14 #17 #18 ให้ครบก่อน
2. สร้าง Migration 1 เท่านั้น
3. หยุด — แสดง code ให้ดูก่อน อย่ารัน
4. รอ confirm จากผู้ใช้ก่อนทำ Migration 2
5. ทำทีละ migration ตามลำดับ 1-11
6. หลังสร้างครบ 11 ไฟล์ ให้แสดง migration chain summary
```

---

## ✅ Migration Chain ที่ถูกต้อง

```
c8d9e0f1a2b3  (ล่าสุดที่รัน)
      ↓
d1e2f3a4b5c6  Migration 1: agency info
      ↓
e2f3a4b5c6d7  Migration 2: email verification
      ↓
f3a4b5c6d7e8  Migration 3: password reset
      ↓
a4b5c6d7e8f9  Migration 4: account lockout
      ↓
b5c6d7e8f9a0  Migration 5: agency_type ENUM
      ↓
c6d7e8f9a0b1  Migration 6: email_unverified ENUM value
      ↓
d7e8f9a0b1c2  Migration 7: email_status ENUM
      ↓
e8f9a0b1c2d3  Migration 8: consent_type ENUM + pdpa column
      ↓
f9a0b1c2d3e4  Migration 9: email_logs table
      ↓
a0b1c2d3e4f5  Migration 10: user_agent column
      ↓
b1c2d3e4f5a6  Migration 11: indexes
```

---

## 🧪 วิธีทดสอบหลังสร้างครบ

รันคำสั่งนี้เพื่อตรวจว่า migration chain ถูกต้อง:
```bash
docker exec thail-datacatalog-backend-1 alembic check
```

รัน migration:
```bash
docker exec thail-datacatalog-backend-1 alembic upgrade head
```

ตรวจผล:
```bash
docker exec thail-datacatalog-postgres-1 psql -U postgres -d datacatalog -c "\d users"
docker exec thail-datacatalog-postgres-1 psql -U postgres -d datacatalog -c "SELECT enum_range(NULL::user_status);"
docker exec thail-datacatalog-postgres-1 psql -U postgres -d datacatalog -c "SELECT enum_range(NULL::agency_type);"
docker exec thail-datacatalog-postgres-1 psql -U postgres -d datacatalog -c "\d email_logs"
```
