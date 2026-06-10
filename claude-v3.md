# Datacatalog — Project Spec (v1)

> **Release Scope:** เอกสารนี้คือสเปกของ **Release 1 (v1)** เท่านั้น  
> Feature ที่อยู่ใน Release 2 (v2) เช่น Nested Category, Scholarship Module, PDF→Dataset, AI Chatbot, Education Stats Dashboard 3 กลุ่ม, API Call Count กราฟ — จะอยู่ใน `claude-v4.md` ภายหลัง

---

## #1 · Project Vision

ข้อมูลด้านการศึกษาไทยในปัจจุบันกระจัดกระจายอยู่ตามหน่วยงานต่างๆ เช่น สพฐ., สอศ., สกศ., มหาวิทยาลัย, data.go.th ไม่มีใครรวบรวมไว้ที่เดียว ทำให้ประชาชน นักวิจัย หรือหน่วยงานที่ต้องการข้อมูลต้องตามหาเองจากหลายแหล่ง เสียเวลามาก และบางครั้งก็หาไม่เจอ

**ปัญหาที่ระบบนี้แก้**
- ปัญหาที่ 1 — ข้อมูลกระจัดกระจาย ไม่มี Single Entry Point ที่รวมข้อมูลการศึกษาไว้ที่เดียว
- ปัญหาที่ 2 — ข้อมูลส่วนตัวปนอยู่ในไฟล์ เช่น รหัสนักเรียน เบอร์โทร เลขบัตรประชาชน ระบบนี้จึงมี PII Masking อัตโนมัติ
- ปัญหาที่ 3 — ไม่มีมาตรฐานการเผยแพร่ข้อมูล ระบบนี้บังคับใช้มาตรฐาน DCAT-AP และเผยแพร่ Dataset ทันทีหลังอัปโหลด
- ปัญหาที่ 4 — นักพัฒนาหรือนักวิจัยที่อยากนำข้อมูลไปใช้ต่อไม่มี API กลาง ระบบนี้สร้าง API อัตโนมัติให้ทุก Dataset
- ปัญหาที่ 5 — ไม่รู้ว่าข้อมูลนำไปใช้ได้แค่ไหน ระบบนี้มีระบบ License ชัดเจนทุก Dataset

---

## #2 · Scope / Out of Scope

**In Scope** — 41 Feature ใน 8 Module ตามที่กำหนด

**Out of Scope — สิ่งที่ระบบนี้ไม่ทำใน v1**
1. ไม่มีระบบ Payment หรือเก็บค่าบริการใดๆ
2. ไม่มี Real-time Collaboration เช่น Google Docs style
3. ไม่มีระบบ Chat หรือ Comment ระหว่าง Agency กับ Admin
4. ไม่มีการ Crawl หรือดึงข้อมูลจากเว็บภายนอกอัตโนมัติ
5. ไม่มี Mobile App (iOS/Android) มีแค่ Web
6. ไม่มีระบบ SSO หรือ Login ผ่าน Social เช่น Google, Line
7. ไม่รองรับไฟล์ประเภท PDF, Word, รูปภาพ — รับเฉพาะ CSV/Excel/JSON
8. ไม่มี Data Pipeline หรือ ETL อัตโนมัติ
9. ไม่มีระบบ AI/ML วิเคราะห์ข้อมูลให้ผู้ใช้
10. ไม่มีการ Sync ข้อมูลกับ data.go.th หรือแหล่งอื่นแบบ Real-time

---

## #3 · User Roles

- **Visitor** — ประชาชนทั่วไป ไม่ต้อง Login ไม่ต้องสมัครสมาชิก เข้ามาค้นหา ดู Preview ดาวน์โหลด และใช้ API ได้เลย
- **Agency** — หน่วยงานรัฐ ต้อง Login ด้วยบัญชีที่ผ่านการยืนยันอีเมลและ Admin อนุมัติแล้ว 1 หน่วยงาน = 1 บัญชีเท่านั้น
- **Admin** — ผู้ดูแลระบบ สิทธิ์สูงสุด ดูแลทุกอย่างในระบบ

---

## #4 · Permission Matrix

| Feature | Visitor | Agency | Admin |
|---|---|---|---|
| ค้นหา Dataset | ✅ | ✅ | ✅ |
| ดู Preview 100 แถว | ✅ | ✅ | ✅ |
| ดาวน์โหลดข้อมูล | ✅ | ✅ | ✅ |
| เรียกใช้ API | ✅ | ✅ | ✅ |
| ดูสถิติภาพรวม | ✅ | ✅ | ✅ |
| Bookmark Dataset | ❌ | ✅ | ✅ |
| ตั้ง Subscription แจ้งเตือน | ❌ | ✅ | ✅ |
| บันทึกเงื่อนไขค้นหา | ❌ | ✅ | ✅ |
| อัปโหลด Dataset | ❌ | ✅ | ✅ |
| แก้ไข Dataset ของตัวเอง | ❌ | ✅ | ✅ |
| ลบ Dataset ของตัวเอง | ❌ | ✅ | ✅ |
| ลบ Dataset ของ Agency (ทุกหน่วยงาน) | ❌ | ❌ | ✅ |
| ลบ/ซ่อน Dataset ที่ไม่เหมาะสม | ❌ | ❌ | ✅ |
| ดู Version History Dataset ตัวเอง | ❌ | ✅ | ✅ |
| Restore Version Dataset ตัวเอง | ❌ | ✅ | ✅ |
| Bulk Upload Excel Template | ❌ | ✅ | ✅ |
| ดู Data Quality Score | ❌ | ✅ | ✅ |
| จัดการ User ทั้งหมด | ❌ | ❌ | ✅ |
| Approve / Reject สมัครสมาชิก Agency | ❌ | ❌ | ✅ |
| Suspend / Unsuspend บัญชี Agency | ❌ | ❌ | ✅ |
| สร้าง/แก้ไขหมวดหมู่ของตัวเอง | ❌ | ✅ | ✅ |
| จัดการหมวดหมู่ทุกหน่วยงาน / แท็ก | ❌ | ❌ | ✅ |
| ดู Audit Log (ระบบทั้งหมด) | ❌ | ❌ | ✅ |
| ดู Login History (ของตัวเอง) | ❌ | ✅ | ✅ |
| ประกาศ / Banner | ❌ | ❌ | ✅ |
| ดู Dashboard ภาพรวมระบบ | ❌ | ❌ | ✅ |
| Custom Dashboard Drag & Drop | ✅ | ✅ | ✅ |
| เปรียบเทียบข้อมูลระหว่าง Dataset | ✅ | ✅ | ✅ |

---

## #5 · Business Rules

### M1 · Auth

#### Register Flow (สมัครสมาชิก Agency)

- Visitor สมัครเป็น Agency ผ่านหน้า `/register` โดยกรอกข้อมูลต่อไปนี้:
  - **ข้อมูลหน่วยงาน:** ชื่อ TH, ชื่อ EN, ประเภทหน่วยงาน (ส่วนกลาง / ภูมิภาค / ท้องถิ่น / สถาบันการศึกษา / อื่นๆ), เลขที่หน่วยงาน, เว็บไซต์ทางการ
  - **ข้อมูลผู้ติดต่อ:** ชื่อ-นามสกุล, ตำแหน่ง, เบอร์โทร
  - **บัญชี:** email, password
  - **เอกสารยืนยันตน:** บังคับ (อัปโหลด PDF, ขนาดไม่เกิน 5MB)
  - **Consent:** ต้องติ๊ก ☐ ยอมรับข้อกำหนดและเงื่อนไข + ☐ ยอมรับนโยบายความเป็นส่วนตัว (PDPA) ก่อนกดสมัคร
- หากไม่ติ๊ก Consent ทั้งสองช่อง → ปุ่ม "สมัครสมาชิก" Disabled

#### Status Flow

```
สมัคร → email_unverified → คลิกลิงก์ใน Email → pending → Admin Approve → active
                                                       → Admin Reject  → rejected
                                                          
active → Admin Suspend   → suspended
       → Admin Unsuspend → active
```

#### Status ENUM
- `email_unverified` — สมัครแล้วแต่ยังไม่ยืนยันอีเมล (Login ไม่ได้)
- `pending` — ยืนยันอีเมลแล้ว รอ Admin พิจารณา (Login ไม่ได้)
- `active` — ผ่านการอนุมัติ ใช้งานได้เต็ม
- `rejected` — Admin ปฏิเสธ (Login ไม่ได้)
- `suspended` — Admin ระงับชั่วคราว (Login ไม่ได้)
- เฉพาะ `active` เท่านั้นที่ Login ได้

#### Email Verification

- หลังสมัครสำเร็จ ระบบสร้าง `verify_token` (UUID) และส่ง Email พร้อมลิงก์ยืนยัน
- Token หมดอายุใน **24 ชั่วโมง**
- คลิกลิงก์ → ระบบเปลี่ยน Status จาก `email_unverified` → `pending`
- ส่ง Email แจ้ง Admin ว่ามีบัญชีรออนุมัติ
- หน้าเว็บแสดง "ยืนยันอีเมลเรียบร้อย บัญชีอยู่ระหว่างพิจารณา"
- ถ้า Token หมดอายุ → ผู้ใช้กดขอใหม่ที่ `/resend-verification`
- Rate limit: ขอ Email Verification ใหม่ ต้องรอ **60 วินาที** ระหว่างครั้ง

#### Admin Approve / Reject / Suspend / Unsuspend

- **Admin Approve** → status = `active`
  - ส่ง Email แจ้ง "บัญชีอนุมัติแล้ว" พร้อมลิงก์เริ่มต้นใช้งาน
  - บันทึก audit_log

- **Admin Reject** → status = `rejected`
  - **บังคับ** กรอก reason (เหตุผล)
  - ส่ง Email แจ้งเหตุผลที่ Admin กรอก
  - บันทึก audit_log พร้อม reason

- **Admin Suspend** → status = `suspended`
  - **บังคับ** กรอก reason
  - ส่ง Email แจ้ง "บัญชีถูกระงับชั่วคราว" พร้อมเหตุผล
  - Dataset ที่ Publish ไว้แล้วยังคงแสดงต่อ Visitor ปกติ
  - หมวดหมู่ที่ Agency สร้างยังคงแสดงปกติ
  - บันทึก audit_log

- **Admin Unsuspend** → status = `active`
  - ส่ง Email แจ้ง "บัญชีเปิดใช้งานอีกครั้ง"
  - บันทึก audit_log

#### Login / Logout

- Login ใช้ email + password
- เฉพาะ `active` เท่านั้นที่ Login สำเร็จ
- Token เก็บใน Redis (JWT + Session) หมดอายุตาม Policy
- Logout → ลบ Token จาก Redis ทันที

#### Account Lockout (ป้องกัน Brute Force)

- Login fail ติดต่อกัน **5 ครั้ง** → ล็อกบัญชี **15 นาที**
- ในช่วงล็อก: Login ไม่ได้แม้รหัสถูกต้อง
- ส่ง Email แจ้งผู้ใช้: "บัญชีของท่านถูกล็อกชั่วคราวเนื่องจากพยายาม Login ผิดหลายครั้ง"
- Reset counter หลัง Login สำเร็จ หรือหลังหมดเวลาล็อก

#### Password Reset (ลืมรหัสผ่าน)

- ผู้ใช้กด "ลืมรหัสผ่าน" ที่หน้า Login → กรอก email
- ระบบสร้าง `reset_token` (UUID) และส่ง Email พร้อมลิงก์
- Token หมดอายุใน **1 ชั่วโมง**
- คลิกลิงก์ → หน้าตั้งรหัสผ่านใหม่
- หลังตั้งรหัสใหม่สำเร็จ → ส่ง Email แจ้ง "รหัสผ่านของท่านถูกเปลี่ยนแล้ว"
- ล้าง `reset_token` หลังใช้งาน
- Rate limit: ขอ Password Reset ใหม่ ต้องรอ **60 วินาที**

#### PDPA + Terms Consent

- ต้องติ๊กยอมรับทั้ง 2 ช่องก่อนสมัคร
- บันทึก `terms_accepted_at` และ `pdpa_accepted_at` ลงตาราง `pdpa_consents`
- บันทึก IP + Timestamp ของการยอมรับ
- ตาม พ.ร.บ.คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562

#### Login History

- บันทึกทุกการ Login (สำเร็จ + ล้มเหลว) ลง `audit_logs`
- เก็บข้อมูล: timestamp, IP, User-Agent (Browser), ผลลัพธ์ (success/fail)
- Agency เห็น Login History ของตัวเองที่หน้า `/profile`
- Admin เห็นทั้งระบบที่ `/admin/audit-logs`

#### Status Page (เช็คสถานะหลังสมัคร)

- หน้า `/register-status` เข้าได้แม้ยัง Login ไม่ได้
- ผู้ใช้กรอก email → ดู Status ปัจจุบัน
- ผลลัพธ์ที่แสดง:
  - `email_unverified` → "กรุณายืนยันอีเมล [ส่งอีเมลใหม่]"
  - `pending` → "อยู่ระหว่างพิจารณา ส่งคำขอเมื่อ {created_at}"
  - `rejected` → "ไม่ผ่านการพิจารณา เหตุผล: {reject_reason}"
  - `suspended` → "บัญชีถูกระงับชั่วคราว เหตุผล: {suspend_reason}"
  - `active` → "อนุมัติแล้ว [เข้าสู่ระบบ]"

#### Edge Cases

- สมัครซ้ำด้วย email ที่ยัง `email_unverified` → แสดงปุ่ม "ส่งอีเมลยืนยันใหม่"
- สมัครซ้ำด้วย email ที่ `active` แล้ว → แสดงปุ่ม "เข้าสู่ระบบ" และ "ลืมรหัสผ่าน"
- สมัครซ้ำด้วย email ที่ `rejected` → แสดง "อีเมลนี้ไม่ผ่านการพิจารณา ติดต่อ Admin"
- Record ที่ `email_unverified` เกิน **14 วัน** → ระบบลบอัตโนมัติ (Cron Job ทุกวัน)

#### Rate Limit (Auth-specific)

- Register: 3 ครั้ง/ชั่วโมง/IP
- Login: 5 ครั้ง/นาที/IP (รวมที่ Account Lockout)
- Resend Verification: ต้องรอ 60 วินาที/บัญชี
- Forgot Password: ต้องรอ 60 วินาที/บัญชี

---

### M2 · Dataset

- Agency อัปโหลด Dataset → เลือกได้ 2 ทาง:
  - กด "บันทึก Draft" → Status = `draft` (ไม่แสดงต่อ Visitor)
  - กด "เผยแพร่" → Status = `published` ทันที บันทึก `published_at`
- Admin อัปโหลด Dataset → Status = `published` ทันที บันทึก `published_at`
- Agency แก้ไข Dataset:
  - ถ้า Dataset ปัจจุบัน = `published` → แก้แล้วยัง `published` เสมอ ลดกลับเป็น draft ไม่ได้
  - ถ้า Dataset ปัจจุบัน = `draft` → เลือกได้ว่า draft หรือ published
  - ทุกกรณี: อัปเดต `updated_at` + บันทึก Version ใหม่
- Admin แก้ไขได้ทุก Dataset → published ทันทีเสมอ อัปเดต `updated_at` + บันทึก Version ใหม่
- ไม่มีขั้นตอน Submit / Approve / Reject (ไม่มี Approval Workflow)
- แสดงเฉพาะ Dataset ที่ Status = `published` ต่อ Visitor
- Agency/Admin ดู Dataset ของตัวเองได้ทุก Status (draft/published)
- Agency ลบ Dataset ได้เฉพาะของตัวเอง (Soft Delete)
- Admin ลบ/ซ่อน Dataset ที่ไม่เหมาะสมได้ทุก Agency (Soft Delete)
- Admin ไม่มีสิทธิ์ Approve หรือ Reject Dataset
- หลัง Publish → ส่ง Email แจ้ง Subscriber ที่ติดตามหมวดหรือหน่วยงาน
- การส่ง Email Subscriber ทำเป็น **Background Task** ไม่บล็อก HTTP Response
- ถ้าส่ง Email ล้มเหลว → ระบบ Retry สูงสุด **3 ครั้ง** (Exponential backoff: 1m, 5m, 30m)
- ถ้า Retry ครบ 3 ครั้งยังล้มเหลว → บันทึก Error Log + ไม่ส่งซ้ำ

---

### M3 · Search

- แสดงเฉพาะ Dataset ที่ Status เป็น `published` เท่านั้น
- Filter ที่ไม่มีข้อมูลให้ซ่อน Option นั้น แต่ยังแสดง Filter อยู่
- หลัง PATCH Dataset → ต้อง Re-index Elasticsearch ทันที (Background Task)
- หลัง Bulk Upload + Publish → ต้อง Index Elasticsearch ทุก Record (Background Task)
- หลัง Soft Delete → ต้องลบจาก Elasticsearch ทันที

---

### M4 · Download

- ต้องกรอกวัตถุประสงค์ก่อนดาวน์โหลดทุกครั้ง ทุก Role รวมถึง Visitor
- บันทึก IP + Timestamp ทุกครั้งที่ดาวน์โหลด
- INSERT `download_log` และ UPDATE `download_count` ต้องอยู่ใน Transaction เดียวกันเสมอ

---

### M5 · UI แสดงวันที่ Dataset

- ถ้า `updated_at != created_at` → แสดง "อัปเดตล่าสุด {updated_at}"
- ถ้า `updated_at == created_at` → แสดง "เผยแพร่เมื่อ {created_at}"
- ใช้กฎนี้กับทุก Component ที่แสดงวันที่ของ Dataset (DatasetCard, DatasetDetail, CategoryPage, HomePage)

---

### M6 · Admin

- Admin ไม่สามารถ Suspend ตัวเองได้
- Admin ไม่สามารถลด Role ตัวเองเป็น Agency ได้
- ถ้ามี Admin คนเดียวในระบบ ไม่สามารถลด Role คนนั้นเป็น Agency ได้ (ป้องกันระบบขาด Admin)
- Admin ไม่มีสิทธิ์ Approve หรือ Reject Dataset (ไม่มี Approval Workflow)
- Admin สามารถลบ/ซ่อน Dataset ที่ไม่เหมาะสมของ Agency ใดก็ได้ด้วย Soft Delete
- ทุก Action ของ Admin บันทึกใน `audit_logs` พร้อมเหตุผล (ถ้าจำเป็น)

---

### หมวดหมู่ (Categories)

- หมวดหมู่มี **2 ระดับ** Agency สร้างและจัดการของตัวเองได้เลย ไม่ต้องรอ Admin
- หมวดหมู่ผูกกับ Agency ที่สร้าง Agency อื่นใช้ร่วมไม่ได้
- Agency สร้างหมวดระดับ 1 ของตัวเองได้เลย
- Agency สร้างหมวดระดับ 2 ได้ ต้องอยู่ใต้ระดับ 1 ของตัวเองเท่านั้น
- Agency แก้ไขได้เฉพาะหมวดที่ตัวเองสร้างเท่านั้น
- ลบหมวดได้เฉพาะถ้าไม่มี Dataset อยู่ใต้นั้น
- Admin จัดการหมวดหมู่ของทุก Agency ได้
- เมื่อ Agency ถูก Suspend หมวดหมู่และ Dataset ที่ Publish ไว้แล้วยังแสดงปกติ

