# Gap Report — Thai EduData Insight vs claude-v3.md

> **Audit date:** 2026-06-09  
> **Spec:** `claude-v3.md` (Release 1 / v1)  
> **Codebase:** `backend/`, `frontend/`  
> **Method:** Static code review — ไม่มีการแก้ไขโค้ด

---

## สรุปภาพรวม

| หมวด | ✅ ตรง Spec | ⚠️ ตรงบางส่วน | ❌ ขัดแย้ง | ยังไม่มีเลย (กลุ่ม B) |
|---|---:|---:|---:|---:|
| Auth & User (M1) | 4 | 8 | 5 | 12+ endpoints/flows |
| Dataset (M2) | 6 | 4 | 2 | — |
| Search (M3) | 2 | 4 | 0 | 1 (format filter backend) |
| Download (M4) | 3 | 0 | 0 | — |
| Admin (M6) | 5 | 2 | 1 | 3 |
| Database (#11–#19) | 1 | 2 | 2 | 11 migrations |
| Security (#43–#49) | 2 | 3 | 2 | 1 (python-magic) |
| Frontend Routes (#35) | 2 | 0 | 1 | 6 routes |
| UI Components (#37, #40) | 1 | 2 | 0 | 10+ components |
| Email System (M9) | 0 | 1 | 1 | ทั้ง module |

**ข้อสังเกตสำคัญ:** โค้ดปัจจุบันสอดคล้องกับ `CLAUDE.md` (legacy spec) มากกว่า `claude-v3.md` โดยเฉพาะ Auth flow (pending ทันทีหลัง register, ไม่มี email verification) และ Register form แบบย่อ

---

## กลุ่ม A: มีใน Code แต่ต้องตรวจ

### ✅ ตรง Spec

#### Auth & User (#5 M1, #28, #43)
- **Login / Logout พื้นฐาน** — `POST /auth/login`, `POST /auth/logout`, JWT + Redis session (`backend/app/services/auth_service.py`, `backend/app/core/security.py`)
- **Login ได้เฉพาะ `active`** — block pending/rejected/suspended (`auth_service.py` L92–99)
- **Admin Approve** — `POST /admin/users/{id}/approve` เปลี่ยน status → active + ส่ง email (`admin_service.py`, `admin_router.py`)
- **Admin Reject บังคับ reason (Backend)** — `UserRejectRequest.reason` min 10 chars (`admin_schema.py` L37–38); Frontend `RejectUserModal.tsx` บังคับ reason ≥ 10 ตัว
- **Admin Suspend endpoint มี** — `POST /admin/users/{id}/suspend` + ลบ Redis session (`admin_router.py` L222–235)
- **ป้องกัน Admin suspend ตัวเอง** — `USER_CANNOT_SUSPEND_SELF` (`admin_service.py` L112–113)
- **ป้องกัน Admin คนสุดท้ายลด role** — `count_active_admins` check (`admin_service.py` L181–184)
- **ป้องกัน Admin เปลี่ยน role / ลบ ตัวเอง** — `CANNOT_CHANGE_OWN_ROLE`, `USER_CANNOT_DELETE_SELF`

#### Dataset (#5 M2, #29, #30)
- **ES Index ตอน upload + publish** — `index_dataset` เมื่อ status = published (`dataset_service.py` L272–276)
- **ES Delete หลัง soft delete** — `delete_dataset_index` ใน `delete_dataset()` และ `hide_dataset()` (`dataset_service.py` L597–602, L354–355)
- **PII Masking หลัก** — national ID, phone, email, column-name detection, mask ก่อน MinIO (`pii_masking.py`, `dataset_service.py`)
- **Version History** — สร้าง version ตอน upload/PATCH, GET `/datasets/{id}/versions`, POST restore (`dataset_service.py`, `dataset_router.py`)
- **Quality Score API** — คำนวณตอน upload + `GET /datasets/{id}/quality-score` (`quality_score.py`, `dataset_router.py` L380–393)
- **Draft / Published workflow ตอน upload** — Agency เลือก draft หรือ publish (`dataset_service.py` L236–248)

#### Search (#5 M3, #31)
- **Search API + filter-only** — `GET /search` รองรับ keyword ≥ 2 หรือ filter-only (`search_service.py` L117–124)
- **Autocomplete Backend** — `GET /search/autocomplete` min 2 chars, max 10 (`search_router.py`, `search_service.py`)
- **PyThaiNLP tokenization** — `_tokenize_thai()` ใน search service

#### Download (#32)
- **Purpose บังคับ** — `purpose: str = Query(...)` + min 10 chars (`download_router.py`, `download_service.py` L115–121)
- **Transaction download_log + download_count** — INSERT + UPDATE + commit/rollback ใน function เดียว (`download_service.py` L181–194)
- **UTF-8 BOM สำหรับ CSV** — `b"\xef\xbb\xbf"` + `charset=utf-8-sig` (`download_service.py` L139–143)

#### Admin (#5 M6, #20)
- **Admin Dashboard + Download Count กราฟ** — `AdminDownloadChart.tsx` เรียก `GET /admin/stats/monthly` จริง (`frontend/src/hooks/useAdminMonthlyStats.ts`)
- **Audit Log viewer** — `/admin/audit-logs` + `AuditLogTable.tsx`

#### Security (#43–#49)
- **CORS ใช้ ALLOWED_ORIGINS จาก .env** — `settings.cors_allowed_origins` ใน `main.py`; production block `*` (`config.py` L54–75)
- **bcrypt ผ่าน passlib** — `CryptContext(schemes=["bcrypt"])` (`security.py` L21)

#### Frontend Routes (#35)
- **Login / Register มี** — `(auth)/login/page.tsx`, `(auth)/register/page.tsx` (path เป็น `/login`, `/register` ไม่ใช่ `/auth/*`)

#### UI Components (#37, #40)
- **RegisterForm เป็นฟอร์มเดียว** — ไม่มี multi-step wizard (`RegisterForm.tsx`)

---

### ⚠️ ตรงบางส่วน (ขาด)

| รายการ | ที่อยู่ใน Code | สิ่งที่ขาด | Spec อ้างอิง |
|---|---|---|---|
| **Register flow** | `RegisterRequest`: agency_name, email, password, pdpa_version (`auth_schema.py`); Frontend `RegisterForm.tsx` | ไม่มี agency_name_en, agency_type, agency_code, agency_website, contact_*, verification_doc (PDF ≤5MB), terms_consent แยกจาก pdpa; Backend ไม่รับ multipart | #5 M1 Register Flow, #40 Register Form |
| **PDPA Consent** | 1 row ใน `pdpa_consents` ตอน register (`auth_service.py` L61–66) | ไม่มี `consent_type` (terms/pdpa); ไม่มี 2 rows; ไม่มี `terms_accepted_at` / `pdpa_accepted_at` แยก | #5 M1 PDPA, #12 pdpa_consents |
| **Status flow** | Register → `pending` ทันที (`auth_repository.py`) | ไม่มีขั้น `email_unverified`; ไม่มี `email_verified_at` | #5 M1 Status Flow |
| **Admin Approve audit + email template** | ส่ง email approve ผ่าน smtplib plain text | ไม่บันทึก audit_log; ไม่ใช้ fastapi-mail / HTML template | #5 M1 Admin Approve, #9 M9 |
| **Admin Suspend** | `POST /admin/users/{id}/suspend` ทำงาน | ไม่บังคับ reason; ไม่เก็บ `suspended_reason`; Frontend `SuspendUserModal` ไม่มีช่อง reason; ไม่ส่ง email/audit | #5 M1 Admin Suspend, #20 |
| **Admin Unsuspend** | Frontend `useUnsuspendUser` ใช้ `PATCH /admin/users/{id}` status=active | ไม่มี `POST /admin/users/{id}/unsuspend`; ไม่ส่ง email; ไม่บันทึก audit | #5 M1, #20 L1403 |
| **Rate Limit Auth** | Register 3 req/min (`middleware.py` L48–49) | Login ไม่อยู่ใน rules; Register spec บอก 3/ชั่วโมง; ไม่มี resend/forgot limits; Dev ปิด rate limit ทั้งระบบ | #5 M1 Rate Limit, #47 |
| **bcrypt cost factor** | passlib default rounds | `BCRYPT_COST_FACTOR=12` ใน `.env` แต่ไม่ถูกอ่านใน `config.py` / `hash_password()` | #8 M8 Security |
| **MIME validation** | เช็ค `UploadFile.content_type` + block double extension (`dataset_service.py` L52–65) | ไม่ใช้ `python-magic`; ไม่ตรวจ magic bytes | #45, #8 M8 |
| **PII Masking pattern** | `_mask_name`, `_mask_student_id` มี | รูปแบบ mask ไม่ตรงตัวอย่าง spec (`สXX ใXX`, `XXXXX` fixed) | #46 |
| **ES Re-index หลัง PATCH** | `update_dataset()` commit สำเร็จ | ไม่เรียก `index_dataset`; `background_tasks`/`es_client` ไม่ถูกใช้ | #5 M3, #30 |
| **ES Index หลัง Bulk Upload** | `bulk_upload()` publish ทุก row | ไม่ index ES แม้รับ `es_client` parameter | #5 M3 |
| **ES Index หลัง Publish draft** | `publish_dataset_directly()` รองรับ ES | Router `POST /datasets/{id}/publish` ไม่ส่ง `es_client` → ไม่ index | #30 |
| **ES Re-index หลัง Restore Version** | `restore_version()` สร้าง version ใหม่ | ไม่ update ES | #30 |
| **Filter Sidebar (Frontend)** | `SearchFilter.tsx`, `FilterTree.tsx` | ใช้ `MOCK_FILTER_CATEGORIES/AGENCIES/YEARS/FORMATS` จาก `mockData.ts`; `useCategories` มีแต่ไม่ใช้ใน filter | #5 M3, #31 |
| **Filter ส่งไป API (Frontend)** | ส่ง `category_id`, `tag`, `license`, `province` (`SearchResult.tsx`) | ไม่ส่ง `agency_user_id`, `year`; mock agency ID เป็น slug ไม่ใช่ UUID | #31 |
| **Filter `format` (Backend + Frontend)** | UI มี checkbox format จาก mock | Backend `ALLOWED_FILTER_KEYS` ไม่มี `format`; Frontend ไม่ส่ง | #37 FilterSidebar |
| **Autocomplete UI** | Backend endpoint พร้อม | Frontend ไม่เรียก `/search/autocomplete`; SearchBar เป็น plain input | #31, #37 SearchBar |
| **PasswordStrengthIndicator** | Inline logic 4 ระดับใน `RegisterForm.tsx` | ไม่มี component แยก; ไม่มี 5 ระดับ; ไม่มี checklist 5 ข้อ | #37, #40, #48 |
| **PDPACheckbox** | checkbox `pdpa_consent` เดียว | ไม่มี `terms_consent`; ไม่มี modal อ่านเอกสาร | #37, #40 |
| **Email การแจ้งเตือนพื้นฐาน** | `email_service.py` ส่งผ่าน smtplib plain text (register, approve, reject, new dataset) | ไม่ใช้ fastapi-mail; ไม่มี HTML template; ไม่มี email_logs; ไม่มี retry 3 ครั้ง | #9 M9, #33 |
| **users table columns** | id, email, password_hash, role, status, agency_name, reject_reason, timestamps | ขาด 17+ columns ตาม #12 (verify_*, reset_*, lockout, agency_*, contact_*, verification_doc_path, suspended_reason, deleted_at, deletion_type ฯลฯ) | #12 users |
| **reject/suspend reason column naming** | column `reject_reason` (migration `2026_05_25_1200`) | Spec ใช้ชื่อ `rejected_reason`; ไม่มี `suspended_reason` column | #12 users |

---

### ❌ ขัดแย้งกับ Spec

| รายการ | ที่อยู่ใน Code | Code ทำอะไร | Spec บอกว่าอะไร | Section |
|---|---|---|---|---|
| **Register initial status** | `auth_repository.create_user()` status=`pending` | สมัครแล้วรอ Admin ทันที | สมัคร → `email_unverified` → verify email → `pending` → Admin | #5 M1 Status Flow |
| **Login block email_unverified** | `user_status` enum: pending/active/rejected/suspended | ไม่มี status `email_unverified` | Login ได้เฉพาะ `active`; email_unverified login ไม่ได้ | #5 M1, #14 |
| **Agency แก้ไข Dataset → publish ทันที** | `update_dataset()` เปลี่ยน status เฉพาะเมื่อ request ส่ง status มา; Frontend มีปุ่ม "บันทึก Draft" ตอน edit | แก้ไขแล้วยัง save draft ได้ | Agency/Admin แก้ไข → published ทันที + version ใหม่ | #5 M2, #30 |
| **Admin Suspend บังคับ reason** | `suspend_user()` ไม่รับ body; `SuspendUserModal` confirm อย่างเดียว | Suspend โดยไม่มี reason | บังคับกรอก reason + ส่ง email + audit | #5 M1 L135–140 |
| **Register rate limit หน่วยเวลา** | middleware: 3 req / 60 วินาที | 3 ครั้งต่อนาที | Register: 3 ครั้ง/ชั่วโมง/IP | #5 M1 L204, #47 |
| **dataset_status ENUM ใน DB** | migration initial: draft/submitted/published/rejected | ENUM 4 ค่า legacy | Spec v3: draft/published เท่านั้น | #14 |
| **Frontend auth route path** | `/login`, `/register` | ไม่มี prefix `/auth/` | `/auth/login`, `/auth/register`, `/auth/verify-email` ฯลฯ | #35 |
| **ENV placeholders ไม่ถูกใช้** | `.env`: VERIFY_TOKEN_EXPIRE_HOURS, RESET_TOKEN_EXPIRE_HOURS, ACCOUNT_LOCKOUT_*, BCRYPT_COST_FACTOR | ค่า config มีแต่ไม่มี code อ่าน | Token/lockout/bcrypt ต้องทำงานตาม config | #9, #43 |
| **Anonymize endpoint method** | Spec ระบุ `DELETE /admin/users/{id}/anonymize` | มีแค่ `DELETE /admin/users/{id}` soft delete | Anonymize แยกจาก soft delete; มี `POST` ใน API list L1406 | #5 M8, #20 |

---

## กลุ่ม B: ยังไม่มีใน Code เลย

> รายการที่ไม่พบ implementation, stub, placeholder, migration, หรือ route ใดๆ ใน codebase

| Feature | Spec Section | Phase ที่ควรทำ (Migration Plan #18) |
|---|---|---|
| **Email Verification flow ทั้งหมด** (verify_token, verify_expires_at, POST /auth/verify-email, POST /auth/resend-verification) | #5 M1, #20, #28, #64 | Migration #2, #6 + Auth Phase |
| **Status `email_unverified` ENUM** | #5 M1, #14 | Migration #6 |
| **Account Lockout** (failed_login_count, locked_until, lock email, countdown UI) | #5 M1 L153–158, #28 | Migration #4 |
| **Password Reset flow** (forgot/reset endpoints, reset_token, reset_expires_at, pages) | #5 M1 L160–168, #20 | Migration #3 |
| **Login History** (audit_logs action LOGIN + user_agent, GET /auth/login-history, LoginHistoryTable) | #5 M1 L177–182, #12 audit_logs | Migration #11 |
| **Self-Delete / Anonymize** (DELETE /auth/me, POST/DELETE /admin/users/{id}/anonymize, DeleteAccountConfirmation) | #5 M8 Data Deletion, #20 | Auth + PDPA Phase |
| **Email System ครบชุด (M9)** — fastapi-mail, Jinja2 templates (10 แบบ), email_logs table, retry worker, Brevo integration | #9 M9, #7 Folder Structure | Migration #8, #10 + Email Phase |
| **email_logs table + GET /admin/email-logs + EmailLogsTable** | #9 M9, #11, #20 L1419, #36 | Migration #10 |
| **Workers** — email_retry_worker.py, cleanup_worker.py (email_unverified > 14 วัน hard delete) | #7, #5 M8 L306–309 | Cron Phase |
| **users extended columns** — agency_name_en, agency_type, agency_code, agency_website, contact_*, verification_doc_path, email_verified_at, verify_*, reset_*, lockout fields, suspended_reason, deleted_at, deletion_type | #12 users | Migration #1, #2, #3, #4, #5 |
| **agency_type ENUM** (central/regional/local/educational/other) | #12, #14 | Migration #7 |
| **consent_type ENUM + column ใน pdpa_consents** | #12 pdpa_consents | Migration #9, #12 |
| **user_agent column ใน audit_logs** | #12 audit_logs | Migration #11 |
| **python-magic MIME validation** | #8 M8, #45, #58 | Security Phase |
| **APScheduler** (cron jobs) | #58 Dependencies | Infrastructure Phase |
| **Frontend: /auth/verify-email** | #35, #36 | Frontend Auth Phase |
| **Frontend: /auth/forgot-password** | #35, #36 | Frontend Auth Phase |
| **Frontend: /auth/reset-password** | #35, #36 | Frontend Auth Phase |
| **Frontend: /register-status** | #35, #36 | Frontend Auth Phase |
| **Frontend: /profile + /profile/delete** | #35, #36 | Frontend Auth Phase |
| **Frontend: /admin/email-logs** | #35, #36 | Admin Phase |
| **Component: PasswordStrengthIndicator** (5 ระดับ + checklist) | #37, #40 | Frontend Auth Phase |
| **Component: PDPACheckbox** (2 checkbox บังคับ + modal) | #37, #40 | Frontend Auth Phase |
| **Component: AgencyTypeSelect** | #37, #40 | Frontend Auth Phase |
| **Component: VerificationDocUpload** (PDF ≤5MB) | #37, #40 | Frontend Auth Phase |
| **Component: ResendEmailButton** (cooldown 60s) | #37 | Frontend Auth Phase |
| **Component: AccountLockoutCountdown** | #37 | Frontend Auth Phase |
| **Component: LoginHistoryTable** | #37 | Frontend Agency Phase |
| **Component: EmailLogsTable** | #37 | Frontend Admin Phase |
| **Component: VerifyEmailResult, ForgotPasswordForm, ResetPasswordForm, RegisterStatusForm, DeleteAccountConfirmation** | #37 | Frontend Auth Phase |
| **Role Color System** (Visitor=เขียว, Agency=ฟ้า, Admin=ม่วง ใน Header/Sidebar) | #41 Role Color System | UI Phase |
| **Backend: POST /admin/users/{id}/unsuspend** (dedicated endpoint) | #20 L1403 | Admin Phase |
| **Backend: POST /admin/users/{id}/anonymize** | #20 L1406 | Admin Phase |
| **Backend: GET /auth/register-status** | #20 L1291 | Auth Phase |
| **Search: format filter ใน Backend ES query** | #37 FilterSidebar | Search Phase |
| **Search: SearchAutocompleteDropdown component** | #37 | Search Phase |
| **verification-docs MinIO bucket + upload ตอน register** | #63 Architecture | Auth Phase |
| **Email templates directory** (`backend/app/email_templates/`) | #7 | Email Phase |
| **Hard Delete cron สำหรับ email_unverified > 14 วัน** | #5 M8, #15 | Migration + Worker Phase |
| **Data retention cron** (audit_logs/download_logs mask หลัง 2 ปี, email_logs hard delete หลัง 1 ปี) | #5 M8 L360–368 | Ops Phase |
| **Account Deletion: พิมพ์ "ลบบัญชี" + password + checkbox** | #40 Account Deletion Form | Frontend PDPA Phase |
| **Register validation: agency_type ENUM, verification_doc PDF, terms_consent** | #40 Register Form | Frontend + Backend Auth Phase |
| **Rate limits ใหม่** — POST /auth/verify-email, resend-verification, forgot-password (60s cooldown) | #47 L2561–2563 | Security Phase |
| **PIIScanResult จาก Backend จริง** (Spec #37 — ไม่ใช่ mock) | #37 Dataset | Dataset Phase |

---

## ภาคผนวก: รายการที่ User คาดว่าอยู่กลุ่ม B แต่พบว่ามีใน Code แล้ว

| รายการ | สถานะจริง | หมายเหตุ |
|---|---|---|
| Download Count กราฟใน Admin Dashboard | **มีแล้ว (กลุ่ม A ✅)** | `AdminDownloadChart.tsx` + `GET /admin/stats/monthly` |
| Admin Approve/Reject | **มีแล้ว (กลุ่ม A ✅/⚠️)** | Reject ครบ; Approve ขาด audit log |
| Basic Email sending | **มีแล้ว (กลุ่ม A ⚠️)** | smtplib plain text เท่านั้น ไม่ใช่ M9 ครบชุด |
| Search Autocomplete | **Backend มี (กลุ่ม A ✅)** | Frontend UI ยังไม่มี → UI อยู่กลุ่ม B |
| Admin Unsuspend (workaround) | **มีแล้ว (กลุ่ม A ⚠️)** | Frontend PATCH status=active ไม่ใช่ dedicated endpoint |

---

## ภาคผนวก: Migration ที่ Spec กำหนด vs ที่มีจริง

**Spec Migration Plan (#18 L1230–1243):** 13 migrations  
**มีจริงใน `backend/migrations/versions/`:** 3 ไฟล์

| # | Spec Migration | สถานะ |
|---|---|---|
| 1 | add_agency_info_fields_to_users | ❌ ไม่มี |
| 2 | add_email_verification_fields_to_users | ❌ ไม่มี |
| 3 | add_password_reset_fields_to_users | ❌ ไม่มี |
| 4 | add_account_lockout_fields_to_users | ❌ ไม่มี |
| 5 | add_rejected_suspended_reason_to_users | ⚠️ มีแค่ `reject_reason` (ชื่อไม่ตรง spec) |
| 6 | add_email_unverified_to_user_status_enum | ❌ ไม่มี |
| 7 | create_agency_type_enum | ❌ ไม่มี |
| 8 | create_email_status_enum | ❌ ไม่มี |
| 9 | create_consent_type_enum | ❌ ไม่มี |
| 10 | create_email_logs_table | ❌ ไม่มี |
| 11 | add_user_agent_to_audit_logs | ❌ ไม่มี |
| 12 | add_consent_type_to_pdpa_consents | ❌ ไม่มี |
| 13 | create_new_indexes | ❌ ไม่มี |

---

## ข้อเสนอลำดับความสำคัญ (อ้างอิง Spec ไม่ใช่คำสั่ง implement)

1. **Database migrations (#18 plan 1–13)** — foundation สำหรับ Auth v3 ทั้งหมด  
2. **Email Verification + Register flow ใหม่** — เปลี่ยน entry point ของ Agency onboarding  
3. **Account Lockout + Password Reset** — security baseline  
4. **Email System M9** — fastapi-mail + email_logs + retry  
5. **Anonymize / Self-Delete** — PDPA compliance  
6. **ES indexing gaps** — PATCH, bulk upload, publish draft (bug fix)  
7. **Frontend Auth pages + components** — verify, forgot, reset, register-status, profile/delete  
8. **Search wiring** — mock → API, autocomplete UI, agency/year filters  
9. **python-magic + bcrypt cost 12** — security hardening  
10. **Role Color System + Admin email-logs UI** — UX polish  

---

*รายงานนี้จัดทำจาก static analysis เท่านั้น ไม่มีการรัน test หรือแก้ไขโค้ด*
