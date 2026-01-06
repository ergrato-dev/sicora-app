# =============================================================================
# SICORA Backend Go - Production Dockerfile
# Multi-stage build: compila todos los microservicios en un solo contenedor
# =============================================================================

# Stage 1: Build
FROM golang:1.25-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# Copy go workspace files
COPY go.work go.work.sum ./
COPY go.mod ./

# Copy all service modules
COPY attendanceservice/ ./attendanceservice/
COPY evalinservice/ ./evalinservice/
COPY kbservice/ ./kbservice/
COPY mevalservice/ ./mevalservice/
COPY projectevalservice/ ./projectevalservice/
COPY scheduleservice/ ./scheduleservice/
COPY userservice/ ./userservice/

# Download dependencies
RUN go work sync && go mod download

# Build servicios funcionales
# TODO: agregar más servicios cuando estén listos (swag docs, archivos completos)
RUN cd attendanceservice && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/attendanceservice ./cmd/server/
RUN cd projectevalservice && CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/projectevalservice ./cmd/server/

# Stage 2: Production
FROM alpine:3.19 AS production

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata supervisor

# Create non-root user
RUN addgroup -g 1001 -S sicora && \
    adduser -u 1001 -S sicora -G sicora

WORKDIR /app

# Copy binaries from builder (2 servicios funcionales)
COPY --from=builder /bin/attendanceservice /app/
COPY --from=builder /bin/projectevalservice /app/

# Copy supervisor config
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create log directory
RUN mkdir -p /var/log/sicora && chown -R sicora:sicora /var/log/sicora

# Health check - verifica userservice como proxy de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Expose main port (API Gateway)
EXPOSE 8080

# Labels
LABEL org.opencontainers.image.title="SICORA Backend Go" \
      org.opencontainers.image.description="Microservicios Go consolidados" \
      org.opencontainers.image.vendor="OneVision"

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
