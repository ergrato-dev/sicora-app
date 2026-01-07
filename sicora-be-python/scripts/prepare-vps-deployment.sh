#!/bin/bash
# Script para preparar el despliegue de SICORA Backend en VPS Hostinger
# Este script prepara todos los archivos necesarios para el deployment

set -e  # Salir en caso de error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Variables
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
DEPLOYMENT_PACKAGE="sicora-backend-deployment-$(date +%Y%m%d_%H%M%S).tar.gz"
TEMP_DIR="/tmp/sicora-deployment-prep"

log "🚀 Preparando despliegue de SICORA Backend para VPS Hostinger"
log "📁 Directorio del proyecto: $PROJECT_ROOT"
log "📦 Paquete de deployment: $DEPLOYMENT_PACKAGE"

# Verificar que estamos en el directorio correcto
if [ ! -f "$PROJECT_ROOT/pyproject.toml" ]; then
    log_error "No se encontró pyproject.toml. Asegúrate de ejecutar desde sicora-be-python/"
    exit 1
fi

# Función para verificar prerequisitos
check_prerequisites() {
    log "🔍 Verificando prerequisitos..."

    # Verificar que Docker esté instalado (para build local si es necesario)
    if ! command -v docker &> /dev/null; then
        log_warning "Docker no está instalado. Se necesitará en el VPS."
    else
        log_success "Docker encontrado: $(docker --version)"
    fi

    # Verificar archivos críticos
    local required_files=(
        "pyproject.toml"
        "deployment/deploy.sh"
        "deployment/docker-compose.production.yml"
        "shared/config.py"
        ".env.production"
    )

    for file in "${required_files[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            log_success "✓ $file"
        else
            log_error "✗ $file no encontrado"
            exit 1
        fi
    done
}

# Función para ejecutar tests
run_tests() {
    log "🧪 Ejecutando tests de integración..."

    cd "$PROJECT_ROOT"

    # Verificar que el entorno de tests esté configurado
    if [ ! -f ".env.testing" ]; then
        log_error "Archivo .env.testing no encontrado"
        exit 1
    fi

    # Ejecutar tests de integración
    if make test-integration; then
        log_success "Todos los tests de integración pasaron"
    else
        log_error "Los tests de integración fallaron. No se puede continuar con el deployment."
        exit 1
    fi
}

# Función para validar configuraciones
validate_configs() {
    log "⚙️ Validando configuraciones..."

    cd "$PROJECT_ROOT"

    # Validar todas las configuraciones
    if python scripts/config_manager.py validate-all; then
        log_success "Todas las configuraciones son válidas"
    else
        log_warning "Algunas configuraciones tienen problemas. Continuando con deployment..."
    fi

    # Verificar configuración de producción específicamente
    if python scripts/config_manager.py validate production; then
        log_success "Configuración de producción válida"
    else
        log_warning "Configuración de producción no disponible. Usando template."
    fi
}

# Función para crear Dockerfiles específicos
create_dockerfiles() {
    log "🐳 Creando Dockerfiles para deployment..."

    # Dockerfile para API Gateway
    cat > "$PROJECT_ROOT/deployment/Dockerfile.apigateway" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY pyproject.toml requirements-dev.txt ./

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copiar código fuente
COPY shared/ ./shared/
COPY apigateway/ ./apigateway/

# Crear usuario no-root
RUN useradd --create-home --shell /bin/bash sicora
RUN chown -R sicora:sicora /app
USER sicora

# Exponer puerto
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Comando de inicio
CMD ["uvicorn", "apigateway.main:app", "--host", "0.0.0.0", "--port", "8000"]
EOF

    # Dockerfile para Notification Service
    cat > "$PROJECT_ROOT/deployment/Dockerfile.notification" << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY pyproject.toml requirements-dev.txt ./

# Instalar dependencias Python
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copiar código fuente
COPY shared/ ./shared/
COPY notificationservice-template/ ./notificationservice-template/

# Crear usuario no-root
RUN useradd --create-home --shell /bin/bash sicora
RUN chown -R sicora:sicora /app
USER sicora

# Exponer puerto
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Comando de inicio
CMD ["uvicorn", "notificationservice-template.main:app", "--host", "0.0.0.0", "--port", "8001"]
EOF

    log_success "Dockerfiles creados"
}