> 🔮 **v2 Note:** ในอนาคต (v2) จะเปลี่ยนเป็น Nested Category แบบไม่จำกัดชั้น (รายละเอียดใน `claude-v4.md`)

---

### M7 · API

- Rate Limit 100 request/นาที/IP สำหรับทุก Role รวมถึง Visitor
- เกิน Rate Limit คืน HTTP 429
- Rate Limit เฉพาะ Endpoint สำคัญดูที่ #47 Rate Limit Rules

---

### M8 · Security

- PII Masking ทำก่อนบันทึกลง DB เสมอ ทุก Role เห็นข้อมูลที่ Mask แล้วเท่านั้น
- ไฟล์ที่อัปโหลดต้องผ่าน PII Scan ก่อน Save ลง MinIO ทุกครั้ง
- ไฟล์ขนาดเกิน 100MB ต้องปฏิเสธทันที
- ตรวจสอบ MIME Type จริงของไฟล์ (ไม่เชื่อแค่นามสกุล) — ใช้ `python-magic` หรือเทียบ Magic Bytes
- รับเฉพาะ MIME: `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `application/json`
- Password เก็บแบบ Hash ด้วย bcrypt (cost factor ≥ 12)
- Token (verify, reset) เป็น UUID v4 + เก็บใน DB พร้อม expires_at
- ทุก Request ผ่าน HTTPS เท่านั้น

#### Data Deletion Rules (3 ระดับ)

**ระดับ 1: Hard Delete**
- ใช้กับ `users` ที่ `status = email_unverified` เกิน 14 วัน
- `DELETE FROM users WHERE ...` ลบจริงทั้ง row
- Cron Job รันทุกวัน เวลาตี 3
- เหตุผล: ยังไม่ verify ไม่มีข้อมูลผูกอยู่ ลบได้ปลอดภัย

**ระดับ 2: Soft Delete**
- ใช้กับ Admin ลบ user / Dataset / Category ที่ไม่เหมาะสม
- `SET is_deleted = true` ข้อมูลทุกอย่างยังอยู่ใน DB
- ไม่แสดงในทุก Query แต่ Admin ยังตรวจสอบย้อนหลังได้
- หลัง Soft Delete: user Login ไม่ได้ (เช็คทั้ง status + is_deleted)

**ระดับ 3: Anonymize (PDPA - Right to be Forgotten)**
- ใช้เมื่อผู้ใช้กด "ลบบัญชีของฉัน" ที่หน้า `/profile`
- หรือ Admin ทำ Anonymize ให้ตามคำขอ
- Set `is_deleted = true` + ปกปิดข้อมูลส่วนตัวทั้งหมด:

| Field เดิม | หลัง Anonymize |
|---|---|
| `email` | `deleted-<uuid>@deleted.local` |
| `password_hash` | `NULL` |
| `agency_name` | `[ลบแล้ว]` |
| `agency_name_en` | `[deleted]` |
| `agency_code` | `NULL` |
| `agency_website` | `NULL` |
| `contact_name` | `NULL` |
| `contact_position` | `NULL` |
| `contact_phone` | `NULL` |
| `verification_doc_path` | `NULL` (+ ลบไฟล์ใน MinIO ด้วย) |
| `reject_reason` | `NULL` |
| `suspend_reason` | `NULL` |
| `verify_token`, `reset_token` | `NULL` |

- บันทึก `audit_log`: action = `USER_ANONYMIZED`
- ส่ง Email แจ้ง "บัญชีของท่านถูกลบเรียบร้อย" (ส่งก่อน anonymize email)
- หลัง Anonymize:
  - Login ไม่ได้ (password_hash = NULL)
  - ไม่ปรากฏใน admin user list
  - Dataset ที่เคย Publish ยังอยู่ (เปลี่ยนชื่อเจ้าของเป็น `[ลบแล้ว]`)

#### Personal Data ในตารางอื่น (จัดการตอน Anonymize)

- `audit_logs`: ip_address → mask เป็น `xxx.xxx.xxx.xxx`, user_agent → NULL
- `download_logs`: ip_address → mask เป็น `xxx.xxx.xxx.xxx`
- `email_logs`: recipient_email → `deleted@deleted.local`
- `pdpa_consents`: **เก็บไว้** เป็นหลักฐานทางกฎหมาย ห้ามลบ ห้าม anonymize

#### Endpoint สำหรับการลบ

```
DELETE /api/v1/auth/me                           Agency/Admin ลบบัญชีตัวเอง (Anonymize)
DELETE /api/v1/admin/users/{id}/anonymize        Admin ทำ Anonymize ให้ user (PDPA request)
DELETE /api/v1/admin/users/{id}                  Admin Soft Delete (สำหรับ user ไม่เหมาะสม)
```

#### Data Retention Policy (ตามมาตรฐานหน่วยงานรัฐ)

| ข้อมูล | เก็บนานแค่ไหน | หลังพ้นเวลา |
|---|---|---|
| `audit_logs` | 2 ปี | Cron job mask ข้อมูลส่วนตัว |
| `download_logs` | 2 ปี | Cron job mask IP |
| `email_logs` | 1 ปี | Hard Delete |
| `pdpa_consents` | **ห้ามลบ** | ตลอดอายุระบบ (หลักฐานกฎหมาย) |
| `users` (status=email_unverified) | 14 วัน | Hard Delete |
| Dataset versions เก่า | ตลอดอายุระบบ | เก็บไว้เพื่อ traceability |

---

### M9 · Email System

#### SMTP Provider

- ใช้ **Brevo (Sendinblue)** เป็น SMTP Provider เริ่มต้น
- เหตุผล: ฟรี 300 emails/วัน, Deliverability สูง, Setup SPF/DKIM ง่าย
- ใช้ผ่าน standard SMTP (smtp-relay.brevo.com:587)
- ถ้าต้องเปลี่ยน Provider ในอนาคต เปลี่ยนแค่ค่า `.env` (SMTP_HOST/USER/PASSWORD)
- ใช้ library `fastapi-mail` ใน Backend

#### Domain & Sender Setup

- Sender Email: `noreply@edudata.go.th` (หรือ Domain ของหน่วยงาน)
- Sender Name: `Thai EduData Insight` (Display Name)
- ต้องตั้งค่า DNS Record ดังนี้:
  - **SPF Record** — ระบุ Brevo เป็นผู้ส่ง
  - **DKIM Record** — Brevo ให้มา ใส่ใน DNS
  - **DMARC Record** — `v=DMARC1; p=quarantine; rua=mailto:admin@edudata.go.th`
- ถ้ายังไม่มี Domain → ใช้ Sandbox ของ Brevo สำหรับทดสอบ

#### Email Content Best Practices (ป้องกัน Spam)

**ทำ:**
- Subject ชัดเจน เริ่มด้วยชื่อระบบ เช่น `[Thai EduData] ยืนยันอีเมลของคุณ`
- ส่งทั้ง Plain Text + HTML (multipart) ในทุกฉบับ
- From มี Display Name: `Thai EduData Insight <noreply@edudata.go.th>`
- ใช้ภาษาสุภาพ มืออาชีพ ขึ้นต้นด้วย "เรียน คุณ..."
- ลงท้ายด้วยที่อยู่หน่วยงาน + วิธีติดต่อ Admin
- ลิงก์ใช้ Domain เต็มของระบบ (เช่น `https://edudata.go.th/verify-email?token=xxx`)
- รูปต่อข้อความ ≤ 40% (ข้อความเยอะกว่ารูป)
- Footer ใส่ "ท่านได้รับอีเมลนี้เนื่องจาก..." (อธิบายว่าทำไมถึงได้รับ)

**ไม่ทำ:**
- คำต้องห้าม (Spam Trigger Words): FREE, WIN, URGENT, CLICK HERE, !!!, $$$, GUARANTEED, ACT NOW
- ใช้ตัวพิมพ์ใหญ่ทั้งหมดในหัวข้อหรือเนื้อหา
- ใช้ลิงก์สั้น (bit.ly, tinyurl) — ใช้ลิงก์เต็มเสมอ
- HTML ที่ไม่มี Plain Text fallback
- รูปภาพเดี่ยวๆ ไม่มีข้อความรอบ
- Attachment ที่ไม่จำเป็น (ทำให้ถูก flag เป็น spam)

#### Email Templates (v1 ต้องมี 9 แบบ)

1. **Email Verification** — หลังสมัคร พร้อมลิงก์ยืนยัน
2. **Welcome / Approved** — หลัง Admin Approve
3. **Rejected** — หลัง Admin Reject พร้อมเหตุผล
4. **Suspended** — หลัง Admin Suspend พร้อมเหตุผล
5. **Unsuspended** — หลัง Admin Unsuspend
6. **Password Reset** — พร้อมลิงก์ตั้งรหัสใหม่
7. **Password Changed** — แจ้งเตือนหลังเปลี่ยนรหัสสำเร็จ
8. **Account Lockout Alert** — แจ้งเตือนเมื่อบัญชีถูกล็อก
9. **New Dataset Notification** — แจ้ง Subscriber เมื่อมี Dataset ใหม่
10. **Admin Notification** — แจ้ง Admin เมื่อมี Registration ใหม่รออนุมัติ

#### Email Logging (table `email_logs`)

- บันทึกทุกฉบับที่ส่ง พร้อม Status
- Status enum: `pending`, `sent`, `delivered`, `bounced`, `failed`, `complained`
- Fields หลัก:
  - `id`, `user_id` (NULL ได้ถ้าเป็น admin notification), `template_name`
  - `recipient_email`, `subject`
  - `status`, `error_message`, `retry_count`
  - `sent_at`, `delivered_at`, `created_at`
  - `provider_message_id` (Brevo Message ID สำหรับ debug)
- Index บน: `recipient_email`, `status`, `created_at`

> รายละเอียด Schema ของ `email_logs` ดูที่ #11 Database Tables (Round 3)

#### Retry Logic

- ส่งเมล fail → Retry สูงสุด **3 ครั้ง** (Exponential backoff: 1m, 5m, 30m)
- Retry ครบ → Status = `failed` + บันทึก error_message
- ใช้ FastAPI Background Tasks ในการ Retry
- ไม่ Block HTTP Response ของผู้ใช้

#### Email Test Cases (ใช้ในการ Test)

**Happy Path:**
1. ส่งเมลถึง Gmail → เข้า Inbox ภายใน 30 วินาที
2. ส่งเมลถึง Outlook → เข้า Inbox ภายใน 60 วินาที
3. ส่งเมลถึง Hotmail/Yahoo → เข้า Inbox ภายใน 60 วินาที
4. ลิงก์ในเมลคลิกได้ Token ใช้งานได้
5. Plain Text version แสดงผลถูกต้องในเมลที่ปิด HTML

**Edge Cases (ต้องจัดการได้):**
6. Email ผู้รับสะกดผิด/ไม่มีจริง → Bounce → บันทึก status=`bounced`
7. SMTP Connection fail (Brevo ล่ม) → Retry 3 ครั้ง → ถ้ายัง fail บันทึก status=`failed`
8. เกิน Quota 300/วัน → Block + แจ้ง Admin
9. Token หมดอายุ → คลิกลิงก์แล้วแสดงข้อความ "ลิงก์หมดอายุ [ขอใหม่]"
10. ส่งเมลซ้ำใน 60 วินาที (Resend Verification) → Block + แจ้ง "กรุณารอ X วินาที"

**Spam Prevention Tests:**
11. ทดสอบ Spam Score ที่ mail-tester.com → ต้องได้ ≥ 8/10
12. ตรวจ SPF/DKIM/DMARC ผ่าน (ทดสอบที่ mxtoolbox.com)
13. Subject + Content ต้องไม่มีคำต้องห้าม

**Monitoring:**
14. Dashboard ของ Brevo ดู Bounce Rate ≤ 5%, Spam Complaint Rate ≤ 0.1%
15. Email Logs ในระบบเราเอง ต้อง query ได้รวดเร็วใน `/admin/email-logs`

#### Production Readiness สำหรับ Email

- ตั้งค่า DNS Record (SPF/DKIM/DMARC) ก่อน Go-Live
- ทดสอบส่งทุก Template ทั้ง 10 แบบ ก่อน Deploy
- Email ทุกฉบับใน Production ต้องส่งจาก Sender Domain ของระบบเท่านั้น
- Staging ใช้ Brevo Sandbox หรือ Mailtrap (ไม่ส่งเมลจริงออก)
- Dev ใช้ Mailtrap (Sandbox SMTP) ไม่ส่งเมลจริง

---
## #6 · Naming Convention

**Database**
- ชื่อ Table → snake_case พหูพจน์ เช่น users, datasets, download_logs, email_logs
- ชื่อ Column → snake_case เช่น created_at, dataset_id, is_deleted
- ชื่อ Index → idx_ชื่อtable_ชื่อcolumn เช่น idx_datasets_status
- ชื่อ Foreign Key → fk_ชื่อtable_ชื่อtableที่อ้างถึง เช่น fk_datasets_users

**Backend (Python/FastAPI)**
- ชื่อ File → snake_case เช่น dataset_service.py, auth_router.py, email_service.py
- ชื่อ Function → snake_case เช่น get_dataset_by_id()
- ชื่อ Class → PascalCase เช่น DatasetService, UserRepository, EmailService
- ชื่อ Variable → snake_case เช่น dataset_id, user_role
- ชื่อ Constant → UPPER_SNAKE_CASE เช่น MAX_FILE_SIZE, JWT_EXPIRE_MINUTES

**Frontend (Next.js)**
- ชื่อ Component File → PascalCase เช่น DatasetCard.tsx, SearchFilter.tsx
- ชื่อ Page File → kebab-case เช่น dataset-detail.tsx
- ชื่อ Function/Hook → camelCase เช่น useDatasetSearch(), handleDownload()
- ชื่อ CSS Class → kebab-case เช่น dataset-card, search-filter
- ชื่อ Constant → UPPER_SNAKE_CASE เช่น API_BASE_URL

**API Endpoint**
- ใช้ kebab-case เสมอ เช่น /api/v1/datasets, /api/v1/bulk-upload
- ใช้ Noun ไม่ใช่ Verb เช่น /datasets ไม่ใช่ /getDatasets
- พหูพจน์เสมอ เช่น /datasets, /users, /tags

**Environment Variables**
- UPPER_SNAKE_CASE เสมอ เช่น DATABASE_URL, REDIS_HOST, JWT_SECRET

**Email Templates**
- ชื่อไฟล์ → snake_case + `.html` เช่น `verify_email.html`, `password_reset.html`, `account_approved.html`
- ใช้ Jinja2 Template Syntax: `{{ variable_name }}`, `{% if condition %}`

---

## #7 · Folder Structure

```
datacatalog/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   │   └── [locale]/
│   │   │       ├── (public)/
│   │   │       ├── (agency)/
│   │   │       └── (admin)/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── dataset/
│   │   │   ├── search/
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── utils/
│   │   └── locales/
│   ├── .env.local
│   └── next.config.js
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── routers/
│   │   │       └── __init__.py
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── email_service.py        # ส่งเมลผ่าน fastapi-mail
│   │   │   └── ...
│   │   ├── repositories/
│   │   ├── workers/
│   │   │   ├── email_retry_worker.py   # Retry email ที่ส่ง fail
│   │   │   ├── cleanup_worker.py       # ลบ email_unverified > 14 วัน
│   │   │   └── ...
│   │   ├── email_templates/            # Jinja2 templates สำหรับเมล
│   │   │   ├── verify_email.html
│   │   │   ├── account_approved.html
│   │   │   ├── account_rejected.html
│   │   │   ├── account_suspended.html
│   │   │   ├── account_unsuspended.html
│   │   │   ├── password_reset.html
│   │   │   ├── password_changed.html
│   │   │   ├── account_lockout.html
│   │   │   ├── new_dataset_notification.html
│   │   │   └── admin_new_registration.html
│   │   └── utils/
│   ├── migrations/
│   ├── tests/
│   ├── .env
│   └── main.py
│
├── docker/
│   ├── frontend.dockerfile
│   ├── backend.dockerfile
│   └── nginx.conf
│
├── docker-compose.yml
├── docker-compose.staging.yml
├── docker-compose.prod.yml
└── README.md
```

---

## #8 · Tech Stack Rules

**Frontend**
- ใช้ Next.js 14 App Router เท่านั้น ห้ามใช้ Pages Router
- ใช้ TypeScript เท่านั้น ห้ามใช้ JavaScript
- ใช้ Recharts สำหรับกราฟทุกประเภท ห้ามใช้ Chart.js หรือ D3
- ใช้ React DnD Kit สำหรับ Drag & Drop ห้ามใช้ React Beautiful DnD
- ใช้ Zustand สำหรับ State Management ห้ามใช้ Redux
- ใช้ React Hook Form สำหรับ Form ทุกตัว ห้ามจัดการ Form State เอง
- ใช้ Zod สำหรับ Validation ทุกตัว
- ใช้ TailwindCSS สำหรับ Styling ห้ามเขียน CSS ตรงๆ
- ใช้ next-intl สำหรับ i18n

**Backend**
- ใช้ FastAPI เท่านั้น ห้ามใช้ Flask หรือ Django
- ใช้ SQLAlchemy สำหรับ ORM ทุกตัว ห้ามเขียน Raw SQL ยกเว้นกรณีที่ ORM ทำไม่ได้จริงๆ
- ใช้ Alembic สำหรับ Database Migration ทุกครั้ง ห้ามแก้ DB ตรงๆ
- ใช้ Pydantic สำหรับ Schema Validation ทุกตัว
- ใช้ Pandas สำหรับประมวลผลไฟล์ CSV/Excel/JSON เท่านั้น
- ใช้ FastAPI Background Tasks สำหรับ Async Task ห้ามใช้ Celery
- ใช้ **fastapi-mail** สำหรับส่ง Email ทุกครั้ง ห้ามใช้ smtplib ตรงๆ
- ใช้ **Jinja2** สำหรับ Email Template (มากับ fastapi-mail)
- ใช้ **python-magic** สำหรับตรวจ MIME Type จริงของไฟล์
- ใช้ **APScheduler** สำหรับ Cron Job ใน process (ไม่ใช้ Celery Beat)

**Database**
- ใช้ PostgreSQL สำหรับข้อมูลทุกประเภทที่เป็นโครงสร้าง
- ใช้ Redis สำหรับ Cache และ Session เท่านั้น ห้ามเก็บข้อมูลถาวรใน Redis
- ใช้ MinIO สำหรับเก็บไฟล์ทุกประเภท ห้ามเก็บไฟล์ใน Local Disk

**Search**
- ใช้ Elasticsearch สำหรับ Search ทุกอย่าง ห้ามใช้ PostgreSQL Full-text Search
- ใช้ PyThaiNLP ตัดคำไทยก่อนส่งให้ Elasticsearch ทุกครั้ง

**Security**
- ใช้ JWT สำหรับ Authentication ทุกตัว
- ใช้ python-jose สำหรับออก JWT
- ใช้ passlib (bcrypt) สำหรับ Hash Password ด้วย cost factor ≥ 12

