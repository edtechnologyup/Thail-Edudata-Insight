"""Integration tests — Scholarship API."""

from __future__ import annotations

import uuid
from datetime import date, timedelta

import pytest

from tests.conftest import admin_token, error_code, login

pytestmark = pytest.mark.integration

AGENCY_EMAIL = "tatsaneewanyenwattana@gmail.com"
AGENCY_PASSWORD = "TTa@1122334455"

TODAY = date.today()
OPEN_DATE = TODAY
CLOSE_DATE = TODAY + timedelta(days=30)


def agency_token(client) -> str:
    response = login(client, AGENCY_EMAIL, AGENCY_PASSWORD)
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


def make_scholarship_body(
    title: str = "ทุนทดสอบ API",
    status: str = "draft",
) -> dict:
    return {
        "title": title,
        "description": "รายละเอียดทุนทดสอบจาก API Testing",
        "scholarship_type": "government",
        "target_level": "bachelor",
        "eligibility": "นักศึกษาปริญญาตรี GPA 3.0 ขึ้นไป",
        "open_date": OPEN_DATE.isoformat(),
        "close_date": CLOSE_DATE.isoformat(),
        "amount": 50000,
        "status": status,
    }


def create_scholarship(client, token: str, title: str = "ทุนทดสอบ API", status: str = "draft") -> dict:
    r = client.post(
        "/api/v1/scholarship",
        json=make_scholarship_body(title, status),
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201, r.text
    return r.json()["data"]


# ──────── Case ปกติ ────────


class TestScholarshipNormal:
    def test_list_scholarships(self, client):
        """GET /scholarship — ดูรายการทุนไม่ต้อง login"""
        r = client.get("/api/v1/scholarship", params={"page": 1, "page_size": 5})
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert "data" in body

    def test_create_scholarship_draft(self, client):
        """POST /scholarship — สร้างทุน draft"""
        token = agency_token(client)
        data = create_scholarship(client, token)
        assert "id" in data
        assert data["status"] == "draft"

    def test_create_scholarship_published(self, client):
        """POST /scholarship — สร้างทุน published ตรง"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุน Published ตรง", "published")
        assert data["status"] == "published"

    def test_get_published_scholarship(self, client):
        """GET /scholarship/:id — ดูทุนที่ publish แล้ว"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุนดูเดี่ยว", "published")

        r = client.get(f"/api/v1/scholarship/{data['id']}")
        assert r.status_code == 200
        assert r.json()["data"]["id"] == data["id"]

    def test_update_scholarship(self, client):
        """PATCH /scholarship/:id — แก้ไขทุน"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุนก่อนแก้")

        r = client.patch(
            f"/api/v1/scholarship/{data['id']}",
            json={"title": "ทุนหลังแก้ไขแล้ว"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["data"]["title"] == "ทุนหลังแก้ไขแล้ว"

    def test_publish_via_update(self, client):
        """PATCH /scholarship/:id — draft → published ผ่าน update"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุน Draft to Publish")

        r = client.patch(
            f"/api/v1/scholarship/{data['id']}",
            json={"status": "published"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["data"]["status"] == "published"

    def test_delete_scholarship(self, client):
        """DELETE /scholarship/:id — ลบทุน"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุนจะลบ")

        r = client.delete(
            f"/api/v1/scholarship/{data['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200

    def test_list_my_scholarships(self, client):
        """GET /scholarship/mine — ดูทุนของตัวเอง"""
        token = agency_token(client)
        create_scholarship(client, token, "ทุนของฉัน")

        r = client.get(
            "/api/v1/scholarship/mine",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_bookmark_crud(self, client):
        """POST + GET + DELETE /scholarship-bookmarks — CRUD bookmark"""
        token = agency_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        data = create_scholarship(client, token, "ทุน Bookmark", "published")

        # สร้าง bookmark
        r = client.post(
            "/api/v1/scholarship-bookmarks",
            json={"scholarship_id": data["id"]},
            headers=headers,
        )
        assert r.status_code == 201
        bookmark_id = r.json()["data"]["id"]

        # ดูรายการ
        r = client.get("/api/v1/scholarship-bookmarks", headers=headers)
        assert r.status_code == 200

        # ลบ
        r = client.delete(f"/api/v1/scholarship-bookmarks/{bookmark_id}", headers=headers)
        assert r.status_code == 200


# ──────── Admin ────────


class TestScholarshipAdmin:
    def test_admin_list_scholarships(self, client):
        """GET /admin/scholarships — admin ดูทุนทุก agency"""
        token = admin_token(client)
        r = client.get(
            "/api/v1/admin/scholarships",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200

    def test_admin_get_scholarship(self, client):
        """GET /admin/scholarship/:id — admin ดูทุนเดี่ยว (แม้ draft)"""
        agency_tok = agency_token(client)
        data = create_scholarship(client, agency_tok, "ทุน Admin ดู")

        adm_tok = admin_token(client)
        r = client.get(
            f"/api/v1/admin/scholarship/{data['id']}",
            headers={"Authorization": f"Bearer {adm_tok}"},
        )
        assert r.status_code == 200

    def test_admin_hide_scholarship(self, client):
        """POST /admin/scholarships/:id/hide — admin ซ่อนทุน"""
        agency_tok = agency_token(client)
        data = create_scholarship(client, agency_tok, "ทุน Admin ซ่อน", "published")

        adm_tok = admin_token(client)
        r = client.post(
            f"/api/v1/admin/scholarships/{data['id']}/hide",
            headers={"Authorization": f"Bearer {adm_tok}"},
        )
        assert r.status_code == 200


# ──────── Case ผิดปกติ ────────


class TestScholarshipError:
    def test_create_without_token(self, client):
        """POST /scholarship ไม่มี token → 401"""
        client.cookies.clear()
        r = client.post("/api/v1/scholarship", json=make_scholarship_body())
        assert r.status_code == 401

    def test_get_draft_as_public(self, client):
        """GET /scholarship/:id ทุน draft → 404 (public เห็นแค่ published)"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุน Draft ห้ามดู")

        r = client.get(f"/api/v1/scholarship/{data['id']}")
        assert r.status_code == 404

    def test_get_nonexistent(self, client):
        """GET /scholarship/:id ไม่มี → 404"""
        fake_id = str(uuid.uuid4())
        r = client.get(f"/api/v1/scholarship/{fake_id}")
        assert r.status_code == 404

    def test_published_cannot_revert_to_draft(self, client):
        """PATCH published → draft → 400"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุนห้ามกลับ draft", "published")

        r = client.patch(
            f"/api/v1/scholarship/{data['id']}",
            json={"status": "draft"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 400

    def test_close_date_before_open_date(self, client):
        """POST /scholarship — close_date < open_date → 422"""
        token = agency_token(client)
        body = make_scholarship_body("ทุนวันผิด")
        body["close_date"] = (TODAY - timedelta(days=10)).isoformat()

        r = client.post(
            "/api/v1/scholarship",
            json=body,
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 422

    def test_admin_endpoint_as_agency(self, client):
        """GET /admin/scholarships ด้วย agency → 403"""
        token = agency_token(client)
        r = client.get(
            "/api/v1/admin/scholarships",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 403

    def test_delete_without_token(self, client):
        """DELETE /scholarship/:id ไม่มี token → 401"""
        token = agency_token(client)
        data = create_scholarship(client, token, "ทุนลบไม่มี token")

        client.cookies.clear()
        r = client.delete(f"/api/v1/scholarship/{data['id']}")
        assert r.status_code == 401
