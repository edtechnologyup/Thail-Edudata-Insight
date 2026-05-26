# Module: M6 Admin
# Feature: Hero background image settings

from pydantic import BaseModel, Field


class HeroImageResponse(BaseModel):
    image_url: str | None = Field(
        default=None,
        description="Public URL to hero image (presigned MinIO URL when configured)",
    )