**Email Service**
- ใช้ **Brevo (Sendinblue)** เป็น SMTP Provider (Free Tier 300/วัน)
- Dev environment ใช้ **Mailtrap** (Sandbox SMTP) ไม่ส่งเมลจริง
- Staging environment ใช้ **Mailtrap** หรือ Brevo Sandbox ไม่ส่งเมลจริง
- Production environment ใช้ **Brevo** ส่งเมลจริง

---

## #9 · Environment Variables

**Backend `.env`**
```
# App
APP_ENV=development
APP_SECRET_KEY=
APP_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=
DATABASE_POOL_SIZE=10

# Redis
REDIS_HOST=
REDIS_PORT=6379
REDIS_PASSWORD=

# MinIO
MINIO_ENDPOINT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET_NAME=

# Elasticsearch
ELASTICSEARCH_URL=

# JWT
JWT_SECRET=
JWT_EXPIRE_MINUTES=60

# SMTP (Dev=Mailtrap, Prod=Brevo)
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@datacatalog.th
SMTP_FROM_NAME=Thai EduData Insight
SMTP_USE_TLS=true

# Admin Notification
ADMIN_NOTIFICATION_EMAIL=admin@datacatalog.th

# Auth - Token Expiry
VERIFY_TOKEN_EXPIRE_HOURS=24
RESET_TOKEN_EXPIRE_HOURS=1

# Auth - Account Lockout
ACCOUNT_LOCKOUT_THRESHOLD=5
ACCOUNT_LOCKOUT_DURATION_MINUTES=15

# Auth - Cleanup
EMAIL_UNVERIFIED_CLEANUP_DAYS=14

# Security
BCRYPT_COST_FACTOR=12

# Rate Limit
RATE_LIMIT_PER_MINUTE=100
RATE_LIMIT_REGISTER_PER_HOUR=3
RATE_LIMIT_LOGIN_PER_MINUTE=5
RATE_LIMIT_RESEND_EMAIL_COOLDOWN_SECONDS=60

# File Upload
MAX_FILE_SIZE_MB=100
MAX_VERIFICATION_DOC_SIZE_MB=5

# Email Retry
EMAIL_RETRY_MAX_ATTEMPTS=3
EMAIL_RETRY_BACKOFF_MINUTES=1,5,30

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001
```

**Frontend `.env.local`**
```
# API
NEXT_PUBLIC_API_BASE_URL=

# App
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=Thai EduData Insight
NEXT_PUBLIC_SUPPORT_EMAIL=support@datacatalog.th
```

**Environment-Specific Email Config**
| Environment | SMTP Host | ส่งเมลจริง? |
|---|---|---|
| Dev (Local) | sandbox.smtp.mailtrap.io | ❌ Sandbox ดักไว้ ไม่ส่งจริง |
| Staging | sandbox.smtp.mailtrap.io | ❌ Sandbox เท่านั้น |
| Production | smtp-relay.brevo.com | ✅ ส่งจริง |

**CORS Configuration**
- `ALLOWED_ORIGINS` รับค่าเป็น comma-separated URLs
- Dev: รวม localhost ที่ใช้ในการพัฒนา (port 3000, 3001 หรืออื่น)
- Production: ต้องเป็น URL จริงของ Frontend เท่านั้น ห้ามใส่ `*` (wildcard)
- ทุก URL ต้องระบุ protocol (http:// หรือ https://) และ port (ถ้าไม่ใช่ default)

---

## #10 · API Response Standard (JSend)

**Success Response**
```json
{
  "success": true,
  "data": {},
  "message": "ok"
}
```

**Success Response แบบ List**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  },
  "message": "ok"
}
```

**Error Response**
```json
{
  "success": false,
  "error": {
    "code": "DATASET_NOT_FOUND",
    "message": "ไม่พบ Dataset ที่ต้องการ"
  }
}
```

**กฎ**
- ทุก Endpoint ต้องใช้รูปแบบนี้เสมอ ไม่มีข้อยกเว้น
- data เป็น Object สำหรับข้อมูลชิ้นเดียว
- data เป็น Array สำหรับข้อมูลหลายรายการ
- message ใช้ภาษาอังกฤษเสมอ
- error.message ใช้ภาษาไทยเพื่อแสดงให้ผู้ใช้เห็น
- error.code ใช้ UPPER_SNAKE_CASE เสมอ

---

## #11 · Database Tables

| ชื่อตาราง | เก็บอะไร | Module |
|---|---|---|
| users | ข้อมูล User ทุก Role | M1 |
| bookmarks | Dataset ที่ User bookmark ไว้ | M1 |
| subscriptions | การติดตามหมวด/หน่วยงาน | M1 |
| datasets | ข้อมูล Dataset ทั้งหมด | M2 |
| dataset_versions | ประวัติการแก้ไข Dataset | M2 |
| dataset_files | ไฟล์จริงที่อยู่ใน MinIO | M2 |
| categories | หมวดหมู่ Dataset แบบ 2 ระดับ Agency สร้างและจัดการของตัวเองได้เลย ผูกกับ Agency ที่สร้าง | M2 |
| tags | แท็กทั้งหมด | M2 |
| dataset_tags | ความสัมพันธ์ Dataset กับ Tag | M2 |
| saved_searches | เงื่อนไขค้นหาที่บันทึกไว้ | M3 |
| download_logs | ประวัติการดาวน์โหลด | M4 |
| dashboard_layouts | Layout Custom Dashboard | M5 |
| announcements | ประกาศ/Banner หน้าหลัก | M6 |
| audit_logs | ประวัติทุก Action ในระบบ รวม Login History | M6 |
| pdpa_consents | บันทึกการยอมรับ PDPA + Terms (2 rows/user) | M8 |
| email_logs | ประวัติการส่งเมลทุกฉบับ | M9 |

---

## #12 · Database Fields & Types

**`users`**

| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| email | VARCHAR(255) | NO | - | Unique |
| password_hash | VARCHAR(255) | NO | - | bcrypt cost ≥ 12 |
| role | ENUM(user_role) | NO | - | visitor/agency/admin |
| status | ENUM(user_status) | NO | email_unverified | email_unverified/pending/active/rejected/suspended |
| agency_name | VARCHAR(255) | YES | NULL | ชื่อหน่วยงาน TH (บังคับสำหรับ Agency) |
| agency_name_en | VARCHAR(255) | YES | NULL | ชื่อหน่วยงาน EN (optional) |
| agency_type | ENUM(agency_type) | YES | NULL | บังคับสำหรับ Agency |
| agency_code | VARCHAR(100) | YES | NULL | เลขที่หน่วยงาน (optional) |
| agency_website | VARCHAR(500) | YES | NULL | เว็บไซต์หน่วยงาน (optional) |
| contact_name | VARCHAR(255) | YES | NULL | ชื่อผู้ติดต่อ (บังคับสำหรับ Agency) |
| contact_position | VARCHAR(255) | YES | NULL | ตำแหน่งผู้ติดต่อ (optional) |
| contact_phone | VARCHAR(50) | YES | NULL | เบอร์ผู้ติดต่อ (บังคับสำหรับ Agency) |
| verification_doc_path | VARCHAR(500) | YES | NULL | Path ใน MinIO bucket `verification-docs/` |
| email_verified_at | TIMESTAMPTZ | YES | NULL | เวลายืนยันอีเมล |
| verify_token | VARCHAR(255) | YES | NULL | UNIQUE — UUID v4 |
| verify_expires_at | TIMESTAMPTZ | YES | NULL | หมดอายุ 24 ชม. |
| reset_token | VARCHAR(255) | YES | NULL | UNIQUE — UUID v4 |
| reset_expires_at | TIMESTAMPTZ | YES | NULL | หมดอายุ 1 ชม. |
| failed_login_count | INTEGER | NO | 0 | นับจำนวน fail ติดต่อกัน |
| locked_until | TIMESTAMPTZ | YES | NULL | เวลาที่ปลดล็อค |
| reject_reason | TEXT | YES | NULL | เหตุผลที่ Admin Reject |
| suspend_reason | TEXT | YES | NULL | เหตุผลที่ Admin Suspend |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| deleted_at | TIMESTAMPTZ | YES | NULL | เวลาที่ถูกลบ (Soft/Anonymize) |
| deletion_type | ENUM(deletion_type) | YES | NULL | soft_delete / anonymized |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**Field Required สำหรับ Role Agency ตอนสมัคร:**
- บังคับ: `email`, `password_hash`, `agency_name`, `agency_type`, `contact_name`, `contact_phone`, `verification_doc_path`
- Optional: `agency_name_en`, `agency_code`, `agency_website`, `contact_position`

> **หมายเหตุ:** `verification_doc_path` ใน DB เป็น Nullable เพื่อรองรับ Admin/Seed users ที่ไม่มีเอกสาร แต่ Validation ระดับ API บังคับสำหรับ Role Agency ตอนสมัคร

**`datasets`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| category_id | UUID | YES | NULL | FK → categories |
| title | VARCHAR(500) | NO | - | |
| description | TEXT | YES | NULL | |
| status | ENUM(dataset_status) | NO | draft | draft = บันทึกร่าง, published = เผยแพร่ทันที |
| license | ENUM(dataset_license) | NO | - | |
| metadata | JSONB | YES | NULL | DCAT-AP metadata |
| quality_score | INTEGER | YES | NULL | 0-100 |
| download_count | INTEGER | NO | 0 | Cache ไม่ใช่ข้อมูลจริง |
| view_count | INTEGER | NO | 0 | |
| reject_comment | TEXT | YES | NULL | ไม่ใช้แล้ว — เก็บไว้เพื่อ backward compatibility |
| published_at | TIMESTAMPTZ | YES | NULL | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`dataset_versions`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| dataset_id | UUID | NO | - | FK → datasets |
| version_number | INTEGER | NO | - | เริ่มจาก 1 |
| file_path | VARCHAR(500) | NO | - | Path ใน MinIO |
| changelog | TEXT | YES | NULL | |
| created_by | UUID | NO | - | FK → users |
| created_at | TIMESTAMPTZ | NO | now() | |

**`dataset_files`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| dataset_id | UUID | NO | - | FK → datasets |
| file_name | VARCHAR(255) | NO | - | |
| file_path | VARCHAR(500) | NO | - | Path ใน MinIO |
| file_size | BIGINT | NO | - | หน่วย Bytes |
| file_format | ENUM(file_format) | NO | - | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`categories`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| parent_id | UUID | YES | NULL | FK → categories ตัวเอง, NULL = ระดับ 1 |
| created_by | UUID | NO | - | FK → users (Agency ที่สร้าง) |
| level | INTEGER | NO | 1 | 1 = ระดับบนสุด, 2 = ระดับย่อย |
| name_th | VARCHAR(255) | NO | - | |
| name_en | VARCHAR(255) | NO | - | |
| slug | VARCHAR(255) | NO | - | Unique ภายใน parent_id |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`tags`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| name | VARCHAR(100) | NO | - | Unique |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`dataset_tags`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| dataset_id | UUID | NO | - | FK → datasets |
| tag_id | UUID | NO | - | FK → tags |
| created_at | TIMESTAMPTZ | NO | now() | |

**`bookmarks`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| dataset_id | UUID | NO | - | FK → datasets |
| created_at | TIMESTAMPTZ | NO | now() | |

**`subscriptions`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| category_id | UUID | YES | NULL | FK → categories |
| agency_user_id | UUID | YES | NULL | FK → users |
| created_at | TIMESTAMPTZ | NO | now() | |

**`saved_searches`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| name | VARCHAR(255) | NO | - | |
| filters | JSONB | NO | - | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`download_logs`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| dataset_id | UUID | NO | - | FK → datasets |
| user_id | UUID | YES | NULL | NULL ถ้าเป็น Visitor |
| ip_address | VARCHAR(45) | NO | - | |
| purpose | TEXT | NO | - | |
| file_format | ENUM(file_format) | NO | - | |
| created_at | TIMESTAMPTZ | NO | now() | |

**`dashboard_layouts`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users, Unique |
| layout | JSONB | NO | - | |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`announcements`**
| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| title | VARCHAR(500) | NO | - | |
| content | TEXT | NO | - | |
| is_active | BOOLEAN | NO | true | |
| is_deleted | BOOLEAN | NO | false | Soft Delete |
| created_by | UUID | NO | - | FK → users |
| created_at | TIMESTAMPTZ | NO | now() | |
| updated_at | TIMESTAMPTZ | NO | now() | |

**`audit_logs`** (เพิ่ม `user_agent` เพื่อรองรับ Login History)

| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | YES | NULL | NULL ถ้าเป็น Visitor |
| action | VARCHAR(100) | NO | - | เช่น LOGIN_SUCCESS, LOGIN_FAIL, USER_APPROVED |
| target_type | VARCHAR(100) | NO | - | เช่น dataset, user |
| target_id | UUID | YES | NULL | |
| detail | JSONB | YES | NULL | |
| ip_address | VARCHAR(45) | NO | - | |
| user_agent | VARCHAR(500) | YES | NULL | Browser ของผู้ใช้ |
| created_at | TIMESTAMPTZ | NO | now() | |

**`pdpa_consents`** (เพิ่ม `consent_type` รองรับ Terms + PDPA แยก)

| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | NO | - | FK → users |
| consent_type | ENUM(consent_type) | NO | - | terms / pdpa |
| version | VARCHAR(50) | NO | - | เช่น '1.0', '2024-01' |
| consented_at | TIMESTAMPTZ | NO | now() | |
| ip_address | VARCHAR(45) | NO | - | |

> **หมายเหตุ:** User 1 คนจะมี **2 rows** (consent_type='terms' + consent_type='pdpa')

**`email_logs`** (ตารางใหม่ — บันทึกประวัติการส่งเมลทุกฉบับ)

| Column | Type | Nullable | Default | หมายเหตุ |
|---|---|---|---|---|
| id | UUID | NO | gen_random_uuid() | Primary Key |
| user_id | UUID | YES | NULL | FK → users (NULL ถ้าส่งถึง Admin notify) |
| template_name | VARCHAR(100) | NO | - | เช่น verify_email, password_reset |
| recipient_email | VARCHAR(255) | NO | - | อีเมลผู้รับ |
| subject | VARCHAR(500) | NO | - | หัวข้อเมล |
| status | ENUM(email_status) | NO | pending | pending/sent/delivered/bounced/failed/complained |
| error_message | TEXT | YES | NULL | ข้อความ error |
| retry_count | INTEGER | NO | 0 | จำนวนครั้ง Retry |
| provider_message_id | VARCHAR(255) | YES | NULL | Message ID จาก Brevo |
| sent_at | TIMESTAMPTZ | YES | NULL | เวลาส่งสำเร็จจาก SMTP |
| delivered_at | TIMESTAMPTZ | YES | NULL | เวลาผู้รับ deliver (ถ้า provider แจ้ง) |
| created_at | TIMESTAMPTZ | NO | now() | |

---

## #13 · Database Relationships

- User คนหนึ่ง → อัปโหลดได้หลาย Dataset
- User คนหนึ่ง → Bookmark ได้หลาย Dataset
- User คนหนึ่ง → Subscribe ได้หลายหมวด/หน่วยงาน
- User คนหนึ่ง → บันทึกการค้นหาได้หลายอัน
- User คนหนึ่ง → มี Dashboard Layout ได้แค่ 1 อัน
- User คนหนึ่ง → ดาวน์โหลดได้หลายครั้ง
- User คนหนึ่ง → รับเมลได้หลายฉบับ (1:M กับ email_logs)
- User คนหนึ่ง → มี PDPA Consent ได้ 2 rows (terms + pdpa)
- Agency คนหนึ่ง → สร้างหมวดหมู่ของตัวเองได้หลายหมวด
- Dataset หนึ่งชุด → เป็นของ User คนเดียวเท่านั้น
- Dataset หนึ่งชุด → อยู่ใน Category เดียวเท่านั้น
- Dataset หนึ่งชุด → มีได้หลาย Version
- Dataset หนึ่งชุด → มีได้หลายไฟล์
- Dataset หนึ่งชุด → ติดได้หลาย Tag
- Dataset หนึ่งชุด → ถูกดาวน์โหลดได้หลายครั้ง
- Dataset หนึ่งชุด → ถูก Bookmark ได้โดยหลายคน
- Category หนึ่งหมวด → เป็นของ Agency ที่สร้างเท่านั้น
- Category หนึ่งหมวด → มีได้หลาย Dataset
- Category ระดับ 1 → มีได้หลาย Category ระดับ 2 ใต้ตัวเอง
- Tag หนึ่งอัน → ติดได้กับหลาย Dataset และ Dataset หนึ่งชุดติดได้หลาย Tag ต้องมีตาราง dataset_tags กลางไว้เชื่อม

---

## #14 · ENUM Definitions

| ชื่อ ENUM | ใช้ที่ Column | ค่าที่มี | หมายความว่า |
|---|---|---|---|
| user_role | users.role | visitor | ประชาชนทั่วไป |
| | | agency | หน่วยงานรัฐ |
| | | admin | ผู้ดูแลระบบ |
| user_status | users.status | email_unverified | สมัครแล้วยังไม่ยืนยันอีเมล |
| | | pending | ยืนยันอีเมลแล้ว รอ Admin อนุมัติ |
| | | active | ใช้งานได้ปกติ |
| | | rejected | ถูกปฏิเสธ |
| | | suspended | ถูกระงับชั่วคราว |
| agency_type | users.agency_type | central | ส่วนกลาง |
| | | regional | ภูมิภาค |
| | | local | ท้องถิ่น |
| | | educational | สถาบันการศึกษา |
| | | other | อื่นๆ |
| dataset_status | datasets.status | draft | บันทึกร่างไว้ก่อน ยังไม่เผยแพร่ |
| | | published | เผยแพร่สาธารณะ |

> **Migration Note:** DB เดิมมี ENUM ค่า `submitted` และ `rejected` อยู่ → Migration ต้อง UPDATE datasets SET status='published' WHERE status IN ('submitted','rejected') ก่อนแล้วค่อยลบ ENUM ค่าออก
| dataset_license | datasets.license | open | เปิดเผยสาธารณะ ใช้ได้เลย |
| | | conditional | มีเงื่อนไขการใช้งาน |
| | | cc | Creative Commons |
| file_format | dataset_files.file_format, download_logs.file_format | csv | ไฟล์ CSV |
| | | excel | ไฟล์ Excel |
| | | json | ไฟล์ JSON |
| | | xml | ไฟล์ XML (Export เท่านั้น) |
| email_status | email_logs.status | pending | รอส่ง |
| | | sent | ส่งสำเร็จจาก SMTP |
| | | delivered | ผู้รับได้รับแล้ว (ถ้า provider แจ้ง) |
| | | bounced | เมลเด้งกลับ (recipient ไม่มีจริง) |
| | | failed | ส่งไม่สำเร็จหลัง Retry หมด |
| | | complained | ผู้รับ mark เป็น spam |
| consent_type | pdpa_consents.consent_type | terms | ข้อกำหนดและเงื่อนไขการใช้งาน |
| | | pdpa | นโยบายความเป็นส่วนตัว |

---

## #15 · Soft Delete Strategy

**หลักการ**
- ห้าม DELETE ข้อมูลออกจาก Database จริง ทุกกรณี
- ใช้การ SET is_deleted = true แทนเสมอ
- ข้อมูลที่ is_deleted = true ต้องไม่แสดงในทุก Query ทุกกรณี

**ตารางที่ใช้ Soft Delete**
- users, datasets, dataset_files, categories, tags, saved_searches, announcements

**ตารางที่ไม่ใช้ Soft Delete**
- download_logs — Log ห้ามลบเด็ดขาด
- audit_logs — Log ห้ามลบเด็ดขาด
- email_logs — Log ห้ามลบเด็ดขาด
- pdpa_consents — หลักฐานการยินยอม PDPA ห้ามลบ
- dataset_versions — ประวัติการแก้ไขห้ามลบ
- dataset_tags, bookmarks, subscriptions — ลบ Row จริงได้เพราะเป็นแค่ความสัมพันธ์

**ข้อยกเว้นพิเศษสำหรับ `users`:**
- Record ที่ `status = email_unverified` เกิน 14 วัน → ลบจริง (Hard Delete) ผ่าน Cron Job
- เหตุผล: ยังไม่ใช่ user จริง ยังไม่มี data ผูกอยู่ ลบทิ้งได้

**กฎการเขียน Query**
- ทุก Query ที่ดึงข้อมูลต้องมี WHERE is_deleted = false เสมอ
- ใช้ SQLAlchemy Filter อัตโนมัติผ่าน Base Model ไม่เขียนเองทุกครั้ง

---

## #16 · Audit Fields

**กฎ**
- ทุกตารางต้องมี created_at เสมอ ไม่มีข้อยกเว้น
- ตารางที่แก้ไขได้ต้องมี updated_at ด้วยเสมอ
- updated_at ต้องอัปเดตอัตโนมัติทุกครั้งที่มีการแก้ไข

| ตาราง | created_at | updated_at |
|---|---|---|
| users | ✅ | ✅ |
| datasets | ✅ | ✅ |
| dataset_versions | ✅ | ❌ |
| dataset_files | ✅ | ✅ |
| categories | ✅ | ✅ |
| tags | ✅ | ✅ |
| dataset_tags | ✅ | ❌ |
| bookmarks | ✅ | ❌ |
| subscriptions | ✅ | ❌ |
| saved_searches | ✅ | ✅ |
| download_logs | ✅ | ❌ |
| dashboard_layouts | ✅ | ✅ |
| announcements | ✅ | ✅ |
| audit_logs | ✅ | ❌ |
| pdpa_consents | ✅ | ❌ |
| email_logs | ✅ | ❌ |

---

## #17 · Database Index Strategy

| ตาราง | Index | เหตุผล |
|---|---|---|
| users | idx_users_email | ค้นหา User ด้วย Email ตอน Login |
| users | idx_users_role | กรอง User ตาม Role |
| users | idx_users_status | กรอง User ตาม Status (pending, active, ฯลฯ) |
| users | idx_users_agency_type | กรอง Agency ตามประเภท |
| users | idx_users_verify_token | UNIQUE — ค้นหาตอน verify email |
| users | idx_users_reset_token | UNIQUE — ค้นหาตอน reset password |
| users | idx_users_locked_until | เช็คว่ายังถูก lock อยู่ไหม |
| users | idx_users_is_deleted | กรอง Soft Delete |
| datasets | idx_datasets_status | กรองเฉพาะ Published |
| datasets | idx_datasets_user_id | ดู Dataset ของ Agency |
| datasets | idx_datasets_category_id | กรองตาม Category |
| datasets | idx_datasets_is_deleted | กรอง Soft Delete |
| datasets | idx_datasets_published_at | เรียงตามวันที่ Publish |
| dataset_versions | idx_dataset_versions_dataset_id | ดู Version ของ Dataset |
| dataset_files | idx_dataset_files_dataset_id | ดูไฟล์ของ Dataset |
| dataset_tags | idx_dataset_tags_dataset_id | ดู Tag ของ Dataset |
| dataset_tags | idx_dataset_tags_tag_id | ดู Dataset ของ Tag |
| bookmarks | idx_bookmarks_user_id | ดู Bookmark ของ User |
| subscriptions | idx_subscriptions_user_id | ดู Subscription ของ User |
| saved_searches | idx_saved_searches_user_id | ดูการค้นหาที่บันทึกของ User |
| download_logs | idx_download_logs_dataset_id | ดูประวัติดาวน์โหลดของ Dataset |
| download_logs | idx_download_logs_user_id | ดูประวัติดาวน์โหลดของ User |
| download_logs | idx_download_logs_created_at | กรองตามช่วงเวลา |
| audit_logs | idx_audit_logs_user_id | ดู Log ของ User |
| audit_logs | idx_audit_logs_action | กรอง action เช่น LOGIN_SUCCESS |
| audit_logs | idx_audit_logs_created_at | กรองตามช่วงเวลา |
| categories | idx_categories_slug | ค้นหาด้วย slug ใน URL |
| categories | idx_categories_parent_id | ดูหมวดย่อยของหมวดแม่ |
| tags | idx_tags_name | ค้นหา Tag ด้วยชื่อ |
| dashboard_layouts | idx_dashboard_layouts_user_id | ดึง Dashboard ของ User |
| announcements | idx_announcements_is_active | ดึงเฉพาะประกาศที่ active |
| pdpa_consents | idx_pdpa_consents_user_id | เช็ค PDPA ของ User |
| pdpa_consents | idx_pdpa_consents_consent_type | กรองตามประเภท consent |
| email_logs | idx_email_logs_user_id | ดูเมลของ User |
| email_logs | idx_email_logs_recipient_email | ค้นหาตามผู้รับ (debug) |
| email_logs | idx_email_logs_status | กรองเฉพาะ failed เพื่อ retry |
| email_logs | idx_email_logs_created_at | กรองตามช่วงเวลา |

**Unique Constraints**
- users: (verify_token), (reset_token) — แยก unique แต่ละช่อง
- dataset_versions: (dataset_id, version_number)
- dataset_tags: (dataset_id, tag_id)
- bookmarks: (user_id, dataset_id)
- subscriptions: (user_id, category_id)
- subscriptions: (user_id, agency_user_id)
- dashboard_layouts: (user_id)
- categories: (parent_id, slug) — slug unique ภายใต้ parent เดียวกัน
- pdpa_consents: (user_id, consent_type) — 1 user มี terms 1 + pdpa 1

---

## #18 · Migration Rules

**กฎหลัก**
- ทุกการเปลี่ยนแปลง Database ต้องทำผ่าน Alembic เท่านั้น ห้ามแก้ Database ตรงๆ
- ทุก Migration File ต้องมีทั้ง upgrade และ downgrade เสมอ
- ห้ามแก้ Migration File ที่ Deploy ไปแล้ว ถ้าต้องแก้ให้สร้าง Migration ใหม่

**การตั้งชื่อ Migration File**
- รูปแบบ → YYYY_MM_DD_HHmm_คำอธิบายสั้นๆ
- ตัวอย่าง → 2025_01_15_1030_add_email_verification_fields_to_users

**สิ่งที่ทำได้**
- เพิ่ม Table ใหม่ ✅
- เพิ่ม Column ใหม่ ✅ ต้องเป็น Optional เสมอ
- เพิ่ม Index ✅
- เพิ่มค่าใน ENUM ✅ (ใช้ ALTER TYPE ... ADD VALUE)
- แก้ชื่อ Column ⚠️ ต้องระวัง Code ที่ใช้ชื่อเดิม
- ลบ Column ❌ ห้ามลบ ให้ Deprecate แทน
- ลบ Table ❌ ห้ามลบ ให้ Deprecate แทน

**ขั้นตอน**
1. สร้าง Migration File ด้วย Alembic
2. ตรวจสอบ upgrade และ downgrade ให้ครบ
3. ทดสอบใน Dev ก่อนเสมอ
4. ทดสอบใน Staging ก่อน Deploy Production
5. Backup Database ก่อน Run Migration ใน Production ทุกครั้ง

**Migration Plan สำหรับ v1 (ลำดับ):**
1. `add_agency_info_fields_to_users` — agency_name_en, type, code, website, contact_*, verification_doc_path
2. `add_email_verification_fields_to_users` — email_verified_at, verify_token, verify_expires_at
3. `add_password_reset_fields_to_users` — reset_token, reset_expires_at
4. `add_account_lockout_fields_to_users` — failed_login_count, locked_until
5. `add_rejected_suspend_reason_to_users` — reject_reason, suspend_reason
6. `add_email_unverified_to_user_status_enum` — เพิ่ม value
7. `create_agency_type_enum` — ENUM ใหม่
8. `create_email_status_enum` — ENUM ใหม่
9. `create_consent_type_enum` — ENUM ใหม่
10. `create_email_logs_table` — ตารางใหม่
11. `add_user_agent_to_audit_logs` — เพิ่ม column
12. `add_consent_type_to_pdpa_consents` — เพิ่ม column
13. `create_new_indexes` — Index ใหม่ทั้งหมด

---

## #19 · ER Diagram (DBML)

> ER Diagram แบบ DBML จะอยู่ในไฟล์แยก `docs/er-diagram.dbml`  
> รายละเอียดของแต่ละ Table และ Field อ้างอิงจาก #11, #12, #13, #14, #17

**สรุป Relationships หลัก:**

```
users (1) ──< (M) datasets
users (1) ──< (M) bookmarks
users (1) ──< (M) subscriptions
users (1) ──< (M) saved_searches
users (1) ──< (M) download_logs
users (1) ──< (M) categories (created_by)
users (1) ──< (M) email_logs
users (1) ──< (M) audit_logs
users (1) ──< (2) pdpa_consents [terms + pdpa]
users (1) ── (1) dashboard_layouts

