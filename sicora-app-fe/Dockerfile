# =============================================================================
# SICORA Frontend - Production Dockerfile
# Multi-stage build: Node (build) → Nginx (serve)
# =============================================================================

# Stage 1: Build
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build for production
RUN pnpm build

# Stage 2: Production
FROM nginx:alpine AS production

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Expose port
EXPOSE 80

# Labels
LABEL org.opencontainers.image.title="SICORA Frontend" \
      org.opencontainers.image.description="Sistema de Información de Coordinación Académica - Frontend" \
      org.opencontainers.image.vendor="OneVision"

CMD ["nginx", "-g", "daemon off;"]
