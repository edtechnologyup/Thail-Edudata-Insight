"""Integration tests — Category API."""

from __future__ import annotations

import uuid

import pytest

from tests.conftest import admin_token, error_code, login

pytestmark = pytest.mark.integration

AGENCY_EMAIL = "tatsaneewanyenwattana@gmail.com"
AGENCY_PASSWORD = "TTa@1122334455"


def _uid() -> str:
    return uuid.uuid4().hex[:8]


def agency_token(client) -> str:
    response = login(client, AGENCY_EMAIL, AGENCY_PASSWORD)
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


def create_category(client, token: str, name_th: str | None = None, name_en: str | None = None) -> dict:
    suffix = _uid()
    r = client.post(
        "/api/v1/categories",
        json={
            "name_th": name_th or f"หมวดทดสอบ {suffix}",
            "name_en": name_en or f"Test Category {suffix}",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201, r.text
    return r.json()["data"]


# ──────── Case ปกติ ────────


class TestCategoryNormal:
    def test_list_categories(self, client):
        """GET /categories — ดูรายการหมวดไม่ต้อง login"""
        r = client.get("/api/v1/categories")
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert "data" in body

    def test_create_category(self, client):
        """POST /categories — agency สร้างหมวดสำเร็จ"""
        token = agency_token(client)
        data = create_category(client, token)
        assert "id" in data

    def test_create_subcategory(self, client):
        """POST /categories/:id/subcategories — สร้างหมวดย่อย"""
        token = agency_token(client)
        parent = create_category(client, token)
        uid = _uid()

        r = client.post(
            f"/api/v1/categories/{parent['id']}/subcategories",
            json={"name_th": f"หมวดย่อย {uid}", "name_en": f"Sub {uid}"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 201
        assert r.json()["data"]["level"] == 2

    def test_update_category(self, client):
        """PATCH /categories/:id — แก้ไขหมวด"""
        token = agency_token(client)
        data = create_category(client, token)
        new_name = f"หลังแก้ {_uid()}"

        r = client.patch(
            f"/api/v1/categories/{data['id']}",
            json={"name_th": new_name},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["data"]["name_th"] == new_name

    def test_delete_category(self, client):
        """DELETE /categories/:id — ลบหมวด"""
        token = agency_token(client)
        data = create_category(client, token)

        r = client.delete(
            f"/api/v1/categories/{data['id']}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200

    def test_get_category_tags(self, client):
        """GET /categories/:id/tags — ดูแท็กของหมวด"""
        token = agency_token(client)
        data = create_category(client, token)

        r = client.get(
            f"/api/v1/categories/{data['id']}/tags",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["success"] is True


# ──────── Admin ────────


class TestCategoryAdmin:
    def test_admin_list_categories(self, client):
        """GET /admin/categories — admin ดูหมวดทุก agency"""
        token = admin_token(client)
        r = client.get(
            "/api/v1/admin/categories",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_admin_create_category(self, client):
        """POST /admin/categories — admin สร้างหมวด"""
        token = admin_token(client)
        uid = _uid()
        r = client.post(
            "/api/v1/admin/categories",
            json={"name_th": f"หมวด Admin {uid}", "name_en": f"Admin Cat {uid}"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 201

    def test_admin_update_category(self, client):
        """PATCH /admin/categories/:id — admin แก้ไขหมวด"""
        token = admin_token(client)
        uid = _uid()
        r = client.post(
            "/api/v1/admin/categories",
            json={"name_th": f"Admin แก้ {uid}", "name_en": f"AdminEdit {uid}"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 201, r.text
        cat_id = r.json()["data"]["id"]

        r = client.patch(
            f"/api/v1/admin/categories/{cat_id}",
            json={"name_th": f"Admin แก้แล้ว {_uid()}"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200

    def test_admin_delete_category(self, client):
        """DELETE /admin/categories/:id — admin ลบหมวด"""
        token = admin_token(client)
        uid = _uid()
        r = client.post(
            "/api/v1/admin/categories",
            json={"name_th": f"Admin ลบ {uid}", "name_en": f"AdminDel {uid}"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 201, r.text
        cat_id = r.json()["data"]["id"]

        r = client.delete(
            f"/api/v1/admin/categories/{cat_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200


# ──────── Case ผิดปกติ ────────


class TestCategoryError:
    def test_create_without_token(self, client):
        """POST /categories ไม่มี token → 401"""
        client.cookies.clear()
        uid = _uid()
        r = client.post(
            "/api/v1/categories",
            json={"name_th": f"ไม่มี token {uid}", "name_en": f"NoAuth {uid}"},
        )
        assert r.status_code == 401

    def test_delete_nonexistent(self, client):
        """DELETE /categories/:id ที่ไม่มี → 404"""
        token = agency_token(client)
        fake_id = str(uuid.uuid4())
        r = client.delete(
            f"/api/v1/categories/{fake_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 404

    def test_admin_endpoint_as_agency(self, client):
        """GET /admin/categories ด้วย agency → 403"""
        token = agency_token(client)
        r = client.get(
            "/api/v1/admin/categories",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 403

    def test_update_without_token(self, client):
        """PATCH /categories/:id ไม่มี token → 401"""
        token = agency_token(client)
        data = create_category(client, token)

        client.cookies.clear()
        r = client.patch(
            f"/api/v1/categories/{data['id']}",
            json={"name_th": "ไม่ได้"},
        )
        assert r.status_code == 401