datasets (1) ──< (M) dataset_versions
datasets (1) ──< (M) dataset_files
datasets (M) ──< (M) tags  [via dataset_tags]
datasets (1) ──< (M) bookmarks
datasets (1) ──< (M) download_logs
datasets (M) ──> (1) categories

categories (1) ──< (M) categories [self-reference parent_id]
```

---

## #20 · API List

> **Base URL:** `/api/v1`  
> ทุก Endpoint ต้องตอบ JSend Format ตาม #10  
> เครื่องหมาย ✅ = ต้องใช้ Token / ❌ = ไม่ต้อง

### Auth Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| POST | /auth/register | สมัครเป็น Agency | Visitor | ❌ |
| POST | /auth/verify-email | ยืนยันอีเมลด้วย token | All | ❌ |
| POST | /auth/resend-verification | ขออีเมล verify ใหม่ | All | ❌ |
| GET | /auth/register-status | เช็คสถานะหลังสมัคร | All | ❌ |
| POST | /auth/login | เข้าสู่ระบบ | All | ❌ |
| POST | /auth/logout | ออกจากระบบ | Agency, Admin | ✅ |
| GET | /auth/me | ดูข้อมูลตัวเอง | Agency, Admin | ✅ |
| POST | /auth/forgot-password | ขอลิงก์ reset password | All | ❌ |
| POST | /auth/reset-password | ตั้งรหัสใหม่ด้วย token | All | ❌ |
| GET | /auth/login-history | ดูประวัติ Login ของตัวเอง | Agency, Admin | ✅ |
| DELETE | /auth/me | ลบบัญชีตัวเอง (Anonymize) | Agency, Admin | ✅ |

### User Endpoints (Agency Side)

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| PATCH | /users/me | แก้ไขข้อมูลโปรไฟล์ตัวเอง | Agency, Admin | ✅ |
| GET | /agency/dashboard | สถิติ Dashboard ของ Agency | Agency, Admin | ✅ |
| GET | /agency/datasets | รายการ Dataset ของตัวเอง | Agency, Admin | ✅ |
| GET | /agency/activity-logs | Activity Log ของตัวเอง | Agency, Admin | ✅ |

### Dataset Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /datasets | ค้นหา/รายการ Dataset (published เท่านั้น) | All | ❌ |
| GET | /datasets/{id} | รายละเอียด Dataset | All | ❌ |
| GET | /datasets/{id}/preview | Preview 100 แถว | All | ❌ |
| POST | /datasets | สร้าง Dataset ใหม่ | Agency, Admin | ✅ |
| PATCH | /datasets/{id} | แก้ไข Dataset + สร้าง Version ใหม่ | Owner, Admin | ✅ |
| POST | /datasets/{id}/publish | เผยแพร่ Dataset (draft → published) | Owner, Admin | ✅ |
| DELETE | /datasets/{id} | ลบ Dataset (Soft Delete) | Owner, Admin | ✅ |
| GET | /datasets/{id}/versions | รายการ Version ของ Dataset | Owner, Admin | ✅ |
| POST | /datasets/{id}/restore/{version} | Restore Version | Owner, Admin | ✅ |
| POST | /datasets/bulk-upload | อัปโหลด Excel หลายชุด | Agency, Admin | ✅ |
| GET | /datasets/{id}/quality-score | Quality Score | Owner, Admin | ✅ |
| POST | /datasets/{id}/download | ดาวน์โหลด + บันทึก log | All | ❌ |
| POST | /datasets/{id}/citation | Citation | All | ❌ |
| POST | /datasets/{id}/export-pdf | Export PDF | All | ❌ |

### Search Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /search | ค้นหา Dataset (Elasticsearch + Filter) | All | ❌ |
| GET | /search/autocomplete | Autocomplete Suggestion | All | ❌ |

### Saved Search Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /saved-searches | รายการที่บันทึก | Agency, Admin | ✅ |
| POST | /saved-searches | บันทึกเงื่อนไขใหม่ | Agency, Admin | ✅ |
| DELETE | /saved-searches/{id} | ลบ | Agency, Admin | ✅ |

### Bookmark Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /bookmarks | รายการ Bookmark | Agency, Admin | ✅ |
| POST | /bookmarks | เพิ่ม Bookmark | Agency, Admin | ✅ |
| DELETE | /bookmarks/{dataset_id} | ลบ Bookmark | Agency, Admin | ✅ |

### Subscription Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /subscriptions | รายการ Subscription | Agency, Admin | ✅ |
| POST | /subscriptions | สมัคร Subscription | Agency, Admin | ✅ |
| DELETE | /subscriptions/{id} | ยกเลิก Subscription | Agency, Admin | ✅ |

### Category Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /categories | รายการหมวด (ทั้งระบบ) | All | ❌ |
| GET | /categories/{id}/datasets | Dataset ใต้หมวด | All | ❌ |
| POST | /categories | สร้างหมวดของตัวเอง | Agency, Admin | ✅ |
| PATCH | /categories/{id} | แก้ไขหมวดของตัวเอง | Owner, Admin | ✅ |
| DELETE | /categories/{id} | ลบหมวด (ถ้าไม่มี dataset) | Owner, Admin | ✅ |

### Tag Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /tags | รายการแท็ก | All | ❌ |

### Stats Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /stats/overview | สถิติภาพรวม | All | ❌ |
| GET | /stats/trending | Dataset ยอดนิยม | All | ❌ |
| GET | /stats/new-releases | Dataset ใหม่ล่าสุด | All | ❌ |
| GET | /stats/compare | เปรียบเทียบ Dataset | All | ❌ |

### Dashboard Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /dashboard/layout | โหลด Layout | All | ❌ (Visitor มี local layout ได้) |
| POST | /dashboard/layout | บันทึก Layout | Agency, Admin | ✅ |

### Admin Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /admin/dashboard | Dashboard สถิติระบบ | Admin | ✅ |
| GET | /admin/stats/monthly | สถิติ Dataset/Download รายเดือน | Admin | ✅ |
| GET | /admin/stats/years | ปีที่มีข้อมูล | Admin | ✅ |
| GET | /admin/users | รายการ User ทั้งหมด | Admin | ✅ |
| GET | /admin/users/{id} | รายละเอียด User | Admin | ✅ |
| POST | /admin/users/{id}/approve | อนุมัติ Agency | Admin | ✅ |
| POST | /admin/users/{id}/reject | ปฏิเสธ Agency (บังคับ `reason`) | Admin | ✅ |
| POST | /admin/users/{id}/suspend | ระงับ Agency (บังคับ `reason`) | Admin | ✅ |
| POST | /admin/users/{id}/unsuspend | ปลดระงับ Agency | Admin | ✅ |
| PATCH | /admin/users/{id}/role | เปลี่ยน Role (บังคับ Logout) | Admin | ✅ |
| DELETE | /admin/users/{id} | Soft Delete User | Admin | ✅ |
| POST | /admin/users/{id}/anonymize | Anonymize User (PDPA) | Admin | ✅ |
| GET | /admin/datasets | รายการ Dataset ทุก status | Admin | ✅ |
| POST | /admin/datasets/{id}/hide | ซ่อน Dataset | Admin | ✅ |
| GET | /admin/audit-logs | Audit Log ทั้งระบบ | Admin | ✅ |
| GET | /admin/announcements | ประกาศ | Admin | ✅ |
| POST | /admin/announcements | สร้างประกาศ | Admin | ✅ |
| PATCH | /admin/announcements/{id} | แก้ประกาศ | Admin | ✅ |
| DELETE | /admin/announcements/{id} | ลบประกาศ | Admin | ✅ |
| GET | /admin/categories | จัดการหมวดทั้งระบบ | Admin | ✅ |
| GET | /admin/tags | จัดการแท็ก | Admin | ✅ |
| POST | /admin/tags | เพิ่มแท็ก | Admin | ✅ |
| DELETE | /admin/tags/{id} | ลบแท็ก | Admin | ✅ |
| GET | /admin/pages | รายการ Static Page | Admin | ✅ |
| PATCH | /admin/pages/{slug} | แก้ Static Page | Admin | ✅ |
| GET | /admin/hero-image | ดู Hero Image | Admin | ✅ |
| PATCH | /admin/hero-image | เปลี่ยน Hero Image | Admin | ✅ |
| GET | /admin/email-logs | ดู Log การส่งเมล | Admin | ✅ |
| POST | /admin/email-logs/{id}/resend | ส่งเมลซ้ำ | Admin | ✅ |

### Public Pages Endpoints

| Method | Endpoint | ทำอะไร | Role | Token |
|---|---|---|---|---|
| GET | /pages/{slug} | ดู Static Page (Privacy/Terms/Help) | All | ❌ |
| GET | /announcements | ประกาศที่ active | All | ❌ |
| GET | /hero-image | Hero Image | All | ❌ |

---

## #21 · API Request Format

**Content-Type**
- `application/json` สำหรับ Body ทั่วไป
- `multipart/form-data` สำหรับ Upload ไฟล์

**Header ที่บังคับ**
```
Authorization: Bearer <jwt_token>   (สำหรับ endpoint ที่ต้อง login)
Content-Type: application/json
Accept-Language: th  หรือ  en       (กำหนดภาษา error message)
```

**Body Format (JSON)**
- snake_case สำหรับ field name เสมอ
- ค่า null ส่งเป็น `null` ไม่ใช่ `""` หรือ `"null"`
- Date เป็น ISO 8601 เสมอ เช่น `2025-01-15T10:30:00Z`

**Query Parameter**
- snake_case เสมอ
- Pagination: `page`, `page_size`
- Sorting: `sort_by`, `sort_order` (asc/desc)
- Filter: ชื่อ field ตรงๆ เช่น `category_id=xxx&license=open`

**Upload File (multipart/form-data)**
- Field name `file` สำหรับไฟล์เดี่ยว
- Field name `files[]` สำหรับหลายไฟล์
- ขนาดสูงสุด: ตามค่า `MAX_FILE_SIZE_MB` ใน .env (default 100MB)
- เอกสารยืนยันตน: field `verification_doc`, ขนาดสูงสุด 5MB

---

## #22 · API Response Format

อ้างอิงจาก #10 API Response Standard (JSend)

**Success — Single Object**
```json
{
  "success": true,
  "data": { "id": "...", "title": "..." },
  "message": "ok"
}
```

**Success — List with Pagination**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  },
  "message": "ok"
}
```

