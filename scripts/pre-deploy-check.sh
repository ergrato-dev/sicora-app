#!/bin/bash
# =============================================================================
# SICORA - Script de Verificación Pre-Deploy
# =============================================================================
# Este script verifica que toda la infraestructura, backend y frontend
# estén funcionando correctamente antes del deploy.
#
# Uso: ./pre-deploy-check.sh [--full] [--quick]
#   --full  : Ejecuta todas las verificaciones incluyendo tests
#   --quick : Solo verifica health checks básicos
# =============================================================================

set -e

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Contadores
PASSED=0
FAILED=0
WARNINGS=0

# Configuración
API_GATEWAY_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

# Función para imprimir encabezado
print_header() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
}

# Función para verificar servicio HTTP
check_http_service() {
    local name=$1
    local url=$2
    local expected_code=${3:-200}
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 5 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_code" ]; then
        echo -e "${GREEN}✓${NC} $name - OK (HTTP $response)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $name - FAILED (HTTP $response, expected $expected_code)"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar contenedor Docker
check_container() {
    local name=$1
    local container=$2
    
    if docker ps --format '{{.Names}}' | grep -q "^${container}$" 2>/dev/null; then
        status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "running")
        echo -e "${GREEN}✓${NC} $name - Running ($status)"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $name - Container not running"
        ((FAILED++))
        return 1
    fi
}

# Función para verificar base de datos
check_postgres() {
    if docker exec sicora_postgres pg_isready -U postgres > /dev/null 2>&1; then
        # Verificar conexión a la base de datos
        if docker exec sicora_postgres psql -U postgres -d sicora_dev -c "SELECT 1" > /dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} PostgreSQL - OK (conexión verificada)"
            ((PASSED++))
            return 0
        fi
    fi
    echo -e "${RED}✗${NC} PostgreSQL - FAILED"
    ((FAILED++))
    return 1
}

check_redis() {
    response=$(docker exec sicora_redis redis-cli ping 2>/dev/null || echo "FAIL")
    if [ "$response" = "PONG" ]; then
        echo -e "${GREEN}✓${NC} Redis - OK (PONG)"
        ((PASSED++))
        return 0
    fi
    echo -e "${RED}✗${NC} Redis - FAILED"
    ((FAILED++))
    return 1
}

check_mongodb() {
    if docker exec sicora_mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; then
        echo -e "${GREEN}✓${NC} MongoDB - OK"
        ((PASSED++))
        return 0
    fi
    echo -e "${RED}✗${NC} MongoDB - FAILED"
    ((FAILED++))
    return 1
}

# Función para probar login
test_login() {
    local email=${1:-"admin@sicora.edu.co"}
    local password=${2:-"Admin123!"}
    
    response=$(curl -s -X POST "${API_GATEWAY_URL}/api/v1/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\": \"${email}\", \"password\": \"${password}\"}" \
        --max-time 10 2>/dev/null)
    
    if echo "$response" | grep -q "access_token"; then
        echo -e "${GREEN}✓${NC} Login Integration - OK"
        # Extraer y guardar token para pruebas posteriores
        TOKEN=$(echo "$response" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
        export TOKEN
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} Login Integration - FAILED"
        echo -e "   ${YELLOW}Response: $(echo "$response" | head -c 100)${NC}"
        ((FAILED++))
        return 1
    fi
}

# Función para probar endpoint autenticado
test_authenticated_endpoint() {
    local name=$1
    local endpoint=$2
    
    if [ -z "$TOKEN" ]; then
        echo -e "${YELLOW}⚠${NC} $name - Skipped (no token)"
        ((WARNINGS++))
        return 0
    fi
    
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        "${API_GATEWAY_URL}${endpoint}" \
        -H "Authorization: Bearer $TOKEN" \
        --max-time 10 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        echo -e "${GREEN}✓${NC} $name - OK"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} $name - FAILED (HTTP $response)"
        ((FAILED++))
        return 1
    fi
}

