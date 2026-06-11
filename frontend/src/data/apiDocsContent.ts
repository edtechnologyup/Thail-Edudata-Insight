export type ApiDocLocale = "th" | "en";

export type ApiPermission = "Public" | "Agency" | "Admin";

export type ApiHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type LocalizedText = {
  th: string;
  en: string;
};

export type ApiQuickStartStep = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  code?: string;
};

export type ApiEndpointDoc = {
  id: string;
  method: ApiHttpMethod;
  path: string;
  title: LocalizedText;
  description: LocalizedText;
  permissions: ApiPermission[];
  requestExample: string;
  responseExample: string;
};

export type ApiEndpointGroup = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  endpoints: ApiEndpointDoc[];
};

export const QUICK_START_STEPS: ApiQuickStartStep[] = [
  {
    id: "request-api-key",
    title: {
      th: "ขอ API Key",
      en: "Request API Key",
    },
    description: {
      th: "เข้าสู่ระบบด้วยบัญชีหน่วยงานที่ได้รับอนุมัติ แล้วติดต่อผู้ดูแลระบบเพื่อเปิดสิทธิ์ใช้งาน API",
      en: "Sign in with an approved agency account and contact the administrator to enable API access.",
    },
  },
  {
    id: "authentication",
    title: {
      th: "Authentication",
      en: "Authentication",
    },
    description: {
      th: "แนบ JWT Token ใน Header สำหรับ Endpoint ที่ต้องยืนยันตัวตน",
      en: "Attach the JWT token in the request header for authenticated endpoints.",
    },
    code: "Authorization: Bearer {your_token}",
  },
  {
    id: "try-api-request",
    title: {
      th: "ทดลองเรียก API",
      en: "Try API Request",
    },
    description: {
      th: "เริ่มต้นด้วย Public API เพื่อดูรายการ Dataset ที่เผยแพร่แล้ว",
      en: "Start with the public API to retrieve published datasets.",
    },
    code: "GET /api/v1/public/datasets?page=1&page_size=20",
  },
  {
    id: "example-response",
    title: {
      th: "ตัวอย่าง Response",
      en: "Example Response",
    },
    description: {
      th: "Response ของระบบใช้รูปแบบ JSON ที่อ่านง่ายและต่อยอดได้ทันที",
      en: "Responses are returned as readable JSON that can be used immediately.",
    },
    code: `{
  "id": 1,
  "title": "ข้อมูลนักเรียน ปี 2569",
  "format": "csv"
}`,
  },
];