**Success — Empty Response (เช่น DELETE)**
```json
{
  "success": true,
  "data": null,
  "message": "deleted"
}
```

**Error**
```json
{
  "success": false,
  "error": {
    "code": "DATASET_NOT_FOUND",
    "message": "ไม่พบ Dataset ที่ต้องการ",
    "details": { "field": "id" }
  }
}
```

**กฎ**
- `success` เป็น boolean เสมอ
- `data` ส่งได้ทั้ง object, array, หรือ null
- `error.code` เป็น UPPER_SNAKE_CASE
- `error.message` เป็นภาษาไทย (ผู้ใช้อ่านโดยตรง)
- `error.details` เป็น object optional (ระบุ field ที่ผิด)

---

## #23 · Pagination Standard

**Query Parameter**
- `page` — เริ่มที่ 1 (default = 1)
- `page_size` — default 20, สูงสุด 100

**Response**
```json
{
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 156,
    "total_pages": 8
  }
}
```

**กฎ**
- ทุก List Endpoint ต้องมี Pagination เสมอ
- เกิน `page_size` = 100 → ปฏิเสธด้วย HTTP 400
- หน้าที่ขอเกินจริง → คืน `data: []`, `pagination.page` = ค่าที่ขอมา

---

## #24 · Error Code Dictionary

| Error Code | HTTP Status | ความหมาย |
|---|---|---|
| **Auth Errors** | | |
| INVALID_CREDENTIALS | 401 | Email หรือ Password ไม่ถูก |
| TOKEN_INVALID | 401 | Token ไม่ถูกต้อง |
| TOKEN_EXPIRED | 401 | Token หมดอายุ (JWT, Verify, Reset) |
| TOKEN_ALREADY_USED | 400 | Token ใช้ไปแล้ว |
| EMAIL_NOT_VERIFIED | 403 | บัญชียังไม่ verify อีเมล |
| ACCOUNT_LOCKED | 423 | บัญชีถูก lock ชั่วคราว |
| ACCOUNT_PENDING | 403 | บัญชีรอ Admin อนุมัติ |
| ACCOUNT_REJECTED | 403 | บัญชีถูกปฏิเสธ |
| ACCOUNT_SUSPENDED | 403 | บัญชีถูกระงับ |
| ACCOUNT_DELETED | 410 | บัญชีถูกลบแล้ว |
| USER_ANONYMIZED | 410 | User ถูก Anonymize แล้ว |
| EMAIL_ALREADY_REGISTERED | 409 | อีเมลมีบัญชีอยู่แล้ว |
| RESEND_COOLDOWN | 429 | ขอ resend เร็วเกิน รอ 60 วินาที |
| PDPA_NOT_ACCEPTED | 400 | ไม่ติ๊ก PDPA Consent |
| TERMS_NOT_ACCEPTED | 400 | ไม่ติ๊ก Terms Consent |
| INVALID_AGENCY_TYPE | 400 | ประเภทหน่วยงานไม่ถูกต้อง |
| VERIFICATION_DOC_REQUIRED | 400 | ต้องอัปโหลดเอกสารยืนยันตน |
| **Permission Errors** | | |
| FORBIDDEN | 403 | ไม่มีสิทธิ์ |
| ADMIN_CANNOT_SUSPEND_SELF | 403 | Admin ห้าม suspend ตัวเอง |
| LAST_ADMIN_CANNOT_DEMOTE | 403 | Admin คนสุดท้ายห้ามลด role |
| **Validation Errors** | | |
| VALIDATION_ERROR | 422 | ข้อมูลไม่ผ่าน validation |
| FILE_TOO_LARGE | 413 | ไฟล์เกิน 100MB |
| VERIFICATION_DOC_TOO_LARGE | 413 | เอกสารยืนยันเกิน 5MB |
| INVALID_FILE_FORMAT | 415 | นามสกุลไฟล์ไม่รองรับ |
| INVALID_MIME_TYPE | 415 | MIME type ไม่ถูก (ตรวจ Magic Bytes) |
| **Resource Errors** | | |
| NOT_FOUND | 404 | ไม่พบทรัพยากร |
| USER_NOT_FOUND | 404 | ไม่พบ User |
| DATASET_NOT_FOUND | 404 | ไม่พบ Dataset |
| CATEGORY_NOT_FOUND | 404 | ไม่พบหมวด |
| CATEGORY_SLUG_EXISTS | 409 | Slug ซ้ำใต้ parent เดียวกัน |
| CATEGORY_HAS_DATASETS | 409 | ลบหมวดไม่ได้ มี Dataset อยู่ |
| **Email Errors** | | |
| EMAIL_SEND_FAILED | 500 | ส่งเมลไม่สำเร็จ |
| EMAIL_BOUNCED | 422 | อีเมลผู้รับเด้งกลับ |
| **System Errors** | | |
| RATE_LIMIT_EXCEEDED | 429 | เรียก API เกิน Rate Limit |
| INTERNAL_ERROR | 500 | Error ภายในระบบ |
| SERVICE_UNAVAILABLE | 503 | บริการไม่พร้อมใช้งาน |

---

## #25 · Auth Header Standard

**Format**
```
Authorization: Bearer <jwt_token>
```

**JWT Payload**
```json
{
  "sub": "<user_id>",
  "role": "agency",
  "exp": 1735689600,
  "iat": 1735686000
}
```

**กฎ**
- ทุก endpoint ที่ต้อง login ตรวจ Header ผ่าน Middleware ก่อนถึง Route Handler
- Token หมดอายุ → คืน 401 พร้อม code `TOKEN_EXPIRED`
- Token ใน Redis ถูกลบ (Logout, role change) → คืน 401 พร้อม code `TOKEN_INVALID`
- Token ของ user ที่ถูก suspend/delete → คืน 403 พร้อม code ตามสถานะ

---

## #26 · HTTP Status Rules

| Status | ใช้เมื่อ |
|---|---|
| 200 OK | สำเร็จ คืนข้อมูล |
| 201 Created | สร้างทรัพยากรใหม่สำเร็จ |
| 204 No Content | สำเร็จ ไม่คืนข้อมูล (DELETE) |
| 400 Bad Request | ข้อมูล Request ผิด |
| 401 Unauthorized | ไม่ได้ Login หรือ Token ผิด |
| 403 Forbidden | Login แล้วแต่ไม่มีสิทธิ์ |
| 404 Not Found | ไม่พบทรัพยากร |
| 409 Conflict | ข้อมูลขัดแย้ง (ซ้ำ, มีอยู่แล้ว) |
| 410 Gone | ทรัพยากรถูกลบถาวรแล้ว |
| 413 Payload Too Large | ไฟล์ใหญ่เกิน |
| 415 Unsupported Media Type | MIME ไม่รองรับ |
| 422 Unprocessable Entity | Validation ไม่ผ่าน |
| 423 Locked | บัญชีถูก lock ชั่วคราว |
| 429 Too Many Requests | เกิน Rate Limit |
| 500 Internal Server Error | Error ภายในระบบ |
| 503 Service Unavailable | บริการ down ชั่วคราว |

---

## #27 · API Versioning Rules

- ทุก endpoint ต้องอยู่ใต้ `/api/v1/...` เสมอ ตั้งแต่วันแรก
- เมื่อต้องเปลี่ยน Breaking Change ใหญ่ → สร้าง `/api/v2/...` ใหม่
- `/api/v1` ยังต้องใช้งานได้ต่ออีกอย่างน้อย 6 เดือนหลัง v2 release
- Deprecation Header ใน v1: `Sunset: <date>` และ `Deprecation: true`
- ทุก endpoint คืน Header `X-API-Version: v1`
- เปลี่ยนเฉพาะ field ที่ตอบกลับโดยไม่กระทบโครงสร้าง → ไม่ต้องขึ้น v2
- เปลี่ยนชื่อ field, ลบ field, เปลี่ยน type → ต้องขึ้น v2

---

## #28 · Authentication Flow

### 1. Register Flow (สมัครเป็น Agency)

```
[1] Visitor เข้าหน้า /register
    └─ กรอกข้อมูล: agency_name, agency_type, agency_code (optional),
                  agency_website (optional), contact_name, contact_position (optional),
                  contact_phone, email, password
    └─ อัปโหลดเอกสารยืนยันตน (PDF, ≤5MB) ← บังคับ
    └─ ติ๊ก ☐ Terms + ☐ PDPA (บังคับทั้ง 2)
    └─ กด "สมัครสมาชิก"

[2] POST /auth/register
    ├─ Validate: email format, password policy, agency_type ENUM,
    │             PDPA + Terms accepted, verification_doc PDF + ≤5MB
    ├─ Upload verification_doc ไปยัง MinIO bucket "verification-docs/"
    ├─ INSERT users (status = email_unverified)
    ├─ INSERT pdpa_consents (terms + pdpa = 2 rows)
    ├─ Generate verify_token (UUID v4)
    ├─ UPDATE users SET verify_token, verify_expires_at = NOW() + 24h
    └─ Background Task: ส่ง Email Verification

[3] ระบบส่ง Email
    └─ Subject: "[Thai EduData] ยืนยันอีเมลของคุณ"
    └─ ลิงก์: {APP_BASE_URL}/verify-email?token={token}
    └─ INSERT email_logs (status=pending)

[4] ผู้ใช้เปิด Email → คลิกลิงก์
    └─ Frontend: หน้า /verify-email อ่าน token จาก URL
    └─ POST /auth/verify-email { token }

[5] Backend ตรวจ Token
    ├─ ถ้า token ไม่มี → คืน TOKEN_INVALID
    ├─ ถ้า expires_at ผ่านมาแล้ว → คืน TOKEN_EXPIRED
    ├─ ถ้าใช้ไปแล้ว → คืน TOKEN_ALREADY_USED
    └─ ถ้าผ่าน:
        ├─ UPDATE users SET status = pending, email_verified_at = NOW(),
        │                    verify_token = NULL
        └─ Background Task: ส่ง Email แจ้ง Admin ว่ามีบัญชีรออนุมัติ
        
[6] Frontend แสดง "ยืนยันอีเมลเรียบร้อย บัญชีอยู่ระหว่างพิจารณา"

[7] Admin ตรวจสอบที่ /admin/users (filter status=pending)
    ├─ เห็นข้อมูลที่ Agency กรอก + เอกสารยืนยันตน
    ├─ ตัดสินใจ: Approve / Reject

[8a] Admin Approve
     ├─ POST /admin/users/{id}/approve
     ├─ UPDATE users SET status = active
     ├─ Background Task: ส่ง Email "บัญชีอนุมัติแล้ว"
     ├─ INSERT audit_log: USER_APPROVED
     └─ ผู้ใช้ Login ได้

[8b] Admin Reject
     ├─ POST /admin/users/{id}/reject { reason }
     ├─ UPDATE users SET status = rejected, reject_reason = reason
     ├─ Background Task: ส่ง Email "ไม่ผ่านการพิจารณา เหตุผล: ..."
     └─ INSERT audit_log: USER_REJECTED + reason
```

### 2. Login Flow

```
[1] ผู้ใช้กรอก email + password ที่หน้า /login

[2] POST /auth/login
    ├─ Validate format
    ├─ Query users WHERE email AND is_deleted = false
    ├─ ถ้าไม่พบ user → INVALID_CREDENTIALS (401)
    ├─ ถ้า user ถูก lock (locked_until > NOW) → ACCOUNT_LOCKED (423)
    ├─ ตรวจ status:
    │   ├─ email_unverified → EMAIL_NOT_VERIFIED (403)
    │   ├─ pending → ACCOUNT_PENDING (403)
    │   ├─ rejected → ACCOUNT_REJECTED (403)
    │   ├─ suspended → ACCOUNT_SUSPENDED (403)
    │   └─ active → ผ่าน
    ├─ Verify password (bcrypt)
    │   ├─ ผิด → failed_login_count += 1
    │   │       ถ้า ≥ 5 → locked_until = NOW + 15min, ส่ง Email Lockout
    │   │       คืน INVALID_CREDENTIALS
    │   └─ ถูก → failed_login_count = 0, locked_until = NULL
    ├─ Generate JWT (exp = JWT_EXPIRE_MINUTES)
    ├─ Save token + session ใน Redis
    ├─ INSERT audit_log: LOGIN_SUCCESS (IP, user_agent)
    └─ คืน { access_token, user }

[3] Frontend เก็บ token, redirect ไป Dashboard ตาม Role
```

### 3. Forgot / Reset Password Flow

```
[1] ผู้ใช้กด "ลืมรหัสผ่าน" ที่หน้า /login
    └─ ไปหน้า /forgot-password
    └─ กรอก email → POST /auth/forgot-password

[2] Backend
    ├─ Query users WHERE email
    ├─ ถ้าไม่พบ → คืน success เหมือนกัน (ป้องกัน email enumeration)
    ├─ Rate limit: ถ้าเคยขอใน 60 วินาทีล่าสุด → RESEND_COOLDOWN
    ├─ Generate reset_token
    ├─ UPDATE users SET reset_token, reset_expires_at = NOW + 1h
    └─ Background Task: ส่ง Email พร้อมลิงก์ /reset-password?token=xxx

[3] ผู้ใช้คลิกลิงก์
    └─ หน้า /reset-password อ่าน token จาก URL
    └─ แสดง form ตั้งรหัสใหม่ (Password Strength Indicator)

[4] POST /auth/reset-password { token, new_password }
    ├─ Validate password policy
    ├─ ถ้า token ไม่มี/หมดอายุ → TOKEN_EXPIRED/INVALID
    ├─ UPDATE users SET password_hash = hash(new_password),
    │                    reset_token = NULL,
    │                    failed_login_count = 0,
    │                    locked_until = NULL
    ├─ ลบ Session ทั้งหมดของ user นี้ใน Redis (บังคับ Login ใหม่)
    ├─ Background Task: ส่ง Email "รหัสผ่านถูกเปลี่ยนแล้ว"
    └─ INSERT audit_log: PASSWORD_RESET
```

### 4. Account Lockout Flow

```
[1] Login fail 5 ครั้งติดต่อกัน
    ├─ failed_login_count = 5
    ├─ locked_until = NOW + 15 min
    └─ Background Task: ส่ง Email "บัญชีถูก lock"

[2] ผู้ใช้พยายาม Login ในระหว่าง lock
    └─ คืน ACCOUNT_LOCKED + retry_after = (locked_until - NOW)

[3] หลัง 15 นาที
    └─ ครั้งต่อไป Login จะตรวจ locked_until < NOW → ผ่านปกติ
    └─ ถ้า login ถูก → reset failed_login_count = 0
```

### 5. Self-Delete Flow (Anonymize)

```
[1] ผู้ใช้ Login เข้าระบบ → ไปหน้า /profile/delete
    └─ คำเตือน: "การลบบัญชีจะลบข้อมูลส่วนตัวถาวร 
                Dataset ที่อัปโหลดยังคงอยู่ในระบบ"
    └─ ติ๊กยอมรับ + กรอกรหัสผ่านยืนยัน + กด "ลบบัญชี"

[2] DELETE /auth/me { password }
    ├─ Verify password (bcrypt)
    ├─ ส่ง Email ฉบับสุดท้าย "บัญชีของท่านถูกลบแล้ว" (ก่อน anonymize)
    ├─ ทำ Anonymize ตาม #5 M8:
    │   ├─ email → deleted-<uuid>@deleted.local
    │   ├─ password_hash → NULL
    │   ├─ ปกปิด agency_*, contact_*, verification_doc_path → NULL
    │   ├─ ลบไฟล์ verification_doc จาก MinIO
    │   └─ is_deleted = true
    ├─ Mask IP ใน audit_logs/download_logs ของ user คนนี้
    ├─ Mask recipient_email ใน email_logs
    ├─ ลบ Session ทั้งหมดใน Redis
    ├─ INSERT audit_log: USER_SELF_ANONYMIZED
    └─ คืน success
```

---

## #29 · Upload Dataset Flow

```
[1] Agency หรือ Admin เข้า /datasets/new
    ├─ กรอก: title, description, category, license, tags, year, province
    ├─ Upload ไฟล์ (CSV/Excel/JSON) ขนาดสูงสุด 100MB
    └─ เลือก: "บันทึก Draft" หรือ "เผยแพร่"

[2] POST /datasets (multipart/form-data)
    ├─ Validate: title, file size ≤ 100MB
    ├─ MIME Type validation จริงด้วย python-magic
    │   └─ ถ้าไม่ถูก → INVALID_MIME_TYPE (415)
    ├─ Save ไฟล์ใน /tmp ก่อน
    ├─ PII Scan ไฟล์
    │   ├─ ตรวจหา: รหัสนักเรียน, เบอร์โทร, เลขบัตรประชาชน
    │   └─ ถ้าเจอ → Mask อัตโนมัติ (replace ด้วย *)
    ├─ คำนวณ Quality Score (0-100)
    ├─ Upload ไฟล์ที่ Mask แล้วไปยัง MinIO
    ├─ INSERT datasets (status = draft หรือ published ตามที่เลือก)
    ├─ INSERT dataset_files
    ├─ INSERT dataset_versions (version 1)
    ├─ ถ้า status = published:
    │   ├─ UPDATE datasets SET published_at = NOW()
    │   ├─ Background Task: Index ลง Elasticsearch
    │   └─ Background Task: ส่ง Email Subscriber
    └─ คืน { dataset_id }

[3] Background Task: Index ES
    ├─ ตัดคำไทยด้วย PyThaiNLP
    ├─ Index ใน ES (title, description, tags, category, agency)
    └─ ถ้า fail → Retry 3 ครั้ง (exponential backoff)
```

---

## #30 · Dataset Publish Workflow