# Función para crear configuración de Traefik (reemplaza Nginx)
create_traefik_config() {
    log "🔀 Creando configuración de Traefik..."

    mkdir -p "$PROJECT_ROOT/deployment/traefik"
    mkdir -p "$PROJECT_ROOT/deployment/traefik/dynamic"

    # Traefik static config
    cat > "$PROJECT_ROOT/deployment/traefik/traefik.yml" << 'EOF'
# =============================================================================
# SICORA - Traefik Static Configuration (VPS Deployment)
# =============================================================================
api:
  dashboard: true
  insecure: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: sicora-network
  file:
    directory: "/etc/traefik/dynamic"
    watch: true

certificatesResolvers:
  letsencrypt:
    acme:
      email: "admin@tudominio.com"  # CAMBIAR
      storage: "/letsencrypt/acme.json"
      httpChallenge:
        entryPoint: web

log:
  level: INFO
  filePath: "/var/log/traefik/traefik.log"

accessLog:
  filePath: "/var/log/traefik/access.log"
EOF

    # Traefik dynamic middlewares
    cat > "$PROJECT_ROOT/deployment/traefik/dynamic/middlewares.yml" << 'EOF'
http:
  middlewares:
    rate-limit:
      rateLimit:
        average: 100
        burst: 50
        period: 1m
    secure-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
        frameDeny: true
    compress:
      compress: {}
EOF

    log_success "Configuración de Traefik creada en deployment/traefik/"
    log_info "📚 Referencia completa: sicora-infra/traefik/"
}

