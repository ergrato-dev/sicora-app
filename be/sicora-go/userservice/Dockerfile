# Build stage
FROM golang:1.25-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy service go.mod and go.sum first
COPY userservice/go.mod userservice/go.sum ./

# Copy shared packages
COPY pkg/ ./pkg/

# Add replace directives and require the modules
RUN go mod edit -replace sicora-go/pkg/errors=./pkg/errors && \
    go mod edit -replace sicora-go/pkg/cache=./pkg/cache && \
    go mod edit -replace sicora-go/pkg/jobs=./pkg/jobs && \
    go get sicora-go/pkg/errors && \
    go get sicora-go/pkg/cache && \
    go get sicora-go/pkg/jobs

# Download dependencies (with replace directives now active)
RUN go mod download

# Copy service source code EXCEPT go.mod/go.sum (already copied with replaces)
COPY userservice/cmd ./cmd
COPY userservice/internal ./internal
COPY userservice/docs ./docs

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Final stage
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates tzdata curl

# Set timezone to Colombia
RUN ln -sf /usr/share/zoneinfo/America/Bogota /etc/localtime

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Change ownership of the app directory
RUN chown -R appuser:appgroup /root/

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Run the binary
CMD ["./main"]