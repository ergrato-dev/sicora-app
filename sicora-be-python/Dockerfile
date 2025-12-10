# =============================================================================
# SICORA Backend Python - Production Dockerfile
# Multi-stage build con Python 3.12 + FastAPI + Uvicorn
# =============================================================================

# Stage 1: Build
FROM python:3.12-slim AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Stage 2: Production
FROM python:3.12-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user
RUN groupadd -g 1001 sicora && \
    useradd -u 1001 -g sicora -s /bin/bash -m sicora

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY --chown=sicora:sicora . .

# Remove unnecessary files
RUN rm -rf tests/ .devcontainer/ _docs/ scripts/ *.tar.gz .env.* \
    requirements-dev.txt Makefile setup.cfg .flake8 .pylintrc .pycodestyle

# Create log directory
RUN mkdir -p /var/log/sicora && chown -R sicora:sicora /var/log/sicora

# Switch to non-root user
USER sicora

# Environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Expose port
EXPOSE 8000

# Labels
LABEL org.opencontainers.image.title="SICORA Backend Python" \
      org.opencontainers.image.description="FastAPI backend services" \
      org.opencontainers.image.vendor="OneVision"

# Start with uvicorn
CMD ["uvicorn", "apigateway.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