# =============================================================================
# MAIN
# =============================================================================

print_header "SICORA - Pre-Deploy Verification"

echo -e "${BLUE}Fecha: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}Host: $(hostname)${NC}"
echo ""

# Parse argumentos
FULL_CHECK=false
QUICK_CHECK=false

for arg in "$@"; do
    case $arg in
        --full)
            FULL_CHECK=true
            ;;
        --quick)
            QUICK_CHECK=true
            ;;
    esac
done

# -----------------------------------------------------------------------------
# FASE 1: Verificar Docker
# -----------------------------------------------------------------------------
print_header "FASE 1: Verificando Docker"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}✗${NC} Docker no está instalado"
    exit 1
fi

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Docker daemon no está corriendo"
    exit 1
fi

echo -e "${GREEN}✓${NC} Docker daemon - OK"
((PASSED++))

# -----------------------------------------------------------------------------
# FASE 2: Verificar Bases de Datos
# -----------------------------------------------------------------------------
print_header "FASE 2: Verificando Bases de Datos"

check_postgres
check_redis
check_mongodb

# -----------------------------------------------------------------------------
# FASE 3: Verificar Backend Services
# -----------------------------------------------------------------------------
print_header "FASE 3: Verificando Backend Services"

check_http_service "User Service" "http://localhost:8001/health"
check_http_service "Schedule Service" "http://localhost:8002/health"
check_http_service "Attendance Service" "http://localhost:8003/health"
check_http_service "Evalin Service" "http://localhost:8030/health"
check_http_service "KB Service" "http://localhost:8005/health"
check_http_service "AI Service" "http://localhost:8006/health"
check_http_service "API Gateway" "http://localhost:8000/health"

# -----------------------------------------------------------------------------
# FASE 4: Verificar Frontend
# -----------------------------------------------------------------------------
print_header "FASE 4: Verificando Frontend"

check_http_service "Frontend (Next.js)" "http://localhost:3000"

# -----------------------------------------------------------------------------
# FASE 5: Pruebas de Integración
# -----------------------------------------------------------------------------
if [ "$QUICK_CHECK" = false ]; then
    print_header "FASE 5: Pruebas de Integración"
    
    test_login
    
    if [ -n "$TOKEN" ]; then
        test_authenticated_endpoint "GET /users/me" "/api/v1/auth/me"
        test_authenticated_endpoint "GET /users" "/api/v1/users?page=1&limit=5"
        test_authenticated_endpoint "GET /schedules" "/api/v1/schedules?page=1&limit=5"
        test_authenticated_endpoint "GET /attendance" "/api/v1/attendance?page=1&limit=5"
    fi
fi

# -----------------------------------------------------------------------------
# FASE 6: Tests Automatizados (solo con --full)
# -----------------------------------------------------------------------------
if [ "$FULL_CHECK" = true ]; then
    print_header "FASE 6: Tests Automatizados"
    
    echo -e "${BLUE}Ejecutando tests de frontend...${NC}"
    
    cd "$(dirname "$0")/../sicora-app-fe-next" || {
        echo -e "${RED}✗${NC} No se pudo acceder al directorio del frontend"
        ((FAILED++))
    }
    
    if pnpm test --run 2>/dev/null; then
        echo -e "${GREEN}✓${NC} Tests de Frontend - OK"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} Tests de Frontend - FAILED"
        ((FAILED++))
    fi
    
    cd - > /dev/null
fi

# -----------------------------------------------------------------------------
# RESUMEN
# -----------------------------------------------------------------------------
print_header "RESUMEN"

TOTAL=$((PASSED + FAILED + WARNINGS))

echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${BLUE}Total:${NC}    $TOTAL"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  ✓ SISTEMA LISTO PARA DEPLOY${NC}"
    echo -e "${GREEN}========================================${NC}"
    exit 0
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}  ✗ HAY $FAILED VERIFICACIONES FALLIDAS${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Revisa los servicios que fallaron antes de continuar.${NC}"
    exit 1
fi
