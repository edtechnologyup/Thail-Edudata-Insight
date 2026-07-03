"""Integration tests — Dataset CRUD API."""

from __future__ import annotations

import io
import uuid

import pytest

from tests.conftest import admin_token, error_code, login

pytestmark = pytest.mark.integration

AGENCY_EMAIL = "tatsaneewanyenwattana@gmail.com"
AGENCY_PASSWORD = "TTa@1122334455"


def agency_token(client) -> str:
    response = login(client, AGENCY_EMAIL, AGENCY_PASSWORD)
    assert response.status_code == 200, response.text
    return response.json()["data"]["access_token"]


def make_csv() -> io.BytesIO:
    buf = io.BytesIO(b"id,name,score\n1,test,85\n2,test2,92\n")
    buf.name = "test.csv"
    return buf


def create_dataset(client, token: str, title: str = "ทดสอบ Dataset API") -> dict:
    response = client.post(
        "/api/v1/datasets",
        data={
            "title": title,
            "description": "ข้อมูลทดสอบจาก API Testing",
            "license": "open",
        },
        files={"file": ("test.csv", make_csv(), "text/csv")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201, response.text
    return response.json()["data"]


def create_and_publish(client, token: str, title: str = "ทดสอบ Published") -> dict:
    data = create_dataset(client, token, title)
    client.post(
        f"/api/v1/datasets/{data['id']}/publish",
        headers={"Authorization": f"Bearer {token}"},
    )
    return data


# ──────── Case ปกติ ────────


class TestDatasetNormal:
    def test_list_datasets(self, client):
        """GET /datasets — ดูรายการได้โดยไม่ต้อง login"""
        r = client.get("/api/v1/datasets", params={"page": 1, "page_size": 2})
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert "data" in body
        assert "pagination" in body

    def test_create_dataset(self, client):
        """POST /datasets — agency สร้าง dataset สำเร็จ"""
        token = agency_token(client)
        data = create_dataset(client, token)
        assert "id" in data
        assert data["title"] == "ทดสอบ Dataset API"

    def test_get_published_dataset(self, client):
        """GET /datasets/:id — ดู dataset ที่ publish แล้ว"""
        token = agency_token(client)
        data = create_and_publish(client, token, "ทดสอบดูเดี่ยว")
        dataset_id = data["id"]

        r = client.get(
            f"/api/v1/datasets/{dataset_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["data"]["id"] == dataset_id

    def test_update_dataset(self, client):
        """PATCH /datasets/:id — แก้ไข dataset ด้วย JSON body"""
        token = agency_token(client)
        data = create_dataset(client, token, "ก่อนแก้ไข")
        dataset_id = data["id"]

        r = client.patch(
            f"/api/v1/datasets/{dataset_id}",
            json={"title": "หลังแก้ไขแล้ว", "description": "อัปเดต"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200
        assert r.json()["data"]["title"] == "หลังแก้ไขแล้ว"

    def test_publish_dataset(self, client):
        """POST /datasets/:id/publish — publish สำเร็จ"""
        token = agency_token(client)
        data = create_dataset(client, token, "ทดสอบ Publish")
        dataset_id = data["id"]

        r = client.post(
            f"/api/v1/datasets/{dataset_id}/publish",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200

    def test_delete_dataset(self, client):
        """DELETE /datasets/:id — ลบ dataset"""
        token = agency_token(client)
        data = create_dataset(client, token, "ทดสอบลบ")
        dataset_id = data["id"]

        r = client.delete(
            f"/api/v1/datasets/{dataset_id}",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200


# ──────── Case ผิดปกติ ────────


class TestDatasetError:
    def test_create_without_token(self, client):
        """POST /datasets ไม่มี token → 401"""
        client.cookies.clear()
        r = client.post(
            "/api/v1/datasets",
            data={"title": "No Auth", "license": "open"},
            files={"file": ("test.csv", make_csv(), "text/csv")},
        )
        assert r.status_code == 401

    def test_get_nonexistent_dataset(self, client):
        """GET /datasets/:id ที่ไม่มี → 404"""
        fake_id = str(uuid.uuid4())
        r = client.get(f"/api/v1/datasets/{fake_id}")
        assert r.status_code == 404
        assert error_code(r) == "DATASET_NOT_FOUND"

    def test_delete_without_token(self, client):
        """DELETE /datasets/:id ไม่มี token → 401"""
        token = agency_token(client)
        data = create_dataset(client, token, "ลบไม่มี token")
        dataset_id = data["id"]

        client.cookies.clear()
        r = client.delete(f"/api/v1/datasets/{dataset_id}")
        assert r.status_code == 401

    def test_update_without_token(self, client):
        """PATCH /datasets/:id ไม่มี token → 401"""
        token = agency_token(client)
        data = create_dataset(client, token, "แก้ไม่มี token")
        dataset_id = data["id"]

        client.cookies.clear()
        r = client.patch(
            f"/api/v1/datasets/{dataset_id}",
            json={"title": "ไม่มีสิทธิ์"},
        )
        assert r.status_code == 401