```
[Draft → Published]

[1] Owner เข้า /datasets/{id}/edit → กดปุ่ม "เผยแพร่"

[2] POST /datasets/{id}/publish
    ├─ Permission check: owner หรือ admin
    ├─ ตรวจ status ปัจจุบัน:
    │   ├─ ถ้า published แล้ว → INVALID_OPERATION
    │   └─ ถ้า draft → ทำต่อ
    ├─ UPDATE datasets SET status = published, published_at = NOW()
    ├─ Background Task: Index ES
    ├─ Background Task: ส่ง Email Subscriber
    │   └─ Subscriber ที่ติดตามหมวดนี้หรือหน่วยงานนี้
    └─ INSERT audit_log: DATASET_PUBLISHED

[Edit Dataset]

Agency PATCH /datasets/{id}:
    ├─ ถ้า Dataset ปัจจุบัน = published:
    │   ├─ status คงเป็น published เสมอ (ลดกลับเป็น draft ไม่ได้)
    │   └─ แก้ไข metadata/ไฟล์ได้ปกติ
    ├─ ถ้า Dataset ปัจจุบัน = draft:
    │   └─ เลือกได้ว่า draft หรือ published
    ├─ สร้าง dataset_version ใหม่ (version_number = MAX + 1)
    ├─ UPDATE datasets SET ..., updated_at = NOW()
    ├─ Background Task: Re-index ES (ทุกกรณี)
    └─ INSERT audit_log: DATASET_UPDATED

Admin PATCH /datasets/{id}:
    ├─ published ทันทีเสมอ ไม่ว่า status เดิมเป็นอะไร
    ├─ สร้าง dataset_version ใหม่
    ├─ UPDATE datasets SET status = published, updated_at = NOW()
    ├─ Background Task: Re-index ES
    └─ INSERT audit_log: DATASET_UPDATED

[Soft Delete]

[1] DELETE /datasets/{id}
    ├─ UPDATE datasets SET is_deleted = true
    ├─ Background Task: ลบ document จาก ES ← สำคัญ!
    └─ INSERT audit_log: DATASET_DELETED
```

---

## #31 · Search Flow

```
[1] ผู้ใช้ค้นที่ /search หรือใช้ Filter

[2] GET /search?q=...&category_id=...&license=...&year=...&page=1
    ├─ Validate filter values (year format, ENUM)
    ├─ Build ES Query:
    │   ├─ q: ตัดคำไทยด้วย PyThaiNLP
    │   ├─ filters: term query
    │   └─ ต้อง status = published เท่านั้น (filter ใน ES)
    ├─ Sort: relevance (default) หรือตาม sort_by
    ├─ Paginate
    └─ คืน { data: [...], pagination, facets }

[3] Frontend แสดงผล + Sidebar Filter
    └─ Filter Options มาจาก facets (ซ่อนถ้าไม่มีข้อมูล)

[Re-index Rules]
- หลัง POST /datasets (published) → Index ทันที (Background Task)
- หลัง POST /datasets/{id}/publish → Index ทันที
- หลัง PATCH /datasets/{id} → Re-index (Background Task)
- หลัง POST /datasets/bulk-upload → Index ทุก dataset ที่ publish (Background Task)
- หลัง DELETE /datasets/{id} → ลบจาก ES ทันที
- หลัง POST /admin/datasets/{id}/hide → ลบจาก ES ทันที

[Autocomplete]
- GET /search/autocomplete?q=โรง
- ดึงจาก ES suggester (ตัดคำไทย)
- คืน 10 suggestion สูงสุด
```

---

## #32 · Download Flow

```
[1] ผู้ใช้ที่ /datasets/{id} กดปุ่ม "ดาวน์โหลด"
    └─ Modal กรอก:
        ├─ วัตถุประสงค์ (บังคับกรอก ห้ามว่าง)
        ├─ รูปแบบไฟล์: CSV / Excel / JSON / XML
        └─ กด "ดาวน์โหลด"

[2] POST /datasets/{id}/download { purpose, file_format }
    ├─ Validate purpose, format
    ├─ Permission check: dataset.status = published (เห็นทุก role)
    └─ ⚠️ TRANSACTION: ต้องอยู่ใน Transaction เดียวกัน
        ├─ INSERT download_logs (ip, user_id, purpose, format)
        ├─ UPDATE datasets SET download_count += 1
        └─ COMMIT

[3] Generate file ตาม format
    ├─ CSV: เพิ่ม BOM สำหรับ Excel แสดงภาษาไทยถูก
    ├─ Excel: ใช้ openpyxl
    ├─ JSON: pretty print
    └─ XML: ตาม DCAT schema

[4] คืนไฟล์ (Content-Disposition: attachment)

[Citation]
POST /datasets/{id}/citation
└─ คืน Text Citation format (APA, MLA, ฯลฯ)

[Export PDF Report]
POST /datasets/{id}/export-pdf
└─ Generate PDF Report (metadata + sample 100 rows)
```

---

## #33 · Notification (Email) Flow

```
[Architecture]
Backend → fastapi-mail → SMTP (Brevo Production / Mailtrap Dev) → ผู้รับ
                ↓
            email_logs (DB)

[1] เกิด Event ที่ต้องส่งเมล
    เช่น: ผู้ใช้สมัคร, Admin approve, ผู้ใช้ลืมรหัส

[2] ใช้ EmailService (services/email_service.py)
    ├─ สร้าง MessageSchema ด้วย Jinja2 Template
    ├─ INSERT email_logs (status = pending)
    └─ trigger Background Task ส่งเมล

[3] Background Task ส่ง
    ├─ พยายามส่งผ่าน fastapi-mail
    ├─ ถ้าสำเร็จ:
    │   └─ UPDATE email_logs SET status=sent, sent_at, provider_message_id
    └─ ถ้าล้มเหลว:
        └─ Retry (1m, 5m, 30m)
            ├─ ทุกครั้ง: retry_count += 1
            └─ ครบ 3 ครั้งยังล้มเหลว:
                └─ UPDATE email_logs SET status=failed, error_message

[4] Admin Dashboard
    ├─ GET /admin/email-logs → ดู log ทั้งหมด
    ├─ POST /admin/email-logs/{id}/resend → กดส่งใหม่ทันที (reset retry_count = 0)
    └─ Filter: status, recipient_email, template_name, ช่วงเวลา

[Email Templates ทั้ง 10]
1. verify_email          — หลังสมัคร
2. account_approved      — หลัง Admin approve
3. account_rejected      — หลัง Admin reject + reason
4. account_suspended     — หลัง Admin suspend + reason
5. account_unsuspended   — หลัง Admin unsuspend
6. password_reset        — หลังขอ reset
7. password_changed      — หลัง reset สำเร็จ
8. account_lockout       — หลังบัญชีถูก lock
9. new_dataset_notification — หลัง Dataset publish (ส่งให้ Subscriber)
10. admin_new_registration — แจ้ง Admin มี registration ใหม่
```

---

## #34 · Transaction / Rollback Rules

**ต้องใช้ Transaction เดียวกัน (Atomic)**
1. INSERT `download_logs` + UPDATE `datasets.download_count`
2. INSERT `users` + INSERT `pdpa_consents` (2 rows)
3. INSERT `datasets` + INSERT `dataset_files` + INSERT `dataset_versions` (version 1)
4. UPDATE `users.status` + Background Task (ส่งเมล)
5. Anonymize `users` + ลบ verification_doc + Mask logs

**Rollback Rules**
- ถ้าตัวใดตัวหนึ่งใน Transaction ล้มเหลว → ROLLBACK ทั้งหมด
- Background Task ที่ trigger ไปแล้วต้องไม่กระทบ Transaction หลัก
  (ถ้า task fail → retry, ถ้า Transaction หลัก rollback → task ก็ไม่ run)

**File Upload Rollback**
- Upload ไปยัง MinIO สำเร็จแล้ว แต่ DB INSERT fail
  → ต้องลบไฟล์จาก MinIO ทันที (compensating action)
- ใช้ try/finally เสมอ

---

## #35 · Frontend Route Structure

```
/                                  หน้าแรก
/search                            ค้นหา + Filter
/datasets/{id}                     รายละเอียด Dataset
/datasets/{id}/compare             เปรียบเทียบ
/categories                        รายการหมวด
/categories/{slug}                 หมวดเฉพาะ
/stats                             สถิติภาพรวม
/api-docs                          API Documentation (สไตล์หน่วยงานรัฐ)
/about                             เกี่ยวกับเรา
/privacy                           Privacy Policy
/terms                             Terms of Use
/help                              Help / FAQ
/announcements/{id}                ประกาศ

/login                             เข้าสู่ระบบ
/register                          สมัครเป็น Agency
/verify-email                      ยืนยันอีเมลด้วย token  ← ใหม่
/forgot-password                   ลืมรหัสผ่าน           ← ใหม่
/reset-password                    ตั้งรหัสใหม่           ← ใหม่
/register-status                   เช็คสถานะหลังสมัคร     ← ใหม่

/dashboard                         Dashboard (Agency)
/datasets/new                      อัปโหลด Dataset
/datasets/{id}/edit                แก้ Dataset
/datasets/{id}/versions            ประวัติ Version
/manage/categories                 จัดการหมวดของตัวเอง
/saved                             Bookmark + Subscription + Saved Search
/activity                          Activity Log
/profile                           โปรไฟล์ + Login History
/profile/delete                    ลบบัญชีของฉัน        ← ใหม่

/admin                             Admin Dashboard
/admin/users                       จัดการ User
/admin/users/{id}                  รายละเอียด User
/admin/datasets                    จัดการ Dataset
/admin/categories                  จัดการหมวด + Tag
/admin/announcements               ประกาศ
/admin/pages                       Static Pages
/admin/hero-image                  Hero Image
/admin/audit-logs                  Audit Log
/admin/email-logs                  ดู Email Logs        ← ใหม่
```

**Route Guard**
- `/dashboard`, `/datasets/new`, `/manage/*`, `/saved`, `/activity`, `/profile` → Agency, Admin
- `/admin/*` → Admin เท่านั้น
- `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/register-status` → ทุก role (รวม Visitor)
- ถ้า Visitor พยายามเข้า protected route → redirect ไป `/login`

---

## #36 · Page / Screen List

### Public Pages
- หน้าแรก (Hero, Trending, New Releases, Categories)
- หน้าค้นหา (พร้อม Sidebar Filter)
- รายละเอียด Dataset (Tab: Overview, Preview, API, Versions)
- หน้าหมวดหมู่
- หน้าสถิติ (Custom Dashboard Drag & Drop)
- หน้า API Documentation (สไตล์หน่วยงานรัฐ)
- หน้าประกาศ
- หน้าเกี่ยวกับเรา / Privacy / Terms / Help

### Auth Pages
- Login
- Register (ฟอร์มเดียว scroll ลง: ข้อมูลหน่วยงาน + ผู้ติดต่อ + บัญชี + Consent + Upload Doc)
- Verify Email Result (สำเร็จ / หมดอายุ / ผิด)
- Forgot Password Form
- Reset Password Form
- Register Status (กรอกอีเมล → ดูสถานะ)

### Agency Pages
- Dashboard (สถิติส่วนตัว)
- รายการ Dataset (Tab: Draft / Published)
- สร้าง / แก้ Dataset
- ประวัติ Version
- Bulk Upload Excel
- จัดการหมวดหมู่ของตัวเอง
- Saved (Bookmark / Subscription / Saved Search)
- Activity Log
- Profile (พร้อม Login History + ปุ่มลบบัญชี)
- ลบบัญชีของฉัน (Confirmation Page)

### Admin Pages
- Admin Dashboard (สถิติทั้งระบบ + Download Count กราฟ)
- User Management (Filter: status, role)
- User Detail (พร้อมเอกสารยืนยันตน + ปุ่ม Approve/Reject/Suspend/Unsuspend/Anonymize)
- Dataset Management (ทุก Agency)
- Category + Tag Management
- Announcement Management
- Static Page CMS
- Hero Image Setting
- Audit Log Viewer
- Email Logs Viewer (พร้อม filter + ปุ่ม Resend)

---

## #37 · Component List

### Common
- Button (variants: primary, secondary, danger, ghost)
- Input, Textarea, Select
- Checkbox, Radio, Switch
- Modal, Drawer, Toast, Tooltip
- Spinner, Skeleton Loader
- Table (with sort + pagination)
- Tabs, Accordion
- Badge, Tag, Avatar
- ErrorBoundary, EmptyState
- Pagination
- Breadcrumb
- LanguageSwitcher (TH/EN)

### Auth
- LoginForm
- RegisterForm — ฟอร์มสมัครเดียว (ข้อมูลหน่วยงาน + ผู้ติดต่อ + บัญชี + Consent + Upload Doc)
- VerifyEmailResult — รับ token + แสดงผล
- ForgotPasswordForm
- ResetPasswordForm
- RegisterStatusForm
- **PasswordStrengthIndicator** — แถบ 5 ระดับ + checklist 5 ข้อ
- **ResendEmailButton** — ปุ่ม cooldown 60 วินาที
- **PDPACheckbox** — ติ๊ก 2 ช่อง พร้อม modal อ่านเอกสาร
- **AgencyTypeSelect** — dropdown ประเภทหน่วยงาน
- **VerificationDocUpload** — อัปโหลด PDF + preview + ≤5MB validation
- **AccountLockoutCountdown** — แสดงนับถอยหลัง 15 นาที
- DeleteAccountConfirmation — confirmation 2 ขั้น + กรอกรหัสยืนยัน

### Dataset
- DatasetCard (กฎแสดงวันที่ตาม M5)
- DatasetDetail
- DatasetPreviewTable (100 แถว)
- DownloadModal (purpose + format)
- CitationModal
- VersionHistoryList
- BulkUploadForm
- PIIScanResult (แสดงผลจาก Backend จริง ไม่ใช่ mock)
- QualityScoreCard

### Search
- SearchBar (พร้อม Autocomplete)
- SearchAutocompleteDropdown
- FilterSidebar (หมวด, หน่วยงาน, ปี, format, จังหวัด, license)
- FilterTree (Category 2 ระดับ)
- ResultsList

### Dashboard
- StatsOverviewCard
- TrendingDatasets
- NewReleases
- CustomDashboardWidget (Drag & Drop)
- DownloadCountChart (Admin)

### Admin
- UserListTable
- UserDetailCard
- ApproveRejectForm (พร้อม reason input)
- SuspendForm (พร้อม reason input)
- AnonymizeConfirmation
- DatasetManagementTable
- AuditLogTable
- **LoginHistoryTable**
- **EmailLogsTable** (พร้อม filter + Resend button)
- AnnouncementEditor

---

## #38 · Layout Structure

```
RootLayout (TH/EN + Theme provider)
├── PublicLayout
│   ├── PublicHeader (Logo, Search, Login, Lang switch)
│   ├── <Outlet />
│   └── PublicFooter
│
├── AuthLayout (เฉพาะ /auth/*, /register-status)
│   ├── CenteredCard
│   └── <Outlet />
│
├── AgencyLayout (Guard: Agency, Admin)
│   ├── AgencyHeader (สีฟ้า)  ← Role Color
│   ├── AgencySidebar
│   ├── <Outlet />
│   └── AgencyFooter
│
└── AdminLayout (Guard: Admin)
    ├── AdminHeader (สีม่วง)  ← Role Color
    ├── AdminSidebar
    ├── <Outlet />
    └── AdminFooter
```