export const API_ENDPOINT_GROUPS: ApiEndpointGroup[] = [
  {
    id: "authentication",
    title: {
      th: "Authentication",
      en: "Authentication",
    },
    description: {
      th: "ระบบยืนยันตัวตนและจัดการบัญชี",
      en: "Authentication and Account Management",
    },
    endpoints: [
      {
        id: "auth-login",
        method: "POST",
        path: "/auth/login",
        title: {
          th: "เข้าสู่ระบบ",
          en: "Login",
        },
        description: {
          th: "เข้าสู่ระบบด้วยอีเมลและรหัสผ่านเพื่อรับ JWT Token",
          en: "Sign in with email and password to receive a JWT token.",
        },
        permissions: ["Public"],
        requestExample: `{
  "email": "agency@example.go.th",
  "password": "Password123"
}`,
        responseExample: `{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "token_type": "bearer"
  },
  "message": "ok"
}`,
      },
      {
        id: "auth-register",
        method: "POST",
        path: "/auth/register",
        title: {
          th: "สมัครบัญชีหน่วยงาน",
          en: "Register Agency Account",
        },
        description: {
          th: "ส่งคำขอสมัครบัญชีหน่วยงานเพื่อรอการตรวจสอบและอนุมัติ",
          en: "Submit an agency account request for review and approval.",
        },
        permissions: ["Public"],
        requestExample: `{
  "agency_name": "สำนักงานตัวอย่าง",
  "email": "agency@example.go.th",
  "password": "Password123",
  "pdpa_consent": true
}`,
        responseExample: `{
  "success": true,
  "data": {
    "message": "registration submitted"
  },
  "message": "ok"
}`,
      },
      {
        id: "auth-me",
        method: "GET",
        path: "/auth/me",
        title: {
          th: "ข้อมูลผู้ใช้ปัจจุบัน",
          en: "Current User",
        },
        description: {
          th: "ดึงข้อมูลบัญชีของผู้ใช้ที่เข้าสู่ระบบอยู่",
          en: "Retrieve the currently authenticated user profile.",
        },
        permissions: ["Agency", "Admin"],
        requestExample: `GET /api/v1/auth/me
Authorization: Bearer {your_token}`,
        responseExample: `{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "agency@example.go.th",
    "role": "agency"
  },
  "message": "ok"
}`,
      },
    ],
  },
  {
    id: "dataset-management",
    title: {
      th: "Dataset Management",
      en: "Dataset Management",
    },
    description: {
      th: "ระบบจัดการชุดข้อมูล",
      en: "Dataset Management",
    },
    endpoints: [
      {
        id: "datasets-list",
        method: "GET",
        path: "/datasets",
        title: {
          th: "รายการ Dataset",
          en: "List Datasets",
        },
        description: {
          th: "เรียกดูรายการ Dataset ที่เผยแพร่แล้วพร้อม Pagination",
          en: "List published datasets with pagination.",
        },
        permissions: ["Public"],
        requestExample: "GET /api/v1/datasets?page=1&page_size=20",
        responseExample: `{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "ข้อมูลนักเรียน ปี 2569",
      "status": "published"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 1,
    "total_pages": 1
  },
  "message": "ok"
}`,
      },
      {
        id: "datasets-create",
        method: "POST",
        path: "/datasets",
        title: {
          th: "อัปโหลด Dataset",
          en: "Upload Dataset",
        },
        description: {
          th: "อัปโหลดไฟล์ CSV, Excel หรือ JSON พร้อม Metadata ของชุดข้อมูล",
          en: "Upload CSV, Excel, or JSON files with dataset metadata.",
        },
        permissions: ["Agency", "Admin"],
        requestExample: `Content-Type: multipart/form-data

file: students.csv
data: {
  "title": "ข้อมูลนักเรียน ปี 2569",
  "license": "open",
  "status": "published"
}`,
        responseExample: `{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "ข้อมูลนักเรียน ปี 2569",
    "status": "published"
  },
  "message": "ok"
}`,
      },
      {
        id: "datasets-delete",
        method: "DELETE",
        path: "/datasets/{id}",
        title: {
          th: "ลบ Dataset",
          en: "Delete Dataset",
        },
        description: {
          th: "ลบ Dataset แบบ Soft Delete ตามสิทธิ์ของผู้ใช้",
          en: "Soft delete a dataset according to user permissions.",
        },
        permissions: ["Agency", "Admin"],
        requestExample: `DELETE /api/v1/datasets/{id}
Authorization: Bearer {your_token}`,
        responseExample: `{
  "success": true,
  "data": null,
  "message": "ok"
}`,
      },
    ],
  },
  {
    id: "search-discovery",
    title: {
      th: "Search & Discovery",
      en: "Search & Discovery",
    },
    description: {
      th: "ระบบค้นหาและสำรวจข้อมูล",
      en: "Search and Data Discovery",
    },
    endpoints: [
      {
        id: "search",
        method: "GET",
        path: "/search",
        title: {
          th: "ค้นหา Dataset",
          en: "Search Datasets",
        },
        description: {
          th: "ค้นหาชุดข้อมูลด้วยคำสำคัญและตัวกรอง เช่น หมวดหมู่ ปี จังหวัด หรือหน่วยงาน",
          en: "Search datasets by keyword and filters such as category, year, province, or agency.",
        },
        permissions: ["Public"],
        requestExample: "GET /api/v1/search?keyword=นักเรียน&page=1&page_size=20",
        responseExample: `{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  },
  "message": "ok"
}`,
      },
      {
        id: "search-autocomplete",
        method: "GET",
        path: "/search/autocomplete",
        title: {
          th: "คำแนะนำการค้นหา",
          en: "Autocomplete",
        },
        description: {
          th: "ดึงคำแนะนำสำหรับช่องค้นหาเมื่อผู้ใช้พิมพ์อย่างน้อย 2 ตัวอักษร",
          en: "Return search suggestions after the user types at least two characters.",
        },
        permissions: ["Public"],
        requestExample: "GET /api/v1/search/autocomplete?keyword=นัก",
        responseExample: `{
  "success": true,
  "data": [
    "นักเรียน",
    "นักศึกษา"
  ],
  "message": "ok"
}`,
      },
      {
        id: "dataset-preview",
        method: "GET",
        path: "/datasets/{id}/preview",
        title: {
          th: "Preview Dataset",
          en: "Preview Dataset",
        },
        description: {
          th: "ดูข้อมูลตัวอย่าง 100 แถวแรกของ Dataset ที่เผยแพร่แล้ว",
          en: "Preview the first 100 rows of a published dataset.",
        },
        permissions: ["Public"],
        requestExample: "GET /api/v1/datasets/{id}/preview",
        responseExample: `{
  "success": true,
  "data": {
    "rows": [],
    "total_preview_rows": 100
  },
  "message": "ok"
}`,
      },
    ],
  },
  {
    id: "administration",
    title: {
      th: "Administration",
      en: "Administration",
    },
    description: {
      th: "ระบบสำหรับผู้ดูแล",
      en: "Administration Functions",
    },
    endpoints: [
      {
        id: "admin-users",
        method: "GET",
        path: "/admin/users",
        title: {
          th: "จัดการผู้ใช้",
          en: "Manage Users",
        },
        description: {
          th: "ดูรายการผู้ใช้ทั้งหมดในระบบสำหรับผู้ดูแล",
          en: "List all users in the system for administrators.",
        },
        permissions: ["Admin"],
        requestExample: `GET /api/v1/admin/users
Authorization: Bearer {admin_token}`,
        responseExample: `{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 0,
    "total_pages": 0
  },
  "message": "ok"
}`,
      },
      {
        id: "admin-datasets-hide",
        method: "POST",
        path: "/admin/datasets/{id}/hide",
        title: {
          th: "ซ่อน Dataset",
          en: "Hide Dataset",
        },
        description: {
          th: "ซ่อน Dataset ที่ไม่เหมาะสมด้วย Soft Delete",
          en: "Hide inappropriate datasets using soft delete.",
        },
        permissions: ["Admin"],
        requestExample: `POST /api/v1/admin/datasets/{id}/hide
Authorization: Bearer {admin_token}`,
        responseExample: `{
  "success": true,
  "data": null,
  "message": "ok"
}`,
      },
      {
        id: "admin-audit-logs",
        method: "GET",
        path: "/admin/audit-logs",
        title: {
          th: "Audit Log",
          en: "Audit Logs",
        },
        description: {
          th: "ดูประวัติการทำงานและเหตุการณ์สำคัญของระบบ",
          en: "View system activity history and important events.",
        },
        permissions: ["Admin"],
        requestExample: `GET /api/v1/admin/audit-logs
Authorization: Bearer {admin_token}`,
        responseExample: `{
  "success": true,
  "data": [],
  "message": "ok"
}`,
      },
    ],
  },
];

export function getLocalizedText(text: LocalizedText, locale: string): string {
  return locale === "en" ? text.en : text.th;
}
