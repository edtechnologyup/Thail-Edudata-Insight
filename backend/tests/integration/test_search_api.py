"""Integration tests — Search API."""

from __future__ import annotations

import json
import uuid

import pytest

from tests.conftest import error_code, login

pytestmark = pytest.mark.integration

AGENCY_EMAIL = "tatsaneewanyenwattana@gmail.com"
AGENCY_PASSWORD = "TTa@1122334455"


def agency_token(client) -> str:
    response = login(client, AGENCY_EMAIL, AGENCY_PASSWORD)
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


# ──────── Case ปกติ ────────


class TestSearchNormal:
    def test_search_all(self, client):
        """GET /search — ค้นหาทั้งหมด ไม่ต้อง login"""
        r = client.get("/api/v1/search", params={"keyword": "dataset", "page": 1, "page_size": 5})
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert "data" in body
        assert "pagination" in body

    def test_search_with_keyword(self, client):
        """GET /search — ค้นหาด้วย keyword"""
        r = client.get("/api/v1/search", params={"keyword": "ทดสอบ"})
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_search_with_filter(self, client):
        """GET /search — ค้นหาพร้อม filter"""
        filters = json.dumps({"formats": ["csv"]})
        r = client.get("/api/v1/search", params={"keyword": "data", "filters": filters})
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_search_filters_options(self, client):
        """GET /search/filters — ดูตัวเลือก filter"""
        r = client.get("/api/v1/search/filters")
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_autocomplete(self, client):
        """GET /search/autocomplete — autocomplete"""
        r = client.get("/api/v1/search/autocomplete", params={"keyword": "data"})
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_saved_search_crud(self, client):
        """POST + GET + DELETE /saved-searches — CRUD saved search"""
        token = agency_token(client)
        headers = {"Authorization": f"Bearer {token}"}

        # สร้าง
        r = client.post(
            "/api/v1/saved-searches",
            json={"name": "ทดสอบ saved search", "filters": {"formats": ["csv"]}},
            headers=headers,
        )
        assert r.status_code == 201
        saved_id = r.json()["data"]["id"]

        # ดูรายการ
        r = client.get("/api/v1/saved-searches", headers=headers)
        assert r.status_code == 200
        assert any(s["id"] == saved_id for s in r.json()["data"])

        # ลบ
        r = client.delete(f"/api/v1/saved-searches/{saved_id}", headers=headers)
        assert r.status_code == 200


# ──────── Case ผิดปกติ ────────


class TestSearchError:
    def test_search_invalid_filter(self, client):
        """GET /search — filter ไม่ถูกต้อง → 400"""
        r = client.get("/api/v1/search", params={"keyword": "test", "filters": "not-json"})
        assert r.status_code == 400
        assert error_code(r) == "SEARCH_INVALID_FILTER"

    def test_saved_search_without_token(self, client):
        """POST /saved-searches ไม่มี token → 401"""
        client.cookies.clear()
        r = client.post(
            "/api/v1/saved-searches",
            json={"name": "no auth", "filters": {}},
        )
        assert r.status_code == 401

    def test_list_saved_searches_without_token(self, client):
        """GET /saved-searches ไม่มี token → 401"""
        client.cookies.clear()
        r = client.get("/api/v1/saved-searches")
        assert r.status_code == 401

    def test_delete_nonexistent_saved_search(self, client):
        """DELETE /saved-searches/:id ที่ไม่มี → 404"""
        token = agency_token(client)
        fake_id = str(uuid.uuid4())
        r = client.delete(
            f"/api/v1/saved-searches/{fake_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 404
