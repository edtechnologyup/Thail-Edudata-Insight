from pydantic import BaseModel, Field


class SiteSettingResponse(BaseModel):
    key: str
    value: str
    enabled: bool

    model_config = {"from_attributes": True}


class SiteSettingsPublicResponse(BaseModel):
    ribbon_enabled: bool = False
    ribbon_image_url: str = ""
    grayscale_enabled: bool = False
    image_urls: dict[str, str] = {}


class SiteSettingUpdateRequest(BaseModel):
    enabled: bool
    value: str = Field(default="", max_length=500)