# Función para crear scripts de monitoreo
create_monitoring_scripts() {
    log "📊 Creando scripts de monitoreo..."

    # Script de monitoreo básico
    cat > "$PROJECT_ROOT/deployment/monitor-sicora.sh" << 'EOF'
#!/bin/bash
# Script de monitoreo para SICORA Backend

echo "=== SICORA Backend Status Report ==="
echo "Fecha: $(date)"
echo "Hostname: $(hostname)"
echo ""

echo "=== Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "=== Health Checks ==="
API_HEALTH=$(curl -s http://localhost:8000/health 2>/dev/null || echo "FAILED")
NOTIFICATION_HEALTH=$(curl -s http://localhost:8001/health 2>/dev/null || echo "FAILED")

if [[ "$API_HEALTH" == *"ok"* ]]; then
    echo "✅ API Gateway: OK"
else
    echo "❌ API Gateway: FAILED"
fi

if [[ "$NOTIFICATION_HEALTH" == *"ok"* ]]; then
    echo "✅ Notification Service: OK"
else
    echo "❌ Notification Service: FAILED"
fi

echo ""
echo "=== System Resources ==="
echo "Memoria:"
free -h
echo ""
echo "Disco:"
df -h / /var
echo ""
echo "CPU Load:"
uptime

echo ""
echo "=== Recent Docker Logs (Last 5 lines) ==="
echo "--- API Gateway ---"
docker logs --tail 5 sicora-backend_apigateway_1 2>/dev/null || echo "Container not found"
echo ""
echo "--- Notification Service ---"
docker logs --tail 5 sicora-backend_notification_1 2>/dev/null || echo "Container not found"
echo ""
echo "--- PostgreSQL ---"
docker logs --tail 5 sicora-backend_postgres_1 2>/dev/null || echo "Container not found"

echo ""
echo "=== Network Status ==="
echo "Traefik Status: $(docker ps --filter name=traefik --format '{{.Status}}' 2>/dev/null || echo 'not-running')"
echo "Listening Ports:"
netstat -tlnp 2>/dev/null | grep -E ':(80|443|8000|8001|5432|6379)' || ss -tlnp | grep -E ':(80|443|8000|8001|5432|6379)'
EOF

    # Script de backup
    cat > "$PROJECT_ROOT/deployment/backup-sicora.sh" << 'EOF'
#!/bin/bash
# Script de backup para SICORA Backend

BACKUP_DIR="$HOME/sicora-backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Crear directorio de backups si no existe
mkdir -p "$BACKUP_DIR"

echo "🔄 Iniciando backup de SICORA Backend..."

# Backup de base de datos
echo "📊 Creando backup de base de datos..."
docker exec sicora-backend_postgres_1 pg_dump -U sicora_user sicora_production > "$BACKUP_DIR/db_backup_$DATE.sql"

if [ $? -eq 0 ]; then
    echo "✅ Backup de base de datos completado: db_backup_$DATE.sql"
else
    echo "❌ Error en backup de base de datos"
fi

# Backup de logs
echo "📝 Creando backup de logs..."
mkdir -p "$BACKUP_DIR/logs_$DATE"

docker logs sicora-backend_apigateway_1 > "$BACKUP_DIR/logs_$DATE/apigateway.log" 2>&1
docker logs sicora-backend_notification_1 > "$BACKUP_DIR/logs_$DATE/notification.log" 2>&1
docker logs sicora-backend_postgres_1 > "$BACKUP_DIR/logs_$DATE/postgres.log" 2>&1
docker logs sicora-backend_redis_1 > "$BACKUP_DIR/logs_$DATE/redis.log" 2>&1

# Backup de configuración
echo "⚙️ Creando backup de configuración..."
cp -r ~/sicora-backend/deployment "$BACKUP_DIR/config_$DATE/"
cp ~/sicora-backend/.env.production "$BACKUP_DIR/config_$DATE/" 2>/dev/null || echo "No .env.production found"

# Comprimir backups
echo "🗜️ Comprimiendo backups..."
tar -czf "$BACKUP_DIR/sicora_backup_$DATE.tar.gz" \
    "$BACKUP_DIR/db_backup_$DATE.sql" \
    "$BACKUP_DIR/logs_$DATE/" \
    "$BACKUP_DIR/config_$DATE/"

# Limpiar archivos temporales
rm -f "$BACKUP_DIR/db_backup_$DATE.sql"
rm -rf "$BACKUP_DIR/logs_$DATE/"
rm -rf "$BACKUP_DIR/config_$DATE/"

echo "✅ Backup completado: sicora_backup_$DATE.tar.gz"

# Limpiar backups antiguos (mantener solo 7 días)
find "$BACKUP_DIR" -name "sicora_backup_*.tar.gz" -mtime +7 -delete

echo "🧹 Backups antiguos limpiados"
EOF

    # Hacer scripts ejecutables
    chmod +x "$PROJECT_ROOT/deployment/monitor-sicora.sh"
    chmod +x "$PROJECT_ROOT/deployment/backup-sicora.sh"

    log_success "Scripts de monitoreo creados"
}

# Función para crear archivo de variables de entorno de ejemplo
create_env_template() {
    log "📄 Creando template de variables de entorno..."

    cat > "$PROJECT_ROOT/deployment/.env.production.template" << 'EOF'
# Template de configuración para producción en VPS
# Copia este archivo a .env.production y edita los valores

# Entorno
ENVIRONMENT=production

# Base de datos PostgreSQL
# IMPORTANTE: Cambia la contraseña por una segura
DATABASE_URL=postgresql+asyncpg://sicora_user:CAMBIAR_CONTRASEÑA_SEGURA@postgres:5432/sicora_production
POSTGRES_PASSWORD=CAMBIAR_CONTRASEÑA_SEGURA

# Redis
REDIS_URL=redis://redis:6379/0

# Seguridad
# IMPORTANTE: Genera una clave secreta segura de al menos 32 caracteres
SECRET_KEY=CAMBIAR_POR_CLAVE_SECRETA_DE_32_CARACTERES_O_MAS

# API Gateway
APIGATEWAY_HOST=0.0.0.0
APIGATEWAY_PORT=8000

# Notification Service
NOTIFICATION_HOST=0.0.0.0
NOTIFICATION_PORT=8001

# Logs
LOG_LEVEL=INFO

# Configuración de CORS (opcional)
ALLOWED_ORIGINS=["http://localhost:3000","https://tu-dominio.com"]

# Configuración de base de datos adicional
DB_POOL_SIZE=10
DB_MAX_OVERFLOW=20
DB_POOL_TIMEOUT=30

# Configuración de Redis adicional
REDIS_MAX_CONNECTIONS=10
REDIS_SOCKET_TIMEOUT=5

# Configuración de seguridad adicional
SESSION_TIMEOUT=3600
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_PER_MINUTE=60
EOF

    log_success "Template de variables de entorno creado"
}

# Función para crear documentación de deployment
create_deployment_docs() {
    log "📚 Creando documentación de deployment..."

    cat > "$PROJECT_ROOT/deployment/DEPLOYMENT_CHECKLIST.md" << 'EOF'
# ✅ Checklist de Deployment SICORA Backend

## Pre-Deployment
- [ ] Tests de integración pasan localmente
- [ ] Configuraciones validadas
- [ ] Variables de entorno configuradas
- [ ] Paquete de deployment creado

## VPS Setup
- [ ] Ubuntu actualizado
- [ ] Docker instalado
- [ ] Docker Compose instalado
- [ ] Traefik configurado (via Docker)
- [ ] Firewall configurado (puertos 22, 80, 443)
- [ ] Usuario con permisos docker

## Deployment
- [ ] Archivos transferidos al VPS
- [ ] Variables de entorno configuradas
- [ ] Servicios desplegados con docker-compose
- [ ] Traefik configurado (SSL automático con Let's Encrypt)
- [ ] Dashboard Traefik accesible

## Validation
- [ ] Health checks responden
- [ ] Documentación Swagger accesible
- [ ] Base de datos conecta
- [ ] Redis funciona
- [ ] Logs sin errores críticos

## Monitoring Setup
- [ ] Scripts de monitoreo instalados
- [ ] Backups automáticos configurados
- [ ] Cron jobs configurados
- [ ] Alertas básicas configuradas

## URLs a Validar
- [ ] http://TU_DOMINIO/health/api
- [ ] http://TU_DOMINIO/health/notification
- [ ] http://TU_DOMINIO/api/docs
- [ ] http://TU_DOMINIO/notifications/docs

## Post-Deployment
- [ ] Monitoreo funcionando
- [ ] Backup inicial creado
- [ ] Documentación actualizada
- [ ] Frontend puede conectar
EOF

    log_success "Documentación de deployment creada"
}

# Función para preparar el paquete de deployment
prepare_deployment_package() {
    log "📦 Preparando paquete de deployment..."

    # Crear directorio temporal
    rm -rf "$TEMP_DIR"
    mkdir -p "$TEMP_DIR"

    # Copiar archivos necesarios
    cp -r "$PROJECT_ROOT/deployment" "$TEMP_DIR/"
    cp -r "$PROJECT_ROOT/scripts" "$TEMP_DIR/"
    cp -r "$PROJECT_ROOT/shared" "$TEMP_DIR/"
    cp -r "$PROJECT_ROOT/apigateway" "$TEMP_DIR/"
    cp -r "$PROJECT_ROOT/notificationservice-template" "$TEMP_DIR/"
    cp "$PROJECT_ROOT/pyproject.toml" "$TEMP_DIR/"
    cp "$PROJECT_ROOT/requirements-dev.txt" "$TEMP_DIR/"

    # Copiar archivo de entorno de producción
    if [ -f "$PROJECT_ROOT/.env.production" ]; then
        cp "$PROJECT_ROOT/.env.production" "$TEMP_DIR/"
    else
        log_warning "Archivo .env.production no encontrado. Usando template."
        cp "$TEMP_DIR/deployment/.env.production.template" "$TEMP_DIR/.env.production"
    fi

    # Crear README para el paquete
    cat > "$TEMP_DIR/README_DEPLOYMENT.md" << 'EOF'
# SICORA Backend Deployment Package

Este paquete contiene todos los archivos necesarios para desplegar SICORA Backend en un VPS.

## Contenido
- `deployment/` - Scripts y configuraciones de deployment
- `scripts/` - Scripts de utilidades
- `shared/` - Código compartido
- `apigateway/` - Servicio API Gateway
- `notificationservice-template/` - Servicio de notificaciones
- `pyproject.toml` - Configuración de proyecto Python
- `requirements-dev.txt` - Dependencias Python
- `.env.production` - Variables de entorno de producción

## Deployment Rápido
1. Extraer este paquete en el VPS
2. Editar `.env.production` con valores reales
3. Configurar Traefik: editar `deployment/traefik/traefik.yml` (email SSL)
4. Ejecutar: `docker compose -f docker-compose.traefik.yml up -d`

## Documentación Completa
Ver el archivo `deployment/DEPLOYMENT_CHECKLIST.md` para instrucciones detalladas.
EOF

    # Crear el paquete tar.gz
    cd "$TEMP_DIR"
    tar -czf "$PROJECT_ROOT/$DEPLOYMENT_PACKAGE" .

    # Limpiar directorio temporal
    rm -rf "$TEMP_DIR"

    log_success "Paquete de deployment creado: $DEPLOYMENT_PACKAGE"
}

# Función para mostrar instrucciones finales
show_final_instructions() {
    log_info "🎉 Preparación completada!"
    echo ""
    echo "📦 Paquete de deployment: $DEPLOYMENT_PACKAGE"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Transferir el paquete al VPS:"
    echo "   scp $DEPLOYMENT_PACKAGE usuario@TU_IP_VPS:~/"
    echo ""
    echo "2. En el VPS, extraer y desplegar:"
    echo "   mkdir -p ~/sicora-backend"
    echo "   cd ~/sicora-backend"
    echo "   tar -xzf ~/$DEPLOYMENT_PACKAGE"
    echo "   nano .env.production  # Editar variables de entorno"
    echo "   ./deployment/deploy.sh production"
    echo ""
    echo "3. Configurar Traefik:"
    echo "   nano deployment/traefik/traefik.yml  # Editar email para SSL"
    echo "   docker compose -f docker-compose.traefik.yml up -d"
    echo ""
    echo "4. Validar endpoints:"
    echo "   curl http://TU_IP/health/api"
    echo "   curl http://TU_IP/health/notification"
    echo ""
    echo "📚 Ver documentación completa en:"
    echo "   _docs/desarrollo/GUIA_DESPLIEGUE_VPS_HOSTINGER.md"
    echo ""
    log_warning "⚠️  IMPORTANTE: Edita las variables de entorno en .env.production antes de desplegar"
}

# Función principal
main() {
    log "🚀 Iniciando preparación de deployment..."

    check_prerequisites
    run_tests
    validate_configs
    create_dockerfiles
    create_traefik_config
    create_monitoring_scripts
    create_env_template
    create_deployment_docs
    prepare_deployment_package
    show_final_instructions

    log_success "✅ Preparación de deployment completada exitosamente!"
}

# Ejecutar función principal
main "$@"
