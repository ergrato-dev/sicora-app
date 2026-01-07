"""FastAPI application main module for Knowledge Base Service."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
from datetime import datetime, timezone

from app.infrastructure.config.database import engine, get_db_session, check_database_health
from app.presentation.routers import kb_router, search_router
from app.presentation.routers.admin_router import router as admin_kb_router
from app.presentation.routers.pdf_router import router as pdf_router
from app.presentation.schemas.kb_schemas import HealthCheckResponse, ErrorResponse
from app.domain.exceptions.kb_exceptions import (
    KbDomainException,
    KnowledgeItemNotFoundError,
    InvalidContentError,
    SearchError,
    EmbeddingError
)

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager."""
    # Startup
    logger.info("Starting KbService application")
    yield
    # Shutdown
    logger.info("Shutting down KbService application")
    await engine.dispose()


app = FastAPI(
    title="SICORA KbService API",
    description="""
    Microservicio de Base de Conocimiento para el Sistema de Información de Coordinación Académica (SICORA) - Asiste App SENA.
    
    Este servicio implementa Clean Architecture y proporciona:
    - Gestión completa de contenido de conocimiento
    - Búsqueda tradicional y semántica con IA
    - Integración con chatbot de reglamento
    - Sistema de embeddings vectoriales
    - API RESTful con documentación automática
    """,
    version="1.0.0",
    contact={
        "name": "Equipo de Desarrollo SICORA",
        "email": "desarrollo@sicora.sena.edu.co"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    },
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(KbDomainException)
async def kb_domain_exception_handler(request: Request, exc: KbDomainException):
    """Handle knowledge base domain exceptions."""
    logger.error(f"KB Domain exception: {exc}")
    
    if isinstance(exc, KnowledgeItemNotFoundError):
        status_code = 404
        error_code = "KNOWLEDGE_ITEM_NOT_FOUND"
    elif isinstance(exc, InvalidContentError):
        status_code = 400
        error_code = "INVALID_CONTENT"
    elif isinstance(exc, SearchError):
        status_code = 500
        error_code = "SEARCH_ERROR"
    elif isinstance(exc, EmbeddingError):
        status_code = 500
        error_code = "EMBEDDING_ERROR"
    else:
        status_code = 500
        error_code = "KB_SERVICE_ERROR"
    
    return JSONResponse(
        status_code=status_code,
        content=ErrorResponse(
            detail=str(exc),
            error_code=error_code,
            timestamp=datetime.now(timezone.utc)
        ).model_dump(mode='json')
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions."""
    logger.error(f"HTTP exception: {exc.detail}")
    
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            detail=exc.detail,
            error_code="HTTP_ERROR",
            timestamp=datetime.now(timezone.utc)
        ).model_dump(mode='json')
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unexpected error: {str(exc)}", exc_info=True)
    
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            detail="Internal server error",
            error_code="INTERNAL_SERVER_ERROR",
            timestamp=datetime.now(timezone.utc)
        ).model_dump(mode='json')
    )


@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Root endpoint."""
    return HealthCheckResponse(
        service="kbservice",
        status="healthy",
        timestamp=datetime.now(timezone.utc),
        version="1.0.0"
    )


@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Health check endpoint."""
    db_status = await check_database_health()
    
    return HealthCheckResponse(
        service="kbservice",
        status="healthy" if db_status else "unhealthy",
        timestamp=datetime.now(timezone.utc),
        version="1.0.0",
        database_status="connected" if db_status else "disconnected"
    )


# Include routers
app.include_router(kb_router.router, prefix="/api/v1/kb", tags=["Knowledge Base"])
app.include_router(admin_kb_router, prefix="/api/v1/kb/admin", tags=["Admin Knowledge Base"])
app.include_router(pdf_router, prefix="/api/v1/pdf", tags=["PDF Processing"])
app.include_router(search_router.router, prefix="/api/v1/kb", tags=["Search"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8006, reload=True)
