# Module: Core
# Feature: Logging Strategy ตาม #55

import json
import logging
import sys
from datetime import datetime, timezone
from typing import Any

from app.core.config import settings

SENSITIVE_KEYS = {"password", "token", "authorization", "secret", "jwt"}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_data: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).strftime(
                "%Y-%m-%dT%H:%M:%SZ"
            ),
            "level": record.levelname,
            "service": "backend",
            "message": record.getMessage(),
            "user_id": getattr(record, "user_id", None),
            "ip_address": getattr(record, "ip_address", None),
            "endpoint": getattr(record, "endpoint", None),
            "error_code": getattr(record, "error_code", None),
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_data, ensure_ascii=False)


def setup_logging() -> None:
    level = logging.DEBUG if settings.APP_ENV == "development" else logging.INFO
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root_logger.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)


def log_request(
    logger: logging.Logger,
    level: int,
    message: str,
    *,
    user_id: str | None = None,
    ip_address: str | None = None,
    endpoint: str | None = None,
    error_code: str | None = None,
) -> None:
    extra = {
        "user_id": user_id,
        "ip_address": ip_address,
        "endpoint": endpoint,
        "error_code": error_code,
    }
    logger.log(level, message, extra=extra)


def sanitize_log_data(data: dict[str, Any]) -> dict[str, Any]:
    sanitized = {}
    for key, value in data.items():
        if key.lower() in SENSITIVE_KEYS:
            sanitized[key] = "***"
        elif isinstance(value, dict):
            sanitized[key] = sanitize_log_data(value)
        else:
            sanitized[key] = value
    return sanitized
