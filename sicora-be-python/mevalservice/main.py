"""
MEvalService - Monitoring and Evaluation Service

Main entry point for the FastAPI application.
Handles committee management, student cases, improvement plans, sanctions, and appeals.
"""

import logging
from contextlib import asynccontextmanager
from datetime import datetime

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.config import settings
from app.infrastructure.database.base import engine, Base
from app.presentation.routers import (
    committee_router,
    student_case_router,
    improvement_plan_router,
    sanction_router,
    appeal_router,
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting MEvalService...")
    logger.info(f"Environment: {settings.debug}")
    logger.info(f"Debug mode: {settings.debug}")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")

    yield

    # Shutdown
    logger.info("Shutting down MEvalService...")
    await engine.dispose()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title=settings.api_title,
    description="""
    Monitoring and Evaluation Service for SICORA Platform.
    
    ## Features
    
    * **Committees**: Manage evaluation committees (monthly, extraordinary, appeals)
    * **Student Cases**: Track academic and disciplinary cases
    * **Improvement Plans**: Create and monitor student improvement plans
    * **Sanctions**: Apply and track sanctions per Acuerdo 009/2024
    * **Appeals**: Handle appeals process for sanctions
    
    ## Regulatory Framework
    
    This service implements the evaluation committee process according to:
    - Acuerdo 009/2024 - Disciplinary regulations
    - Internal evaluation protocols
    """,
    version=settings.api_version,
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure based on environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """Handle ValueError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": str(exc), "detail": "Validation error"},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else None,
        },
    )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "mevalservice",
        "version": settings.api_version,
        "timestamp": datetime.now().isoformat(),
    }


# Ready check endpoint
@app.get("/ready", tags=["Health"])
async def ready_check():
    """Readiness check endpoint."""
    try:
        # Check database connection
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {
            "status": "ready",
            "database": "connected",
            "timestamp": datetime.now().isoformat(),
        }
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not ready",
                "database": "disconnected",
                "error": str(e),
            },
        )


# Include routers
app.include_router(committee_router, prefix="/api/v1")
app.include_router(student_case_router, prefix="/api/v1")
app.include_router(improvement_plan_router, prefix="/api/v1")
app.include_router(sanction_router, prefix="/api/v1")
app.include_router(appeal_router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """Root endpoint with service information."""
    return {
        "service": "MEvalService",
        "description": "Monitoring and Evaluation Service for SICORA",
        "version": settings.api_version,
        "documentation": "/docs" if settings.debug else "Disabled in production",
        "endpoints": {
            "committees": "/api/v1/committees",
            "cases": "/api/v1/cases",
            "improvement_plans": "/api/v1/improvement-plans",
            "sanctions": "/api/v1/sanctions",
            "appeals": "/api/v1/appeals",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.reload,
        log_level=settings.log_level.lower(),
    )
