"""Integration tests — Download API."""

from __future__ import annotations

import io
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


def make_csv() -> io.BytesIO:
    return io.BytesIO(b"id,name,score\n1,test,85\n2,test2,92\n")


def create_published_dataset(client, token: str) -> str:
    r = client.post(
        "/api/v1/datasets",
        data={
            "title": "Download Test Dataset",
            "description": "For download testing",
            "license": "open",
        },
        files={"file": ("test.csv", make_csv(), "text/csv")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 201, r.text
    dataset_id = r.json()["data"]["id"]

    r = client.post(
        f"/api/v1/datasets/{dataset_id}/publish",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200, r.text
    return dataset_id


# ──────── Case ปกติ ────────


class TestDownloadNormal:
    def test_preview_dataset(self, client):
        """GET /datasets/:id/preview — preview ไม่ต้อง login"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(f"/api/v1/datasets/{dataset_id}/preview")
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True

    def test_download_csv(self, client):
        """GET /datasets/:id/download?format=csv — download CSV"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(
            f"/api/v1/datasets/{dataset_id}/download",
            params={"purpose": "research and analysis purpose", "format": "csv"},
        )
        assert r.status_code == 200
        assert "text/csv" in r.headers.get("content-type", "")

    def test_download_json(self, client):
        """GET /datasets/:id/download?format=json — download JSON"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(
            f"/api/v1/datasets/{dataset_id}/download",
            params={"purpose": "data analysis purpose", "format": "json"},
        )
        assert r.status_code == 200

    def test_download_excel(self, client):
        """GET /datasets/:id/download?format=excel — download Excel"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(
            f"/api/v1/datasets/{dataset_id}/download",
            params={"purpose": "reporting purpose test", "format": "excel"},
        )
        assert r.status_code == 200

    def test_citation(self, client):
        """GET /datasets/:id/citation — ดู citation"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(f"/api/v1/datasets/{dataset_id}/citation")
        assert r.status_code == 200
        assert r.json()["success"] is True

    def test_export_pdf(self, client):
        """GET /datasets/:id/export-pdf — export PDF"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(f"/api/v1/datasets/{dataset_id}/export-pdf")
        assert r.status_code == 200
        assert "pdf" in r.headers.get("content-type", "")

    def test_download_with_auth(self, client):
        """GET /datasets/:id/download พร้อม token — บันทึก user_id"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(
            f"/api/v1/datasets/{dataset_id}/download",
            params={"purpose": "research and study", "format": "csv"},
            headers={"Authorization": f"Bearer {token}"},
        )
        assert r.status_code == 200


# ──────── Case ผิดปกติ ────────


class TestDownloadError:
    def test_preview_nonexistent(self, client):
        """GET /datasets/:id/preview ที่ไม่มี → 404"""
        fake_id = str(uuid.uuid4())
        r = client.get(f"/api/v1/datasets/{fake_id}/preview")
        assert r.status_code == 404

    def test_download_nonexistent(self, client):
        """GET /datasets/:id/download ที่ไม่มี → 404"""
        fake_id = str(uuid.uuid4())
        r = client.get(
            f"/api/v1/datasets/{fake_id}/download",
            params={"purpose": "testing purpose", "format": "csv"},
        )
        assert r.status_code == 404

    def test_download_invalid_format(self, client):
        """GET /datasets/:id/download?format=xxx → 400"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(
            f"/api/v1/datasets/{dataset_id}/download",
            params={"purpose": "testing purpose", "format": "xxx"},
        )
        assert r.status_code == 400
        assert error_code(r) == "DOWNLOAD_INVALID_FORMAT"

    def test_download_no_purpose(self, client):
        """GET /datasets/:id/download ไม่มี purpose → 422"""
        token = agency_token(client)
        dataset_id = create_published_dataset(client, token)

        r = client.get(
            f"/api/v1/datasets/{dataset_id}/download",
            params={"format": "csv"},
        )
        assert r.status_code == 422

    def test_citation_nonexistent(self, client):
        """GET /datasets/:id/citation ที่ไม่มี → 404"""
        fake_id = str(uuid.uuid4())
        r = client.get(f"/api/v1/datasets/{fake_id}/citation")
        assert r.status_code == 404

    def test_export_pdf_nonexistent(self, client):
        """GET /datasets/:id/export-pdf ที่ไม่มี → 404"""
        fake_id = str(uuid.uuid4())
        r = client.get(f"/api/v1/datasets/{fake_id}/export-pdf")
        assert r.status_code == 404
