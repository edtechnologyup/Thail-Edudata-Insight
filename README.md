# Thai EduData Insight

ศูนย์รวมข้อมูลการศึกษาไทย (Thailand Education Data Catalog) สำหรับรวบรวม ค้นหา ดาวน์โหลด และวิเคราะห์ชุดข้อมูลด้านการศึกษาจากหน่วยงานภาครัฐ

> **Demo:** [http://167.99.67.27](http://167.99.67.27/th)

## Screenshots

<!-- เพิ่มภาพ screenshot ที่ docs/screenshots/ แล้ว uncomment -->
<!-- ![หน้าแรก](docs/screenshots/home.png) -->
<!-- ![ค้นหา](docs/screenshots/search.png) -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->

## Features

- **ค้นหาและกรองข้อมูล** — ค้นหา Dataset ด้วยคำสำคัญ กรองตามหมวดหมู่ ปี จังหวัด หน่วยงาน รูปแบบไฟล์
- **Preview และดาวน์โหลด** — ดูตัวอย่างข้อมูล 100 แถวก่อนดาวน์โหลด รองรับ CSV, Excel, JSON, XML, PDF
- **PII Masking** — ตรวจจับและปกปิดข้อมูลส่วนบุคคล (เลขบัตรประชาชน, เบอร์โทร, อีเมล) อัตโนมัติก่อนเผยแพร่
- **Public API** — API สาธารณะสำหรับนักพัฒนา พร้อมเอกสาร API Docs ในเว็บ
- **ทุนการศึกษา** — รวมข้อมูลทุนการศึกษาจากทุกหน่วยงาน กรองตามสถานะเปิด/ปิดรับสมัคร
- **สถิติภาพรวม** — Dashboard แสดงสถิติการศึกษาไทย แยกตามหมวดหมู่ ปี และหน่วยงาน
- **ระบบหมวดหมู่** — รองรับหมวดหมู่สูงสุด 5 ระดับ แต่ละหน่วยงานจัดการของตัวเองได้
- **รองรับ 2 ภาษา** — ไทยและอังกฤษ

## User Roles

| Role | สิทธิ์ | คำอธิบาย |
|------|--------|----------|
| **Visitor** | ค้นหา, ดู Preview, ดาวน์โหลด, ใช้ API | ประชาชนทั่วไป ไม่ต้อง Login |
| **Agency** | อัปโหลด Dataset, จัดการหมวดหมู่, ดู Dashboard ของตัวเอง | หน่วยงานรัฐ (1 หน่วยงาน = 1 บัญชี) |
| **Admin** | จัดการ User ทั้งหมด, ดูสถิติระบบ, จัดการประกาศ | ผู้ดูแลระบบ สิทธิ์สูงสุด |

## Architecture

```
                    ┌─────────────┐
                    │   Browser   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │  :80
                    └──┬──────┬───┘
                       │      │
              /th, /en │      │ /api/v1
                       │      │
              ┌────────▼┐  ┌──▼────────┐
              │ Next.js │  │  FastAPI  │
              │Frontend │  │  Backend  │
              └─────────┘  └──┬──┬──┬──┘
                              │  │  │
                 ┌────────────┘  │  └────────────┐
                 │               │               │
          ┌──────▼──────┐ ┌─────▼─────┐  ┌──────▼──────┐
          │ PostgreSQL  │ │   Redis   │  │    MinIO    │
          │   Database  │ │   Cache   │  │   Storage   │
          └─────────────┘ └───────────┘  └─────────────┘
```

## Demo

**Demo Server:** [http://167.99.67.27/th](http://167.99.67.27/th)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@edudata.go.th` | `Admin@12345` |
| Agency | `tatsaneewanyenwattana@gmail.com` | `N123456789@n` |

> Visitor ไม่ต้อง Login — เข้าใช้งานได้เลย

## Tech Stack

| ชั้น | เทคโนโลยี |
|------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS, Zustand, React Query, Zod, next-intl |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic, Pandas, PyThaiNLP |
| Database | PostgreSQL 15 |
| Cache / Session | Redis 7 |
| File Storage | MinIO |
| Search | Elasticsearch 8 (optional, มี PG fallback) |
| Proxy | Nginx |
| Deployment | Docker Compose, DigitalOcean Droplet |

## โครงสร้างโปรเจกต์

```
thail-datacatalog/
├── frontend/                # Next.js 14 App Router
│   └── src/
│       ├── app/[locale]/    # Pages (public, agency, admin)
│       ├── components/      # React components
│       ├── hooks/           # Custom hooks
│       ├── services/        # API calls
│       ├── stores/          # Zustand stores
│       ├── locales/         # th.json, en.json
│       └── utils/           # Utilities
├── backend/                 # FastAPI
│   ├── app/
│   │   ├── api/v1/routers/  # API endpoints
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── services/        # Business logic
│   │   ├── repositories/    # Database queries
│   │   └── core/            # Config, security, database
│   ├── migrations/          # Alembic migrations
│   ├── tests/               # Integration + unit tests
│   └── seed_demo.py         # สร้างข้อมูล demo
├── docker/                  # Dockerfiles + Nginx config
├── docker-compose.yml       # Development
├── docker-compose.prod.yml  # Production
└── Claude.md                # Project specification
```

## การติดตั้ง (Development)

### Requirements

- Docker + Docker Compose

### Setup

```bash
# 1. Clone
git clone https://github.com/edtechnologyup/Thail-Edudata-Insight.git
cd thail-datacatalog

# 2. ตั้งค่า ENV
cp .env.example backend/.env
# แก้ไข backend/.env ตามค่า Dev

# Frontend
echo "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1" > frontend/.env.local
echo "NEXT_PUBLIC_APP_ENV=development" >> frontend/.env.local

# 3. รัน
docker compose up --build

# 4. Migration
docker compose exec backend alembic upgrade head

# 5. สร้างข้อมูล Demo (optional)
docker compose exec backend python seed_demo.py
```

### URLs (Dev)

| URL | คำอธิบาย |
|-----|----------|
| http://127.0.0.1 | หน้าเว็บผ่าน Nginx |
| http://127.0.0.1:8000/docs | Swagger UI |

## การ Deploy (Production)

```bash
# บน Server
cd /opt/datacatalog
docker compose -f docker-compose.prod.yml --env-file .env.prod up --build -d

# รัน Migration
docker compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## API Documentation

- **Swagger UI:** `http://<host>:8000/docs` (Dev)
- **In-app API Docs:** `http://<host>/th/api-docs`
- **Response format:** JSend (`success`, `data`, `message`)
- **Base path:** `/api/v1`
