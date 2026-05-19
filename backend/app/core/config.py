# Module: Core
# Feature: Environment Variables ตาม #9

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    APP_ENV: str = "development"
    APP_SECRET_KEY: str = ""

    DATABASE_URL: str = ""
    DATABASE_POOL_SIZE: int = 10

    REDIS_HOST: str = ""
    REDIS_PORT: int = 6379
    REDIS_PASSWORD: str = ""

    MINIO_ENDPOINT: str = ""
    MINIO_ACCESS_KEY: str = ""
    MINIO_SECRET_KEY: str = ""
    MINIO_BUCKET_NAME: str = ""

    ELASTICSEARCH_URL: str = ""

    JWT_SECRET: str = ""
    JWT_EXPIRE_MINUTES: int = 60

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""

    RATE_LIMIT_PER_MINUTE: int = 100
    MAX_FILE_SIZE_MB: int = 100

    @property
    def cors_allowed_origins(self) -> list[str]:
        if self.APP_ENV == "development":
            return [
                "http://localhost",
                "http://localhost:3000",
            ]
        if self.APP_ENV == "staging":
            return [
                "http://localhost",
                "http://localhost:3000",
            ]
        return []

    @property
    def redis_url(self) -> str:
        if self.REDIS_PASSWORD:
            return (
                f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:"
                f"{self.REDIS_PORT}/0"
            )
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"

    @property
    def swagger_enabled(self) -> bool:
        return self.APP_ENV in ("development", "staging")


settings = Settings()
