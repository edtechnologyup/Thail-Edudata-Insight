# Module: Core
# Feature: Pagination Standard ตาม #23

from typing import Literal

from fastapi import Query
from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    sort: str = Field(default="created_at")
    order: Literal["asc", "desc"] = Field(default="desc")

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size


def get_pagination_params(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    sort: str = Query(default="created_at"),
    order: Literal["asc", "desc"] = Query(default="desc"),
) -> PaginationParams:
    return PaginationParams(
        page=page,
        page_size=page_size,
        sort=sort,
        order=order,
    )