**Header แต่ละ Role มีสีต่างกัน** (ดู #41 Design System)
- Visitor (Public) → สีเขียว
- Agency → สีฟ้า
- Admin → สีม่วง

---

## #39 · State Management Strategy

**Server State** — React Query
- ทุก API call ผ่าน React Query เสมอ
- Stale time: 30 วินาทีสำหรับ list, 5 นาทีสำหรับ detail
- Invalidate ตาม mutation ที่ทำ
- Optimistic update สำหรับ Bookmark, Subscribe

**Client State** — Zustand
- Auth store: user, token, role
- UI store: theme, language, sidebar collapsed
- Dashboard layout store: layout (sync กับ API)

**Form State** — React Hook Form + Zod
- ทุก Form ใช้ RHF + Zod
- Validation real-time

**URL State** — Next.js useSearchParams
- ใช้สำหรับ filter, pagination, search query
- Share-able URL

---

## #40 · Form Validation Rules

### Register Form
- email: format ถูก + ไม่ซ้ำในระบบ
- password: ≥ 8 ตัว + ตัวเล็ก + ตัวใหญ่ + ตัวเลข + อักขระพิเศษ
- confirm_password: ตรงกับ password
- agency_name: ≥ 3 ตัว, ≤ 255 ตัว
- agency_name_en: optional, ≤ 255 ตัว
- agency_type: ENUM ที่กำหนด
- agency_code: optional, ตัวเลขล้วน หรือ alphanumeric
- agency_website: optional, format URL ถูก
- contact_name: ≥ 3 ตัว, ≤ 255 ตัว
- contact_position: optional, ≤ 255 ตัว
- contact_phone: format เบอร์ไทย (08X-XXX-XXXX หรือ 0X-XXX-XXXX)
- verification_doc: **บังคับ**, ต้องเป็น PDF, ≤ 5MB
- terms_consent: บังคับติ๊ก
- pdpa_consent: บังคับติ๊ก

### Login Form
- email: format ถูก
- password: ห้ามว่าง

### Forgot Password Form
- email: format ถูก

### Reset Password Form
- new_password: ตาม password policy
- confirm_password: ตรงกับ new_password

### Dataset Upload Form
- title: ≥ 5 ตัว, ≤ 500 ตัว
- description: optional, ≤ 5000 ตัว
- category_id: เลือกหมวด
- license: ENUM
- file: ≤ 100MB, MIME ต้องเป็น CSV/Excel/JSON
- year_start: 1900 ≤ year ≤ ปีปัจจุบัน
- year_end: ≥ year_start
- province: optional

### Account Deletion Form
- confirm_text: ต้องพิมพ์ "ลบบัญชี" ตรงเป๊ะ
- password: บังคับกรอก
- confirm_checkbox: บังคับติ๊ก

---

## #41 · UI Design System

### Role Color System (Quick Win จาก v2)

แต่ละ Role มีสีหลักของตัวเอง — ใช้ใน Header, Sidebar, Badge, Primary Button

```
Visitor → เขียว    (สีเฉดจริงรอ confirm ตอน implement)
Agency  → ฟ้า      (สีเฉดจริงรอ confirm ตอน implement)
Admin   → ม่วง     (สีเฉดจริงรอ confirm ตอน implement)
```

> **หมายเหตุ:** เฉดสีจริง (HEX code) จะกำหนดตอน implement ตามที่ Designer/ผู้ใช้ confirm

### Typography

| ชื่อ | ขนาด | น้ำหนัก | ใช้ทำอะไร |
|---|---|---|---|
| heading-1 | 32px | Bold | หัวข้อหน้าหลัก |
| heading-2 | 24px | Bold | หัวข้อ Section |
| heading-3 | 20px | SemiBold | หัวข้อ Card |
| body-lg | 16px | Regular | เนื้อหาหลัก |
| body-sm | 14px | Regular | เนื้อหารอง |
| caption | 12px | Regular | คำอธิบายเล็ก |
| label | 14px | Medium | Label ใน Form |

- Font หลัก — Sarabun
- Font สำรอง — sans-serif

### Spacing

| ชื่อ | ค่า |
|---|---|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |

### Border Radius

| ชื่อ | ค่า | ใช้ทำอะไร |
|---|---|---|
| sm | 4px | Input, Badge |
| md | 8px | Card, Button |
| lg | 12px | Modal, Dropdown |
| full | 9999px | Tag, Pill |

### Shadow
- sm: subtle (Card)
- md: medium (Hover state)
- lg: prominent (Modal, Dropdown)

### กฎ
- ใช้สีจาก Design System เท่านั้น ห้าม Hardcode สีใน Component
- ใช้ Spacing จาก Design System เท่านั้น
- ใช้ Font Sarabun เสมอ
- ทุก Interactive Element ต้องมี Hover State เสมอ

---

## #42 · Responsive Design Rules

**Breakpoints (Tailwind)**
- sm: 640px (Mobile landscape)
- md: 768px (Tablet)
- lg: 1024px (Laptop)
- xl: 1280px (Desktop)
- 2xl: 1536px (Large Desktop)

**กฎ**
- Mobile-first design เสมอ
- ทุกหน้าต้องใช้งานได้ดีบน mobile (320px ขึ้นไป)
- Sidebar collapse เป็น Hamburger Menu ที่ < md
- Table ใหญ่ → scroll แนวนอนได้ที่ mobile
- Filter Sidebar → กลายเป็น Drawer ที่ mobile
- Modal ขนาดเต็มจอที่ mobile
- Font size ปรับให้อ่านง่ายที่ทุก viewport (ไม่ < 14px)

**Component ที่ต้องตรวจ Responsive**
- Search Filter (Sidebar → Drawer)
- DatasetCard Grid (4 col → 2 → 1)
- Custom Dashboard (Grid responsive)
- Admin Tables (overflow scroll)
- Register Form (responsive layout บน mobile)

---

## #43 · Authentication Rules

**กฎ JWT**
- Token หมดอายุใน 60 นาที กำหนดจาก JWT_EXPIRE_MINUTES
- Token ต้องเก็บใน localStorage บน Frontend
- ทุก Request ที่ต้อง Auth ต้องแนบ Token ใน Header เสมอ
- Token ที่หมดอายุต้อง Login ใหม่เท่านั้น ไม่มี Refresh Token

**กฎ Redis**
- ทุก Token ที่ออกต้องบันทึกลง Redis พร้อม TTL = JWT_EXPIRE_MINUTES
- Logout ต้องลบ Token ออกจาก Redis ทันที
- Suspend ต้องลบ Token ออกจาก Redis ทันที
- ถ้า Token ไม่อยู่ใน Redis ถือว่า Invalid ทันที

**กฎ Password**
- ขั้นต่ำ 8 ตัวอักษร
- มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
- มีตัวเลขอย่างน้อย 1 ตัว
- Hash ด้วย bcrypt ผ่าน passlib เสมอ cost factor ≥ 12

**กฎ Session**
- 1 User มีได้ 1 Token ที่ใช้งานอยู่เท่านั้น
- Login ใหม่ → ลบ Token เดิมออกจาก Redis → ออก Token ใหม่
- Token เก็บใน Redis ด้วย Key รูปแบบ session:{user_id}

**กฎ Status ที่ Login ได้**
- เฉพาะ status = active เท่านั้นที่ Login ได้
- email_unverified → EMAIL_NOT_VERIFIED 403
- pending → ACCOUNT_PENDING 403
- rejected → ACCOUNT_REJECTED 403
- suspended → ACCOUNT_SUSPENDED 403

**กฎ Account Lockout**
- Login fail 5 ครั้งติดต่อกัน → lock 15 นาที
- ระหว่าง lock → ACCOUNT_LOCKED 423
- หลัง lock หมด หรือ login สำเร็จ → reset failed_login_count = 0

**กฎ Frontend**
- ทุก Route ใน (agency) และ (admin) ต้องเช็ค Token ก่อนเสมอ
- ถ้าไม่มี Token → Redirect ไปหน้า /login ทันที
- ถ้า Token หมดอายุ → Redirect ไปหน้า /login พร้อมแจ้ง "กรุณา Login ใหม่"
- ถ้าเป็น Admin เข้าหน้า Agency → Redirect ไปหน้าหลัก
- ถ้าเป็น Agency เข้าหน้า Admin → Redirect ไปหน้าหลัก

---

## #44 · Authorization Rules (RBAC)

**หลักการ**
- ทุก Endpoint ที่ต้อง Auth ต้องมีการเช็ค Role เสมอ
- เช็ค Role ใน Middleware ก่อนถึง Route Handler ทุกครั้ง
- Permission เก็บใน Database ไม่ Hardcode ใน Code

**กฎแต่ละ Role**

Visitor
- เข้าถึงได้เฉพาะ Endpoint ที่ Auth ❌ เท่านั้น

Agency
- เข้าถึงได้เฉพาะ Dataset ของตัวเองเท่านั้น
- แก้ไข/ลบได้เฉพาะ Dataset ของตัวเอง
- ห้ามแก้ไข/ลบ Dataset ของ Agency อื่น
- ห้ามเข้าถึง Endpoint ของ Admin ทุกตัว

Admin
- เข้าถึงได้ทุก Endpoint
- แก้ไข/ลบได้ทุก Dataset รวมของ Agency
- แก้ไขได้ทุก User
- ห้าม Suspend ตัวเอง
- ห้ามลด Role ตัวเองเป็น Agency
- ห้ามลด Admin คนสุดท้ายในระบบ

**การเช็ค Ownership**
```
ตรวจสอบว่า dataset.user_id == current_user.id
→ ไม่ใช่และไม่ใช่ Admin → คืน FORBIDDEN 403
```

**Middleware ลำดับการเช็ค**
```
1. เช็ค Token → ไม่มี/Invalid → 401
2. เช็ค User Status → ไม่ใช่ active → 403
3. เช็ค Role → ไม่มีสิทธิ์ → 403
4. เช็ค Ownership → ไม่ใช่เจ้าของ → 403
5. ผ่านทุกข้อ → ทำงานต่อได้
```

**กฎ Frontend**
- ซ่อน UI Element ที่ User ไม่มีสิทธิ์เสมอ
- การซ่อน UI ไม่ใช่การป้องกันจริง ต้องเช็คสิทธิ์ที่ Backend เสมอ

---

## #45 · File Upload Rules

**กฎไฟล์ Dataset**
- รับเฉพาะ CSV, Excel (.xlsx, .xls), JSON เท่านั้น
- ขนาดไม่เกิน 100MB ต่อไฟล์
- ตรวจสอบประเภทไฟล์จาก MIME Type จริงด้วย python-magic ไม่ใช่แค่นามสกุล
- ห้ามรับไฟล์ที่มีนามสกุลซ้อน เช่น data.csv.exe

**กฎไฟล์เอกสารยืนยันตน (verification_doc)**
- รับเฉพาะ PDF เท่านั้น
- ขนาดไม่เกิน 5MB
- เก็บใน MinIO bucket แยก ชื่อ verification-docs/
- Path ใน MinIO รูปแบบ verification-docs/{user_id}/{uuid}.pdf
- ตรวจ MIME Type จริงด้วย python-magic

**MIME Type ที่รองรับ (Dataset)**
| ประเภทไฟล์ | MIME Type |
|---|---|
| CSV | text/csv |
| Excel | application/vnd.openxmlformats-officedocument.spreadsheetml.sheet |
| Excel เก่า | application/vnd.ms-excel |
| JSON | application/json |

**MIME Type ที่รองรับ (เอกสารยืนยัน)**
| ประเภทไฟล์ | MIME Type |
|---|---|
| PDF | application/pdf |

**กฎการบันทึก**
- บันทึกไฟล์ลง MinIO เท่านั้น ห้ามบันทึกลง Local Disk
- ตั้งชื่อไฟล์ใหม่ด้วย UUID เสมอ ห้ามใช้ชื่อไฟล์เดิม
- Path ใน MinIO Dataset รูปแบบ datasets/{dataset_id}/{uuid}.{ext}

**กฎ Security**
- Scan หา PII ในไฟล์ Dataset ก่อน Save ทุกครั้ง
- Mask PII อัตโนมัติก่อน Save
- ตรวจสอบว่าไฟล์ไม่มี Malicious Content

**กฎ Frontend**
- แสดง Progress Bar ระหว่างอัปโหลด
- แสดง Error ทันทีถ้าไฟล์ไม่ผ่านเงื่อนไข
- ห้าม Upload ซ้ำถ้ากำลัง Upload อยู่

---

## #46 · PII Masking Rules

**PII ที่ต้อง Mask**
| ประเภท | Pattern | ตัวอย่างก่อน Mask | ตัวอย่างหลัง Mask |
|---|---|---|---|
| เลขบัตรประชาชน | 13 หลัก | 1234567890123 | 1XXXXXXXXXXX3 |
| เบอร์โทรศัพท์ | 9-10 หลัก | 0812345678 | 08XXXXXX78 |
| อีเมล | รูปแบบ email | john@email.com | j***@email.com |
| รหัสนักเรียน | ตัวเลข 5-10 หลัก | 12345 | XXXXX |
| ชื่อ-นามสกุล | คอลัมน์ที่ชื่อมีคำว่า ชื่อ/นามสกุล/name | สมชาย ใจดี | สXX ใXX |

**กฎการตรวจจับ**
- ตรวจจับจากชื่อคอลัมน์ — ถ้ามีคำว่า ชื่อ, นามสกุล, เบอร์, โทร, บัตร, รหัส, name, phone, id, email
- ตรวจจับจากค่าในคอลัมน์ — ตรวจจาก Pattern Regex ทุกแถว

**กฎการ Mask**
- Mask ก่อน Save ลง MinIO ทุกครั้ง
- ทุก Role เห็นข้อมูลที่ Mask แล้วเสมอ ไม่มี Role ใดเห็นข้อมูลจริง
- บันทึก Log ว่า Mask คอลัมน์ไหนบ้างใน Audit Log
- ห้ามใช้คอลัมน์ที่ Mask แล้วใน Filter หรือ Search
- แสดงหมายเหตุในหน้า Preview ว่าคอลัมน์ไหนถูก Mask

---

## #47 · Rate Limit Rules

**Rate Limit แต่ละประเภท**
| Endpoint | จำกัด | หน่วย |
|---|---|---|
| ทุก Endpoint | 100 Request | ต่อนาทีต่อ IP |
| POST /auth/login | 5 Request | ต่อนาทีต่อ IP |
| POST /auth/register | 3 Request | ต่อชั่วโมงต่อ IP |
| POST /auth/verify-email | 10 Request | ต่อนาทีต่อ IP |
| POST /auth/resend-verification | 1 Request | ต่อ 60 วินาทีต่อบัญชี |
| POST /auth/forgot-password | 1 Request | ต่อ 60 วินาทีต่อบัญชี |
| POST /auth/reset-password | 5 Request | ต่อนาทีต่อ IP |
| GET /search | 30 Request | ต่อนาทีต่อ IP |
| POST /datasets/{id}/download | 10 Request | ต่อนาทีต่อ IP |
| POST /datasets | 10 Request | ต่อนาทีต่อ IP |
| GET /public/* | 60 Request | ต่อนาทีต่อ IP |

**กฎ**
- นับ Request ต่อ IP เสมอ ไม่ว่าจะ Login หรือไม่
- เกิน Rate Limit → คืน RATE_LIMIT_EXCEEDED 429 ทันที
- เก็บ Counter ใน Redis พร้อม TTL 60 วินาที
- Reset Counter ทุก 60 วินาทีอัตโนมัติ

**Response Header มาตรฐาน**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## #48 · Password Policy

**เงื่อนไขรหัสผ่าน**
- ความยาวขั้นต่ำ 8 ตัวอักษร
- ความยาวสูงสุด 128 ตัวอักษร
- มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว
- มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว
- มีตัวเลขอย่างน้อย 1 ตัว
- มีอักขระพิเศษอย่างน้อย 1 ตัว เช่น !@#$%^&*
- ห้ามใช้ช่องว่าง

**กฎการเก็บ**
- Hash ด้วย bcrypt ผ่าน passlib เสมอ cost factor ≥ 12
- ห้ามเก็บ Password จริงใน Database ทุกกรณี
- ห้าม Log Password ใน Audit Log หรือ Error Log ทุกกรณี

**Password Strength (5 ระดับ)**
| ระดับ | เงื่อนไข |
|---|---|
| 1 อ่อนมาก | ผ่านแค่ความยาวขั้นต่ำ |
| 2 อ่อน | + ตัวพิมพ์ใหญ่หรือตัวเลข |
| 3 ปานกลาง | + ตัวพิมพ์ใหญ่ + ตัวเลข |
| 4 ดี | + อักขระพิเศษ |
| 5 แข็งแกร่ง | ผ่านทุกข้อ + ความยาว ≥ 12 |

**กฎ Frontend**
- แสดง PasswordStrengthIndicator แถบ 5 ระดับ + checklist ทีละข้อ ขณะพิมพ์
- มีปุ่ม Show/Hide Password
- แสดง Error ทันทีถ้าไม่ผ่านเงื่อนไข

---

## #49 · HTTPS / TLS Rules

**กฎหลัก**
- บังคับ HTTPS ทุก Request ทุกกรณี ไม่มีข้อยกเว้น
- HTTP ทุก Request ต้อง Redirect ไป HTTPS อัตโนมัติ
- ใช้ TLS 1.2 ขึ้นไปเท่านั้น
- Certificate ต้อง Renew ก่อนหมดอายุอย่างน้อย 30 วัน

**Security Headers**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
```

**กฎ MinIO**
- ไฟล์ทุกไฟล์ใน MinIO ต้องเข้ารหัสอัตโนมัติ
- ห้าม Expose MinIO URL ตรงๆ ให้ User
- ดาวน์โหลดไฟล์ต้องผ่าน Backend เสมอ

**กฎ CORS**
- อนุญาตเฉพาะ Domain ที่กำหนดใน ALLOWED_ORIGINS เท่านั้น
- ห้ามใช้ * ใน Production เด็ดขาด

---

## #50 · Docker Structure

**Services ทั้งหมด**
| Service | Image | Port | หมายเหตุ |
|---|---|---|---|
| frontend | Node.js 20 Alpine | 3000 | Next.js 14 |
| backend | Python 3.11 Slim | 8000 | FastAPI |
| postgres | PostgreSQL 15 | 5432 | Database หลัก |
| redis | Redis 7 Alpine | 6379 | Cache + Session |
| minio | MinIO Latest | 9000, 9001 | File Storage |
| elasticsearch | Elasticsearch 8 | 9200 | Search Engine |
| nginx | Nginx Alpine | 80, 443 | Reverse Proxy |

**โครงสร้างไฟล์**
```
datacatalog/
├── docker-compose.yml
├── docker-compose.staging.yml
├── docker-compose.prod.yml
└── docker/
    ├── frontend.dockerfile
    ├── backend.dockerfile
    └── nginx/
        ├── nginx.conf
        ├── dev.conf
        ├── staging.conf
        └── prod.conf
```

**กฎ**
- ทุก Service ต้องอยู่ใน Docker Network ชื่อ datacatalog_network
- ห้าม Expose Port Database, Redis, MinIO, Elasticsearch ตรงๆ ใน Production
- ใน Production Expose เฉพาะ Port 80 และ 443 ผ่าน Nginx
- ทุก Service ต้องมี Health Check
- ทุก Service ต้องมี Restart Policy unless-stopped
- Data ต้องเก็บใน Volume เสมอ

**Volume**
```
volumes:
  postgres_data
  redis_data
  minio_data
  elasticsearch_data
```

---

## #51 · Environment Separation

| | Dev | Staging | Production |
|---|---|---|---|
| ข้อมูล | Mock Data | ข้อมูลจำลอง | ข้อมูลจริง |
| Docker Compose | docker-compose.yml | docker-compose.staging.yml | docker-compose.prod.yml |
| ENV File | .env | .env.staging | .env.prod |
| Debug Mode | ✅ | ❌ | ❌ |
| HTTPS | ❌ | ✅ | ✅ |
| Rate Limit | ❌ | ✅ | ✅ |
| Swagger UI | ✅ | ✅ | ❌ |
| Email Provider | Mailtrap | Mailtrap | Brevo |
| ส่งเมลจริง | ❌ | ❌ | ✅ |

**กฎเหล็ก**
- Mock Data ห้ามเข้า Production เด็ดขาด
- ENV File ของ Production ห้าม Commit ลง Git เด็ดขาด
- ห้าม Connect Production Database จาก Dev หรือ Staging
- ทุก Feature ต้องผ่าน Staging ก่อน Deploy Production เสมอ
- Database แต่ละ Environment ต้องแยกกันเด็ดขาด

**ENV File**
```
.env              # Dev — Commit ได้ แต่ห้ามใส่ค่าจริง
.env.staging      # Staging — ห้าม Commit
.env.prod         # Production — ห้าม Commit
.env.example      # ตัวอย่าง ENV — Commit ได้
```

---

## #52 · Backup Strategy

| สิ่งที่ Backup | วิธี | ความถี่ | เก็บนานแค่ไหน |
|---|---|---|---|
| PostgreSQL | pg_dump | ทุกวัน เวลา 02:00 น. | 7 วัน |
| MinIO | MinIO Snapshot | ทุกวัน เวลา 03:00 น. | 7 วัน |
| Elasticsearch | Snapshot API | ทุกวัน เวลา 04:00 น. | 7 วัน |
| ENV Files | Manual | ทุกครั้งที่แก้ไข | ตลอดไป |

> **หมายเหตุ:** email_logs อยู่ใน PostgreSQL จึง Backup พร้อมกัน — ไม่ต้อง Backup แยก

**กฎ**
- Backup ต้องเก็บแยกออกจาก Server หลักเสมอ
- Backup ต้องเข้ารหัสก่อนเก็บทุกครั้ง
- ทดสอบ Restore จาก Backup อย่างน้อยเดือนละ 1 ครั้ง
- แจ้งเตือนทาง Email ถ้า Backup ล้มเหลว
- Redis ไม่ต้อง Backup เพราะเป็นแค่ Cache และ Session

**ที่เก็บ Backup**
- Dev — Local
- Staging — Railway Volume
- Production — Railway Volume + AWS S3

---

## #53 · Restore Procedure

**กรณีที่ 1 — Container พัง**
```
1. SSH เข้า Server
2. docker compose restart
3. รอ Health Check ผ่านทุก Service
4. ใช้เวลาไม่เกิน 5 นาที
```

**กรณีที่ 2 — PostgreSQL หาย**
```
1. docker compose stop backend
2. dropdb datacatalog
3. createdb datacatalog
4. pg_restore -d datacatalog backup_latest.dump
5. docker compose start backend
6. ใช้เวลาไม่เกิน 1 ชั่วโมง
```

**กรณีที่ 3 — ไฟล์ใน MinIO หาย**
```
1. docker compose stop backend
2. Restore MinIO จาก Snapshot ล่าสุด
3. docker compose start backend
4. ใช้เวลาไม่เกิน 1 ชั่วโมง
```

**กรณีที่ 4 — Elasticsearch Index หาย**
```
1. Restore Elasticsearch จาก Snapshot ล่าสุด
2. ถ้า Snapshot หายด้วย → Re-index ใหม่ทั้งหมดจาก PostgreSQL
3. ใช้เวลาไม่เกิน 2 ชั่วโมง
```

**กฎ**
- ต้อง Backup Database ก่อน Restore ทุกครั้ง
- ทดสอบใน Staging ก่อน Restore Production เสมอ
- บันทึก Log ทุกขั้นตอนระหว่าง Restore
- แจ้ง User ล่วงหน้าก่อน Restore Production

---

## #54 · CI/CD Flow

**Branch Strategy**
| Branch | ใช้ทำอะไร | Deploy ไปที่ไหน |
|---|---|---|
| main | โค้ดที่ผ่านการทดสอบแล้ว | Production |
| staging | โค้ดที่รอทดสอบก่อน Deploy | Staging |
| develop | โค้ดที่กำลังพัฒนา | Dev |
| feature/* | Feature ใหม่ | ไม่ Deploy |
| hotfix/* | แก้ Bug เร่งด่วน | Production |

**CI Flow**
```
1. Run Linter → ไม่ผ่าน → Block Merge
2. Run Unit Tests → ไม่ผ่าน → Block Merge
3. Build Docker Image → ไม่สำเร็จ → Block Merge
4. ผ่านทุกข้อ → อนุญาตให้ Merge ได้
```

**CD Flow — Staging**
```
1. Merge เข้า staging branch
2. Build Docker Image ใหม่
3. Push Image ไป Registry
4. Deploy ไป Staging อัตโนมัติ
5. Run Health Check → ไม่ผ่าน → Rollback อัตโนมัติ
6. แจ้ง Email ว่า Deploy สำเร็จหรือล้มเหลว
```

**CD Flow — Production**
```
1. Merge เข้า main branch
2. Backup Database อัตโนมัติก่อน Deploy
3. Build Docker Image ใหม่
4. Push Image ไป Registry
5. อนุมัติ Deploy Production
6. Deploy ไป Production
7. Run Health Check → ไม่ผ่าน → Rollback อัตโนมัติ
8. แจ้ง Email ว่า Deploy สำเร็จหรือล้มเหลว
```

**กฎ**
- ห้าม Push ตรงไป main หรือ staging ต้อง Merge ผ่าน Pull Request เสมอ
- Deploy Production ต้องมีคนอนุมัติก่อนเสมอ ไม่ Auto Deploy
- ถ้า Deploy ล้มเหลว Rollback กลับ Version เดิมอัตโนมัติ

---

## #55 · Monitoring & Logging Strategy

**Log ที่ต้องเก็บ**
| ประเภท | เก็บอะไร | เก็บที่ไหน |
|---|---|---|
| Application Log | ทุก Request, Response, Error | ไฟล์ Log + Console |
| Audit Log | ทุก Action ของ User | PostgreSQL audit_logs |
| Download Log | ทุกการดาวน์โหลด | PostgreSQL download_logs |
| Email Log | ทุกการส่งเมล สถานะ Retry | PostgreSQL email_logs |
| Error Log | ทุก Exception | ไฟล์ Log + Console |
| Access Log | ทุก HTTP Request | Nginx Log |

**Log Format มาตรฐาน**
```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "ERROR",
  "service": "backend",
  "message": "Dataset not found",
  "user_id": "uuid",
  "ip_address": "1.2.3.4",
  "endpoint": "/api/v1/datasets/uuid",
  "error_code": "DATASET_NOT_FOUND"
}
```

**Log Level**
| Level | ใช้เมื่อไหร่ |
|---|---|
| DEBUG | Debug เฉพาะ Dev |
| INFO | การทำงานปกติ |
| WARNING | เหตุการณ์ผิดปกติแต่ยังทำงานได้ |
| ERROR | Error ที่ต้องแก้ไข |
| CRITICAL | ระบบล่ม ต้องแก้ทันที |

**Monitoring**
| สิ่งที่ Monitor | แจ้งเตือนเมื่อ |
|---|---|
| CPU Usage | เกิน 80% |
| Memory Usage | เกิน 80% |
| Disk Usage | เกิน 80% |
| API Response Time | เกิน 2 วินาที |
| Error Rate | เกิน 1% ของ Request ทั้งหมด |
| Health Check | Service ใดล้ม |
| Email Bounce Rate | เกิน 5% |
| Email Spam Complaint Rate | เกิน 0.1% |

**กฎ**
- Log ทุก Error ที่เกิดขึ้นเสมอ ไม่มีข้อยกเว้น
- ห้าม Log Password, Token, PII ใดๆ ทุกกรณี
- Log ใน Production เก็บอย่างน้อย 30 วัน
- ถ้าเกิด CRITICAL แจ้ง Email ทันที

---

## #56 · AI Coding Rules

**กฎหลัก**
- AI ต้องอ่าน Spec ทั้งหมดก่อนเขียนโค้ดทุกครั้ง
- AI ต้องเขียนโค้ดตาม Tech Stack ที่กำหนดใน #8 เท่านั้น
- AI ต้องเขียนโค้ดตาม Folder Structure ที่กำหนดใน #7 เท่านั้น
- AI ต้องตั้งชื่อตาม Naming Convention ที่กำหนดใน #6 เท่านั้น
- AI ห้ามเพิ่ม Library ใหม่โดยไม่ได้รับอนุญาต

**กฎ Backend**
- ทุก Route ต้องแยก Logic ออกไปไว้ใน Service เสมอ
- ทุก Database Query ต้องอยู่ใน Repository เสมอ
- ทุก Endpoint ต้องมี Pydantic Schema สำหรับ Request และ Response
- ทุก Endpoint ต้องมีการเช็ค Permission ก่อนทำงานเสมอ
- ทุก Response ต้องใช้ JSend Format ที่กำหนดใน #10
- ทุก Error ต้องใช้ Error Code จาก #24 เสมอ
- ห้ามเขียน Raw SQL ยกเว้นกรณีที่ ORM ทำไม่ได้จริงๆ

**กฎ Frontend**
- ทุก API Call ต้องใช้ React Query เสมอ
- ทุก Form ต้องใช้ React Hook Form + Zod เสมอ
- ทุก Global State ต้องใช้ Zustand เสมอ
- ทุก Component ต้องใช้สีและ Spacing จาก Design System #41 เสมอ
- ทุก Page ต้องใช้ Layout ที่กำหนดใน #38 เสมอ
- ห้าม Hardcode ข้อความภาษาไทยหรืออังกฤษใน Component ให้ใช้ next-intl เสมอ

**กฎ Database**
- ทุกตารางใหม่ต้องมี created_at เสมอ
- ทุกการเปลี่ยนแปลง Database ต้องทำผ่าน Alembic เสมอ
- ห้ามลบ Column ให้ Deprecate แทน
- ใช้ Soft Delete เสมอสำหรับตารางที่กำหนดใน #15

**กฎ Security**
- ทุก Input ต้องผ่าน Validate ก่อนเข้า Database เสมอ
- ห้าม Log Password หรือ Token ทุกกรณี
- ทุกไฟล์ที่อัปโหลดต้องผ่าน PII Scan ก่อน Save เสมอ
- ตรวจ MIME Type ด้วย python-magic เสมอ ไม่เชื่อแค่นามสกุล

---

## #57 · AI Refactor Rules

**กฎหลัก**
- AI ห้าม Refactor โค้ดที่ไม่ได้รับคำสั่งให้ Refactor
- AI ห้ามแก้ไข Feature เดิมระหว่าง Refactor เด็ดขาด
- AI ต้องบอกให้ชัดว่าแก้ไขอะไรบ้างก่อน Refactor ทุกครั้ง
- AI ต้องรักษา Behavior เดิมทุกอย่างหลัง Refactor

**สิ่งที่ทำได้**
- เปลี่ยนชื่อ Variable/Function ให้ตรงตาม Naming Convention
- แยก Function ที่ยาวเกินไปออกเป็น Function ย่อย
- ย้ายโค้ดไปไว้ในที่ที่ถูกต้องตาม Folder Structure
- ลบโค้ดที่ไม่ได้ใช้แล้ว
- เพิ่ม Type Annotation ที่ขาดหายไป

**สิ่งที่ห้ามทำ**
- ห้ามเปลี่ยน Business Logic
- ห้ามเปลี่ยน API Response Format
- ห้ามเปลี่ยนชื่อ API Endpoint
- ห้ามเปลี่ยนชื่อ Database Column
- ห้ามเพิ่ม Library ใหม่
- ห้ามเปลี่ยน Database Schema

**ขั้นตอน**
```
1. บอกว่าจะ Refactor อะไร และทำไม
2. บอกว่าอะไรจะเปลี่ยน อะไรจะไม่เปลี่ยน
3. Refactor ทีละส่วนเล็กๆ
4. ตรวจสอบว่า Behavior เดิมยังทำงานได้ปกติ
5. บอกสรุปว่าแก้ไขอะไรไปบ้าง
```

---

## #58 · AI Dependency Rules

- ห้ามเพิ่ม Library ใหม่โดยไม่ได้รับอนุญาตจากเจ้าของโปรเจกต์
- ทุกครั้งที่จะเพิ่ม Library ต้องบอกก่อนว่าเพิ่มอะไร เพราะอะไร และมีทางเลือกอื่นไหม
- ห้ามเพิ่ม Library ที่ทำสิ่งเดียวกับที่มีอยู่แล้ว
- ห้ามเพิ่ม Library ที่ไม่มี Maintenance หรือหยุดพัฒนาแล้ว
- ทุก Library ใหม่ต้องเข้ากันได้กับ Version ของ Tech Stack ที่กำหนดไว้

**Library ที่เพิ่มใหม่ใน v3 (อนุมัติแล้ว)**
| Library | เหตุผล |
|---|---|
| fastapi-mail | ส่ง Email ผ่าน SMTP ใน FastAPI |
| python-magic | ตรวจ MIME Type จริงจาก Magic Bytes |
| APScheduler | Cron Job ใน process เดียวกับ FastAPI |

---

## #59 · AI Output Format Rules

- AI ต้องบอกชื่อไฟล์และ Path ก่อนแสดงโค้ดทุกครั้ง
- AI ต้องแสดงโค้ดทั้งไฟล์เสมอ ห้ามแสดงแค่บางส่วน
- AI ต้องบอกว่าโค้ดนี้เกี่ยวข้องกับ Feature ไหน Module ไหน
- AI ต้องบอกขั้นตอนการใช้งานหลังแสดงโค้ดทุกครั้ง
- ถ้าโค้ดเกี่ยวข้องกับหลายไฟล์ต้องแสดงทีละไฟล์ให้ครบ

**รูปแบบการแสดงโค้ด**
```
# ไฟล์: backend/app/api/v1/routers/auth_router.py
# Module: M1 Auth
# Feature: Email Verification

<โค้ด>

# ขั้นตอนการใช้งาน
1. ...
2. ...
```

---

## #60 · AI File Structure Rules

- AI ต้องสร้างไฟล์ตาม Folder Structure ที่กำหนดใน #7 เสมอ
- AI ห้ามสร้างไฟล์นอก Folder Structure ที่กำหนด
- AI ต้องตั้งชื่อไฟล์ตาม Naming Convention ที่กำหนดใน #6 เสมอ
- AI ต้องบอก Path เต็มของไฟล์ทุกครั้งที่สร้างหรือแก้ไข
- ถ้าต้องสร้าง Folder ใหม่ต้องบอกก่อนว่าสร้างที่ไหนและทำไม

**ตัวอย่าง Path ที่ถูกต้อง**
```
backend/app/api/v1/routers/auth_router.py
backend/app/services/auth_service.py
backend/app/services/email_service.py
backend/app/repositories/user_repository.py
backend/app/schemas/auth_schema.py
backend/app/workers/cleanup_worker.py
backend/app/email_templates/verify_email.html
frontend/src/components/auth/RegisterForm.tsx
frontend/src/components/auth/PasswordStrengthIndicator.tsx
```

---

## #61 · README Structure

```
# Datacatalog

## ภาพรวมระบบ
## Tech Stack
## โครงสร้างโปรเจกต์
## การติดตั้ง (Dev)
  - Requirements
  - Clone โปรเจกต์
  - ตั้งค่า ENV
  - รัน Docker Compose
  - รัน Migration
  - รัน Seed Data
## การใช้งาน
  - URL ที่สำคัญ
  - บัญชีทดสอบ
## API Documentation
## การ Deploy
## การ Backup และ Restore
## การแก้ไขปัญหาที่พบบ่อย
```

---

## #62 · API Documentation Rules

- ทุก Endpoint ต้องมี Docstring อธิบายการทำงาน
- ทุก Endpoint ต้องมีตัวอย่าง Request และ Response จริง
- ทุก Endpoint ต้องระบุ Error Code ที่อาจเกิดขึ้น
- Swagger UI เปิดได้เฉพาะ Dev และ Staging เท่านั้น ปิดใน Production
- ทุกครั้งที่เพิ่มหรือแก้ไข Endpoint ต้องอัปเดต Docs ด้วยเสมอ

**รูปแบบ Docstring**
```python
@router.post("/auth/verify-email")
async def verify_email():
    """
    ยืนยันอีเมลด้วย Token จากลิงก์ในเมล

    - **Required Role**: ไม่ต้อง Login
    - **Request**: { token: str }
    - **Response**: { message: "email verified" }
    - **Errors**: TOKEN_INVALID, TOKEN_EXPIRED, TOKEN_ALREADY_USED
    """
```

---

## #63 · Architecture Documentation

**เอกสารที่ต้องมี**
- ภาพรวม Layered Architecture ทั้งระบบ
- การไหลของข้อมูลจาก Frontend → Backend → Database
- การเชื่อมต่อระหว่าง Service ทุกตัว
- เหตุผลที่เลือก Tech Stack แต่ละตัว
- ข้อจำกัดและ Trade-off ของระบบ

**โครงสร้างภาพรวม**
```
Frontend (Next.js)
    ↓ HTTPS
Nginx (Reverse Proxy)
    ↓
Backend (FastAPI)
    ↓           ↓           ↓           ↓
PostgreSQL   Redis       MinIO    Elasticsearch
                              ↑
                        verification-docs/ (bucket แยก)
```

---

## #64 · Sequence Diagrams

**Diagram ที่ต้องมี**
- Register + Email Verification Flow
- Login Flow (รวม Lockout)
- Forgot Password / Reset Password Flow
- Upload Dataset Flow
- Dataset Publish Workflow
- Search Flow
- Download Flow
- Notification (Email) Flow
- Self-Delete (Anonymize) Flow

**ตัวอย่าง Register Flow**
```
User → Frontend → Backend → DB → Email(Mailtrap/Brevo)
  กรอกฟอร์ม + อัปโหลดเอกสาร
              POST /auth/register
                        INSERT users (email_unverified)
                        INSERT pdpa_consents (2 rows)
                        Upload doc → MinIO
                        Background Task:
                                      ส่ง Email Verification
              คืน success
  แสดง "ส่ง email แล้ว"
                                                   ผู้ใช้คลิกลิงก์
              POST /auth/verify-email { token }
                        UPDATE users status=pending
                        Background Task: แจ้ง Admin
              คืน success
  แสดง "ยืนยันอีเมลแล้ว รอ Admin"
```

---

## #65 · Deployment Documentation

**ขั้นตอน Deploy Staging**
```
1. Merge Code เข้า staging branch
2. CI ทำงานอัตโนมัติ
3. ตรวจสอบ CI ผ่านทุกข้อ
4. CD Deploy ไป Staging อัตโนมัติ
5. ทดสอบบน Staging
6. แจ้งทีมว่าพร้อม Deploy Production
```

**ขั้นตอน Deploy Production**
```
1. Merge Code เข้า main branch
2. CI ทำงานอัตโนมัติ
3. ตรวจสอบ CI ผ่านทุกข้อ
4. อนุมัติ Deploy Production
5. Backup Database อัตโนมัติ
6. CD Deploy ไป Production
7. ตรวจสอบ Health Check
8. แจ้ง User ว่าระบบพร้อมใช้งาน
```

**Brevo SMTP Setup (ก่อน Deploy Production)**
```
1. สมัคร Brevo (ฟรี 300 emails/วัน)
2. ยืนยัน Domain ใน Brevo Dashboard
3. เพิ่ม DNS Records:
   - SPF: TXT record "v=spf1 include:spf.brevo.com ~all"
   - DKIM: CNAME record จาก Brevo
   - DMARC: TXT record "v=DMARC1; p=quarantine"
4. รับ SMTP Credentials จาก Brevo
5. ใส่ใน .env.prod
6. ทดสอบส่ง Email ทุก Template ก่อน Go-Live
```

**กฎ**
- Deploy Production ได้เฉพาะวันจันทร์ถึงศุกร์ เวลา 09:00-17:00 เท่านั้น
- ห้าม Deploy Production วันศุกร์หลัง 15:00
- ต้องมีคนดูแลระบบอยู่ด้วยทุกครั้งที่ Deploy Production

---

## #66 · Disaster Recovery Documentation

**แผนรับมือแต่ละกรณี**
| กรณี | เวลาที่ยอมรับได้ | วิธีแก้ |
|---|---|---|
| Container พัง | 5 นาที | Restart Container |
| Database ล้ม | 30 นาที | Restart + ตรวจสอบ Data |
| ข้อมูลหาย | 1 ชั่วโมง | Restore จาก Backup |
| Server ล้มทั้งหมด | 2 ชั่วโมง | Deploy ใหม่บน Server ใหม่ |
| ถูก Hack | ทันที | ปิดระบบ + ตรวจสอบ + แจ้ง User |

**ขั้นตอนเมื่อระบบมีปัญหา**
```
1. ตรวจสอบว่าปัญหาคืออะไร
2. ประเมินความรุนแรง
3. แจ้งทีมและ User ทันที ภายใน 15 นาที
4. แก้ไขตาม Restore Procedure #53
5. ตรวจสอบว่าระบบกลับมาปกติ
6. เขียน Post-mortem
```

**Pre-Deploy Tests (ทำก่อน Deploy Production)**

Phase 10.1 — E2E Security Test
- Broken Access Control: ทดสอบว่า Agency เข้า route ของ Agency อื่นไม่ได้
- IDOR: ทดสอบว่า user_id ใน URL ไม่สามารถเข้าถึงข้อมูลคนอื่น
- JWT Tampering: ทดสอบว่า Token ที่แก้ไขถูก Reject
- SQL Injection: ทดสอบ Input ทุกช่องด้วย payload ทั่วไป
- XSS: ทดสอบ Input ที่แสดงผลใน UI

Phase 10.2 — Load Test (k6)
- 50 users พร้อมกัน
- 100 users พร้อมกัน
- 500 users พร้อมกัน
- Response Time ต้องไม่เกิน 2 วินาที

Phase 10.3 — Disaster Recovery Test
- Database Restore: Restore จาก Backup ล่าสุด ตรวจว่าข้อมูลครบ
- MinIO Restore: Restore ไฟล์จาก Snapshot ตรวจว่าดาวน์โหลดได้
- Elasticsearch Rebuild: Re-index จาก PostgreSQL ตรวจว่าค้นหาได้

**กฎ**
- ต้องมี Post-mortem ทุกครั้งที่ระบบล่มเกิน 30 นาที
- แจ้ง User ภายใน 15 นาทีหลังพบปัญหา
- บันทึกทุกเหตุการณ์ที่เกิดขึ้นใน Incident Log

---
