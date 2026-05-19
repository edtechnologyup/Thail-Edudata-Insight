# Module: Core
# Feature: JSend Response Format ตาม #10 #22

import math
from typing import Any


def success_response(data: Any = None, message: str = "ok") -> dict:
    return {
        "success": True,
        "data": data,
        "message": message,
    }


def list_response(
    data: list,
    page: int,
    page_size: int,
    total_items: int,
    message: str = "ok",
) -> dict:
    total_pages = math.ceil(total_items / page_size) if page_size > 0 else 0
    return {
        "success": True,
        "data": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
        },
        "message": message,
    }


def error_response(code: str, message: str) -> dict:
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
        },
    }


def delete_response(message: str = "ok") -> dict:
    return {
        "success": True,
        "data": None,
        "message": message,
    }
