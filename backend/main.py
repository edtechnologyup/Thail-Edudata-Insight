# Module: Core
# Feature: FastAPI App + API Versioning ตาม #27 + CORS ตาม #49

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_router
from app.api.v1.routers.search_router import router as search_router
from app.core.config import settings
from app.core.errors import AppException, ERROR_DEFINITIONS
from app.core.logging import get_logger, log_request, setup_logging
from app.core.middleware import RBACMiddleware, RateLimitMiddleware
from app.core.security import get_client_ip

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Datacatalog API",
    version="1.0.0",
    docs_url="/docs" if settings.swagger_enabled else None,
    redoc_url="/redoc" if settings.swagger_enabled else None,
    openapi_url="/openapi.json" if settings.swagger_enabled else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(RBACMiddleware)
app.add_middleware(RateLimitMiddleware)

app.include_router(api_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    log_request(
        logger,
        logging.ERROR,
        str(exc.detail),
        ip_address=get_client_ip(request),
        endpoint=request.url.path,
        error_code=exc.code,
    )
    return JSONResponse(status_code=exc.status_code, content=exc.detail)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    _, message = ERROR_DEFINITIONS["VALIDATION_ERROR"]
    log_request(
        logger,
        logging.WARNING,
        "Validation error",
        ip_address=get_client_ip(request),
        endpoint=request.url.path,
        error_code="VALIDATION_ERROR",
    )
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": message,
            },
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    _, message = ERROR_DEFINITIONS["INTERNAL_SERVER_ERROR"]
    log_request(
        logger,
        logging.CRITICAL,
        str(exc),
        ip_address=get_client_ip(request),
        endpoint=request.url.path,
        error_code="INTERNAL_SERVER_ERROR",
    )
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": message,
            },
        },
    )
