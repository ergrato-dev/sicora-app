#!/bin/bash

# =============================================================================
# Script para ejecutar análisis SonarQube en SICORA
# Versión: 2.0 - Enero 2026
# =============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Detectar directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Configuración
SONAR_HOST="${SONAR_HOST_URL:-http://localhost:9000}"
GO_SERVICES=("userservice" "scheduleservice" "kbservice" "evalinservice" "mevalservice" "projectevalservice" "attendanceservice" "apigateway")
PYTHON_SERVICES=("userservice" "scheduleservice" "evalinservice" "attendanceservice" "kbservice" "projectevalservice" "apigateway" "aiservice" "mevalservice")

# Verificar si sonar-scanner está instalado
check_sonar_scanner() {
    if ! command -v sonar-scanner &> /dev/null; then
        echo -e "${RED}❌ sonar-scanner no encontrado${NC}"
        echo -e "${YELLOW}Opciones de instalación:${NC}"
        echo "  1. brew install sonar-scanner (macOS)"
        echo "  2. https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/"
        echo "  3. Docker: docker run --rm -v \"\$PWD:/usr/src\" sonarsource/sonar-scanner-cli"
        exit 1
    fi
}

# Verificar si SonarQube está corriendo
check_sonar_server() {
    echo -e "${BLUE}🔍 Verificando servidor SonarQube en $SONAR_HOST...${NC}"
    if curl -sf "$SONAR_HOST/api/system/status" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ SonarQube está disponible${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  SonarQube no está disponible en $SONAR_HOST${NC}"
        echo -e "${YELLOW}   Iniciar con: cd sicora-infra/docker && docker compose -f docker-compose.sonarqube.yml up -d${NC}"
        return 1
    fi
}

# Función para análisis global
run_global_analysis() {
    echo -e "${BLUE}🌐 Ejecutando análisis SonarQube global...${NC}"
    
    check_sonar_scanner
    check_sonar_server || return 1
    
    cd "$PROJECT_ROOT"
    
    if [ -n "$SONAR_TOKEN" ]; then
        sonar-scanner -Dsonar.token="$SONAR_TOKEN"
    else
        echo -e "${YELLOW}⚠️  SONAR_TOKEN no definido, usando autenticación por defecto${NC}"
        sonar-scanner
    fi
    
    echo -e "${GREEN}✅ Análisis global completado${NC}"
    echo -e "${BLUE}📊 Ver resultados en: $SONAR_HOST/dashboard?id=sicora-multistack${NC}"
}

# Función para análisis individual
run_service_analysis() {
    local service_type=$1
    local service_name=$2
    
    check_sonar_scanner
    check_sonar_server || return 1
    
    echo -e "${BLUE}🔍 Ejecutando análisis para $service_name ($service_type)...${NC}"
    
    local service_dir=""
    if [ "$service_type" = "go" ]; then
        service_dir="$PROJECT_ROOT/sicora-be-go/$service_name"
    elif [ "$service_type" = "python" ]; then
        service_dir="$PROJECT_ROOT/sicora-be-python/$service_name"
    else
        echo -e "${RED}❌ Tipo de servicio inválido: $service_type (usar 'go' o 'python')${NC}"
        return 1
    fi
    
    if [ ! -d "$service_dir" ]; then
        echo -e "${RED}❌ Servicio no encontrado: $service_dir${NC}"
        return 1
    fi
    
    cd "$service_dir"
    
    if [ -f "sonar-project.properties" ]; then
        if [ -n "$SONAR_TOKEN" ]; then
            sonar-scanner -Dsonar.token="$SONAR_TOKEN"
        else
            sonar-scanner
        fi
        echo -e "${GREEN}✅ Análisis completado para $service_name${NC}"
    else
        echo -e "${RED}❌ sonar-project.properties no encontrado en $service_dir${NC}"
        return 1
    fi
}

# Función de ayuda
show_help() {
    echo -e "${PURPLE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║          SICORA SonarQube Analysis Tool v2.0               ║${NC}"
    echo -e "${PURPLE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Uso: $0 [comando] [opciones]"
    echo ""
    echo -e "${BLUE}Comandos:${NC}"
    echo "  global                    Ejecutar análisis global del proyecto"
    echo "  service <tipo> <nombre>   Ejecutar análisis de servicio específico"
    echo "  list                      Mostrar servicios disponibles"
    echo "  status                    Verificar estado de SonarQube"
    echo "  start                     Iniciar SonarQube con Docker"
    echo "  stop                      Detener SonarQube"
    echo "  help                      Mostrar esta ayuda"
    echo ""
    echo -e "${BLUE}Variables de entorno:${NC}"
    echo "  SONAR_TOKEN       Token de autenticación"
    echo "  SONAR_HOST_URL    URL del servidor (default: http://localhost:9000)"
    echo ""
    echo -e "${BLUE}Ejemplos:${NC}"
    echo "  $0 global"
    echo "  $0 service go userservice"
    echo "  $0 service python apigateway"
    echo "  SONAR_TOKEN=xxx $0 global"
}

# Función para listar servicios
list_services() {
    echo -e "${BLUE}📋 Servicios disponibles para análisis:${NC}"
    echo ""
    echo -e "${GREEN}Go Services (sicora-be-go):${NC}"
    for svc in "${GO_SERVICES[@]}"; do
        if [ -d "$PROJECT_ROOT/sicora-be-go/$svc" ]; then
            if [ -f "$PROJECT_ROOT/sicora-be-go/$svc/sonar-project.properties" ]; then
                echo -e "  ${GREEN}✅${NC} $svc"
            else
                echo -e "  ${YELLOW}⚠️${NC} $svc (sin sonar-project.properties)"
            fi
        fi
    done
    echo ""
    echo -e "${GREEN}Python Services (sicora-be-python):${NC}"
    for svc in "${PYTHON_SERVICES[@]}"; do
        if [ -d "$PROJECT_ROOT/sicora-be-python/$svc" ]; then
            if [ -f "$PROJECT_ROOT/sicora-be-python/$svc/sonar-project.properties" ]; then
                echo -e "  ${GREEN}✅${NC} $svc"
            else
                echo -e "  ${YELLOW}⚠️${NC} $svc (sin sonar-project.properties)"
            fi
        fi
    done
}

# Función para verificar estado
check_status() {
    echo -e "${BLUE}🔍 Estado de SonarQube:${NC}"
    if check_sonar_server; then
        local status=$(curl -sf "$SONAR_HOST/api/system/status" 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        echo -e "  Estado: ${GREEN}$status${NC}"
        echo -e "  URL: $SONAR_HOST"
    fi
}

# Función para iniciar SonarQube
start_sonar() {
    echo -e "${BLUE}🚀 Iniciando SonarQube...${NC}"
    cd "$PROJECT_ROOT/sicora-infra/docker"
    docker compose -f docker-compose.sonarqube.yml up -d
    echo -e "${GREEN}✅ SonarQube iniciado${NC}"
    echo -e "${YELLOW}⏳ Esperar ~2 minutos para que inicie completamente${NC}"
    echo -e "${BLUE}📊 Dashboard: http://localhost:9000 (admin/admin)${NC}"
}

# Función para detener SonarQube
stop_sonar() {
    echo -e "${BLUE}🛑 Deteniendo SonarQube...${NC}"
    cd "$PROJECT_ROOT/sicora-infra/docker"
    docker compose -f docker-compose.sonarqube.yml down
    echo -e "${GREEN}✅ SonarQube detenido${NC}"
}

# Procesamiento de argumentos
case "${1:-help}" in
    "global")
        run_global_analysis
        ;;
    "service")
        if [ $# -ne 3 ]; then
            echo -e "${RED}❌ Uso: $0 service <tipo> <nombre>${NC}"
            echo -e "${YELLOW}   Tipos válidos: go, python${NC}"
            exit 1
        fi
        run_service_analysis "$2" "$3"
        ;;
    "list")
        list_services
        ;;
    "status")
        check_status
        ;;
    "start")
        start_sonar
        ;;
    "stop")
        stop_sonar
        ;;
    "help"|*)
        show_help
        ;;
esac
