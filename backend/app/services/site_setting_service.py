import io
import logging

from fastapi import UploadFile
from minio.error import S3Error
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.errors import raise_app_error
from app.core.logging import get_logger, log_request
from app.models.site_setting_model import SiteSetting
from app.schemas.site_setting_schema import (
    SiteSettingResponse,
    SiteSettingsPublicResponse,
    SiteSettingUpdateRequest,
)

logger = get_logger(__name__)

RIBBON_OBJECT_NAME = "settings/ribbon-image/current"
RIBBON_IMAGE_FILE_PATH = "/public/settings/ribbon-image/file"
MAX_IMAGE_BYTES = 2 * 1024 * 1024

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"}

SETTING_IMAGE_KEYS = {
    "home_hero_image",
    "home_guide_image",
    "scholarship_hero_image",
    "apidocs_hero_image",
    "popup_image",
}

def _object_name_for(key: str) -> str:
    return f"settings/{key}/current"

def _file_path_for(key: str) -> str:
    return f"/public/settings/{key}/file"


def _get_setting(db: Session, key: str) -> SiteSetting | None:
    return db.query(SiteSetting).filter(SiteSetting.key == key).first()


def get_public_settings(db: Session, minio_client) -> SiteSettingsPublicResponse:
    ribbon = _get_setting(db, "ribbon_image_url")
    grayscale = _get_setting(db, "grayscale")

    ribbon_url = ""
    if ribbon and ribbon.enabled:
        ribbon_url = _ribbon_image_url(minio_client) or ""

    image_urls: dict[str, str] = {}
    for key in SETTING_IMAGE_KEYS:
        row = _get_setting(db, key)
        if row and row.enabled:
            url = _setting_image_url(minio_client, key)
            if url:
                image_urls[key] = url

    return SiteSettingsPublicResponse(
        ribbon_enabled=ribbon.enabled if ribbon else False,
        ribbon_image_url=ribbon_url,
        grayscale_enabled=grayscale.enabled if grayscale else False,
        image_urls=image_urls,
    )


def get_all_settings(db: Session) -> list[SiteSettingResponse]:
    rows = db.query(SiteSetting).order_by(SiteSetting.key).all()
    return [SiteSettingResponse.model_validate(r) for r in rows]


def update_setting(db: Session, key: str, data: SiteSettingUpdateRequest) -> SiteSettingResponse:
    setting = _get_setting(db, key)
    if not setting:
        raise_app_error("NOT_FOUND", f"Setting '{key}' not found")
    setting.enabled = data.enabled
    setting.value = data.value
    db.commit()
    db.refresh(setting)
    return SiteSettingResponse.model_validate(setting)


def _ribbon_image_url(minio_client) -> str | None:
    try:
        stat = minio_client.stat_object(settings.MINIO_BUCKET_NAME, RIBBON_OBJECT_NAME)
        version = int(stat.last_modified.timestamp())
        return f"{RIBBON_IMAGE_FILE_PATH}?v={version}"
    except S3Error:
        return None
    except Exception:
        return None


def upload_ribbon_image(minio_client, file: UploadFile) -> str:
    content = file.file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise_app_error("FILE_TOO_LARGE", "ไฟล์ใหญ่เกิน 2MB")

    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise_app_error("FILE_INVALID_FORMAT", "ไฟล์ต้องเป็น JPEG, PNG, WebP หรือ GIF")

    try:
        minio_client.put_object(
            settings.MINIO_BUCKET_NAME,
            RIBBON_OBJECT_NAME,
            io.BytesIO(content),
            length=len(content),
            content_type=content_type,
        )
        return _ribbon_image_url(minio_client) or ""
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Upload ribbon failed: {exc}", error_code="FILE_UPLOAD_FAILED")
        raise_app_error("FILE_UPLOAD_FAILED")


def delete_ribbon_image(minio_client) -> None:
    try:
        minio_client.remove_object(settings.MINIO_BUCKET_NAME, RIBBON_OBJECT_NAME)
    except S3Error:
        pass
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Delete ribbon failed: {exc}", error_code="FILE_UPLOAD_FAILED")


def stream_ribbon_image(minio_client) -> tuple[bytes, str] | None:
    response = None
    try:
        response = minio_client.get_object(settings.MINIO_BUCKET_NAME, RIBBON_OBJECT_NAME)
        content = response.read()
        content_type = response.headers.get("Content-Type", "image/png").split(";")[0].strip()
        return content, content_type
    except Exception:
        return None
    finally:
        if response is not None:
            response.close()
            response.release_conn()


def _setting_image_url(minio_client, key: str) -> str | None:
    obj = _object_name_for(key)
    try:
        stat = minio_client.stat_object(settings.MINIO_BUCKET_NAME, obj)
        version = int(stat.last_modified.timestamp())
        return f"{_file_path_for(key)}?v={version}"
    except Exception:
        return None


def upload_setting_image(db: Session, minio_client, key: str, file: UploadFile) -> str:
    if key not in SETTING_IMAGE_KEYS:
        raise_app_error("VALIDATION_ERROR", f"Invalid image key: {key}")

    content = file.file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise_app_error("FILE_TOO_LARGE", "ไฟล์ใหญ่เกิน 2MB")

    content_type = (file.content_type or "").split(";")[0].strip().lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise_app_error("FILE_INVALID_FORMAT", "ไฟล์ต้องเป็น JPEG, PNG, WebP หรือ GIF")

    obj = _object_name_for(key)
    try:
        minio_client.put_object(
            settings.MINIO_BUCKET_NAME,
            obj,
            io.BytesIO(content),
            length=len(content),
            content_type=content_type,
        )
        url = _setting_image_url(minio_client, key) or ""
        row = _get_setting(db, key)
        if row:
            row.value = url
            row.enabled = True
            db.commit()
        return url
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Upload {key} failed: {exc}", error_code="FILE_UPLOAD_FAILED")
        raise_app_error("FILE_UPLOAD_FAILED")


def delete_setting_image(db: Session, minio_client, key: str) -> None:
    if key not in SETTING_IMAGE_KEYS:
        raise_app_error("VALIDATION_ERROR", f"Invalid image key: {key}")
    obj = _object_name_for(key)
    try:
        minio_client.remove_object(settings.MINIO_BUCKET_NAME, obj)
    except S3Error:
        pass
    except Exception as exc:
        log_request(logger, logging.ERROR, f"Delete {key} failed: {exc}", error_code="FILE_UPLOAD_FAILED")
    row = _get_setting(db, key)
    if row:
        row.value = ""
        db.commit()


def stream_setting_image(minio_client, key: str) -> tuple[bytes, str] | None:
    if key not in SETTING_IMAGE_KEYS:
        return None
    obj = _object_name_for(key)
    response = None
    try:
        response = minio_client.get_object(settings.MINIO_BUCKET_NAME, obj)
        content = response.read()
        content_type = response.headers.get("Content-Type", "image/png").split(";")[0].strip()
        return content, content_type
    except Exception:
        return None
    finally:
        if response is not None:
            response.close()
            response.release_conn()
