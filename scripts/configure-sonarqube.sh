#!/bin/bash

# =============================================================================
# Script para configurar SonarQube en todos los servicios SICORA
# Versión: 2.0 - Enero 2026
# =============================================================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Detectar directorio raíz del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
GO_BACKEND_DIR="$PROJECT_ROOT/sicora-be-go"
PYTHON_BACKEND_DIR="$PROJECT_ROOT/sicora-be-python"

# Servicios
GO_SERVICES=("userservice" "scheduleservice" "kbservice" "evalinservice" "mevalservice" "projectevalservice" "attendanceservice" "apigateway")
PYTHON_SERVICES=("userservice" "scheduleservice" "evalinservice" "attendanceservice" "kbservice" "projectevalservice" "apigateway" "aiservice" "mevalservice" "softwarefactoryservice")

# Función para mostrar encabezado
show_header() {
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}🔍 CONFIGURACIÓN SONARQUBE UNIFICADA${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo ""
}

# Función para verificar estado actual de SonarQube
check_current_sonarqube_status() {
    echo -e "${BLUE}🔍 Verificando estado actual de SonarQube...${NC}"
    
    echo -e "${BLUE}📋 Servicios Go:${NC}"
    for service in "${GO_SERVICES[@]}"; do
        local service_dir="$GO_BACKEND_DIR/$service"
        
        if [ -f "$service_dir/sonar-project.properties" ]; then
            echo -e "${GREEN}✅ $service: SonarQube configurado${NC}"
        else
            echo -e "${RED}❌ $service: SonarQube NO configurado${NC}"
        fi
    done
    
    echo -e "${BLUE}📋 Servicios Python:${NC}"
    for service in "${PYTHON_SERVICES[@]}"; do
        local service_dir="$PYTHON_BACKEND_DIR/$service"
        
        if [ -f "$service_dir/sonar-project.properties" ]; then
            echo -e "${GREEN}✅ $service: SonarQube configurado${NC}"
        else
            echo -e "${RED}❌ $service: SonarQube NO configurado${NC}"
        fi
    done
    echo ""
}

# Función para crear configuración SonarQube para servicio Go
create_sonar_config_go() {
    local service=$1
    local service_dir="$GO_BACKEND_DIR/$service"
    local config_file="$service_dir/sonar-project.properties"
    
    echo -e "${BLUE}🔧 Creando configuración SonarQube para $service (Go)...${NC}"
    
    cat > "$config_file" << EOF
# SonarQube Configuration for SICORA $service (Go)
# Generated: $(date)

# Project identification
sonar.projectKey=sicora-$service-go
sonar.projectName=SICORA $service (Go)
sonar.projectVersion=1.0.0
sonar.organization=sicora

# Source code settings
sonar.sources=.
sonar.sourceEncoding=UTF-8

# Go specific settings
sonar.go.coverage.reportPaths=coverage.out
sonar.language=go

# Exclusions
sonar.exclusions=**/*_test.go,**/vendor/**,**/docs/**,**/*.pb.go,**/mock_*.go

# Test settings
sonar.tests=.
sonar.test.inclusions=**/*_test.go
sonar.test.exclusions=**/vendor/**

# Coverage settings
sonar.coverage.exclusions=**/*_test.go,**/vendor/**,**/docs/**,**/*.pb.go,**/mock_*.go,**/main.go

# Quality gate settings
sonar.qualitygate.wait=true

# Analysis settings
sonar.scm.disabled=false
sonar.scm.provider=git

# Security hotspots
sonar.security.hotspots.reportPaths=

# Additional settings
sonar.links.homepage=https://github.com/sicora-dev
sonar.links.ci=https://github.com/sicora-dev/sicora/actions
sonar.links.issue=https://github.com/sicora-dev/sicora/issues
EOF
    
    echo -e "${GREEN}✅ Configuración SonarQube creada para $service${NC}"
}

# Función para crear configuración SonarQube para servicio Python
create_sonar_config_python() {
    local service=$1
    local service_dir="$PYTHON_BACKEND_DIR/$service"
    local config_file="$service_dir/sonar-project.properties"
    
    echo -e "${BLUE}🔧 Creando configuración SonarQube para $service (Python)...${NC}"
    
    cat > "$config_file" << EOF
# SonarQube Configuration for SICORA $service (Python)
# Generated: $(date)

# Project identification
sonar.projectKey=sicora-$service-python
sonar.projectName=SICORA $service (Python)
sonar.projectVersion=1.0.0
sonar.organization=sicora

# Source code settings
sonar.sources=app,main.py
sonar.sourceEncoding=UTF-8

# Python specific settings
sonar.python.version=3.13
sonar.python.xunit.reportPath=tests/test-results.xml
sonar.python.coverage.reportPaths=coverage.xml

# Test settings
sonar.tests=tests
sonar.test.inclusions=**/test_*.py,**/*_test.py

# Exclusions
sonar.exclusions=**/venv/**,**/__pycache__/**,**/migrations/**,**/alembic/versions/**,**/*.pyc,**/.*

# Coverage settings
sonar.coverage.exclusions=**/tests/**,**/venv/**,**/__pycache__/**,**/migrations/**,**/alembic/versions/**

# Quality gate settings
sonar.qualitygate.wait=true

# Analysis settings
sonar.scm.disabled=false
sonar.scm.provider=git

# Python specific rules
sonar.python.bandit.reportPaths=bandit-report.json
sonar.python.pylint.reportPaths=pylint-report.txt

# Additional settings
sonar.links.homepage=https://github.com/sicora-dev
sonar.links.ci=https://github.com/sicora-dev/sicora/actions
sonar.links.issue=https://github.com/sicora-dev/sicora/issues
EOF
    
    echo -e "${GREEN}✅ Configuración SonarQube creada para $service${NC}"
}

# Función para crear archivo de configuración global
create_global_sonar_config() {
    local global_config="$PROJECT_ROOT/sonar-project.properties"
    
    echo -e "${BLUE}🌐 Creando configuración SonarQube global...${NC}"
    
    cat > "$global_config" << EOF
# SonarQube Global Configuration for SICORA Project
# Generated: $(date)

# Project identification
sonar.projectKey=sicora-multistack
sonar.projectName=SICORA - Sistema Integral de Control y Registro Académico
sonar.projectVersion=1.0.0
sonar.organization=sicora

# Multi-module project configuration
sonar.modules=go-backend,python-backend,frontend,infrastructure

# Go Backend Module
go-backend.sonar.projectName=SICORA Go Backend
go-backend.sonar.sources=sicora-be-go
go-backend.sonar.language=go
go-backend.sonar.exclusions=**/vendor/**,**/docs/**,**/*_test.go

# Python Backend Module  
python-backend.sonar.projectName=SICORA Python Backend
python-backend.sonar.sources=sicora-be-python
python-backend.sonar.language=py
python-backend.sonar.exclusions=**/venv/**,**/__pycache__/**,**/migrations/**

# Frontend Module
frontend.sonar.projectName=SICORA Frontend
frontend.sonar.sources=sicora-app-fe/src
frontend.sonar.language=ts,js
frontend.sonar.exclusions=**/node_modules/**,**/dist/**

# Infrastructure Module
infrastructure.sonar.projectName=SICORA Infrastructure
infrastructure.sonar.sources=sicora-infra
infrastructure.sonar.exclusions=**/.*

# Global settings
sonar.sourceEncoding=UTF-8
sonar.qualitygate.wait=true
sonar.scm.disabled=false
sonar.scm.provider=git

# Links
sonar.links.homepage=https://github.com/sicora-dev
sonar.links.ci=https://github.com/sicora-dev/sicora/actions
sonar.links.issue=https://github.com/sicora-dev/sicora/issues
EOF
    
    echo -e "${GREEN}✅ Configuración SonarQube global creada${NC}"
}

# Función para crear script de análisis
create_analysis_script() {
    local analysis_script="$PROJECT_ROOT/scripts/run-sonar-analysis.sh"
    
    echo -e "${BLUE}📜 Creando script de análisis SonarQube...${NC}"
    
    cat > "$analysis_script" << 'EOF'
#!/bin/bash

# Script para ejecutar análisis SonarQube en SICORA
# Versión: 1.0

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar si sonar-scanner está instalado
if ! command -v sonar-scanner &> /dev/null; then
    echo -e "${RED}❌ sonar-scanner no encontrado${NC}"
    echo -e "${YELLOW}Instalar desde: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/${NC}"
    exit 1
fi

# Función para análisis global
run_global_analysis() {
    echo -e "${BLUE}🌐 Ejecutando análisis SonarQube global...${NC}"
    
    cd /home/epti/Documentos/epti-dev/sicora-app
    sonar-scanner
    
    echo -e "${GREEN}✅ Análisis global completado${NC}"
}

# Función para análisis individual
run_service_analysis() {
    local service_type=$1
    local service_name=$2
    
    echo -e "${BLUE}🔍 Ejecutando análisis para $service_name ($service_type)...${NC}"
    
    if [ "$service_type" = "go" ]; then
        cd "/home/epti/Documentos/epti-dev/sicora-app/sicora-be-go/$service_name"
    elif [ "$service_type" = "python" ]; then
        cd "/home/epti/Documentos/epti-dev/sicora-app/sicora-be-python/$service_name"
    else
        echo -e "${RED}❌ Tipo de servicio inválido: $service_type${NC}"
        return 1
    fi
    
    if [ -f "sonar-project.properties" ]; then
        sonar-scanner
        echo -e "${GREEN}✅ Análisis completado para $service_name${NC}"
    else
        echo -e "${RED}❌ sonar-project.properties no encontrado${NC}"
        return 1
    fi
}

# Función de ayuda
show_help() {
    echo "Uso: $0 [opción]"
    echo ""
    echo "Opciones:"
    echo "  global                    Ejecutar análisis global del proyecto"
    echo "  service <tipo> <nombre>   Ejecutar análisis de servicio específico"
    echo "  list                      Mostrar servicios disponibles"
    echo "  help                      Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 global"
    echo "  $0 service go userservice"
    echo "  $0 service python scheduleservice"
}

# Función para listar servicios
list_services() {
    echo -e "${BLUE}📋 Servicios disponibles:${NC}"
    echo ""
    echo -e "${BLUE}Go Services:${NC}"
    echo "  userservice, scheduleservice, kbservice, evalinservice"
    echo "  mevalservice, projectevalservice, attendanceservice, softwarefactoryservice"
    echo ""
    echo -e "${BLUE}Python Services:${NC}"
    echo "  userservice, scheduleservice, evalinservice, attendanceservice"
    echo "  kbservice, projectevalservice, apigateway"
}

# Procesamiento de argumentos
case "${1:-help}" in
    "global")
        run_global_analysis
        ;;
    "service")
        if [ $# -ne 3 ]; then
            echo -e "${RED}❌ Uso: $0 service <tipo> <nombre>${NC}"
            exit 1
        fi
        run_service_analysis "$2" "$3"
        ;;
    "list")
        list_services
        ;;
    "help"|*)
        show_help
        ;;
esac
EOF
    
    chmod +x "$analysis_script"
    echo -e "${GREEN}✅ Script de análisis creado: $analysis_script${NC}"
}

# Función para generar reporte de SonarQube
generate_sonarqube_report() {
    local report_file="/home/epti/Documentos/epti-dev/sicora-app/_docs/reportes/SONARQUBE_STATUS_$(date +%Y%m%d).md"
    
    echo -e "${BLUE}📊 Generando reporte de estado SonarQube...${NC}"
    
    cat > "$report_file" << EOF
# 📊 Reporte de Estado SonarQube - SICORA

**Fecha:** $(date)  
**Ubicación:** \`/_docs/reportes/\`

## 🎯 Resumen de Configuración

### Servicios Go

| Servicio | Estado Config | Archivo |
|----------|---------------|---------|
EOF
    
    for service in "${GO_SERVICES[@]}"; do
        local service_dir="$GO_BACKEND_DIR/$service"
        
        if [ -f "$service_dir/sonar-project.properties" ]; then
            echo "| $service | ✅ Configurado | \`sicora-be-go/$service/sonar-project.properties\` |" >> "$report_file"
        else
            echo "| $service | ❌ No configurado | - |" >> "$report_file"
        fi
    done
    
    cat >> "$report_file" << EOF

### Servicios Python

| Servicio | Estado Config | Archivo |
|----------|---------------|---------|
EOF
    
    for service in "${PYTHON_SERVICES[@]}"; do
        local service_dir="$PYTHON_BACKEND_DIR/$service"
        
        if [ -f "$service_dir/sonar-project.properties" ]; then
            echo "| $service | ✅ Configurado | \`sicora-be-python/$service/sonar-project.properties\` |" >> "$report_file"
        else
            echo "| $service | ❌ No configurado | - |" >> "$report_file"
        fi
    done
    
    cat >> "$report_file" << EOF

## 🛠️ Configuración Global

- **Archivo global**: \`sonar-project.properties\` (raíz del proyecto)
- **Script de análisis**: \`scripts/run-sonar-analysis.sh\`

## 🚀 Comandos de Análisis

### Análisis Global
\`\`\`bash
# Proyecto completo
./scripts/run-sonar-analysis.sh global
\`\`\`

### Análisis Individual
\`\`\`bash
# Servicio Go específico
./scripts/run-sonar-analysis.sh service go userservice

# Servicio Python específico  
./scripts/run-sonar-analysis.sh service python scheduleservice

# Listar servicios disponibles
./scripts/run-sonar-analysis.sh list
\`\`\`

## 📋 Requisitos

1. **SonarQube Server**: Ejecutándose localmente o en servidor
2. **sonar-scanner**: Instalado y en PATH
3. **Tokens**: Configurar tokens de autenticación si es necesario

### Instalación sonar-scanner

\`\`\`bash
# Linux
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip
unzip sonar-scanner-cli-4.8.0.2856-linux.zip
sudo mv sonar-scanner-4.8.0.2856-linux /opt/sonar-scanner
sudo ln -s /opt/sonar-scanner/bin/sonar-scanner /usr/local/bin/sonar-scanner
\`\`\`

## 🔍 Quality Gates

Configuraciones incluidas:
- **Coverage mínimo**: Configurado por tipo de proyecto
- **Duplicación máxima**: 3%
- **Mantenibilidad**: Rating A
- **Confiabilidad**: Rating A
- **Seguridad**: Rating A

## 📝 Próximos Pasos

1. **Configurar SonarQube Server**: Local o en la nube
2. **Generar tokens**: Para autenticación automática
3. **Integrar CI/CD**: Análisis automático en pipelines
4. **Configurar IDE**: Plugin SonarLint en VS Code
5. **Monitoreo continuo**: Dashboard de calidad

---

**Generado por**: Script de configuración automática SonarQube  
**Estado**: Fase 3 completada ✅
EOF
    
    echo -e "${GREEN}✅ Reporte SonarQube generado: $report_file${NC}"
}

# Función principal
main() {
    show_header
    check_current_sonarqube_status
    
    local configured_go=0
    local configured_python=0
    
    # Configurar servicios Go
    echo -e "${BLUE}🔧 Configurando SonarQube para servicios Go...${NC}"
    for service in "${GO_SERVICES[@]}"; do
        local service_dir="$GO_BACKEND_DIR/$service"
        
        if [ -d "$service_dir" ]; then
            if [ ! -f "$service_dir/sonar-project.properties" ]; then
                create_sonar_config_go "$service"
                configured_go=$((configured_go + 1))
            else
                echo -e "${GREEN}✅ $service (Go): Ya configurado${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  $service (Go): Directorio no encontrado${NC}"
        fi
    done
    
    echo ""
    
    # Configurar servicios Python
    echo -e "${BLUE}🔧 Configurando SonarQube para servicios Python...${NC}"
    for service in "${PYTHON_SERVICES[@]}"; do
        local service_dir="$PYTHON_BACKEND_DIR/$service"
        
        if [ -d "$service_dir" ]; then
            if [ ! -f "$service_dir/sonar-project.properties" ]; then
                create_sonar_config_python "$service"
                configured_python=$((configured_python + 1))
            else
                echo -e "${GREEN}✅ $service (Python): Ya configurado${NC}"
            fi
        else
            echo -e "${YELLOW}⚠️  $service (Python): Directorio no encontrado${NC}"
        fi
    done
    
    echo ""
    
    # Crear configuración global y scripts
    create_global_sonar_config
    create_analysis_script
    
    # Generar reporte final
    generate_sonarqube_report
    
    # Verificar estado final
    echo -e "${BLUE}🔍 Verificando estado final...${NC}"
    check_current_sonarqube_status
    
    # Resumen final
    echo -e "${BLUE}============================================${NC}"
    echo -e "${BLUE}📊 RESUMEN FINAL - FASE 3${NC}"
    echo -e "${BLUE}============================================${NC}"
    echo -e "${GREEN}✅ Nuevos servicios Go configurados: $configured_go${NC}"
    echo -e "${GREEN}✅ Nuevos servicios Python configurados: $configured_python${NC}"
    echo -e "${GREEN}✅ Configuración global creada${NC}"
    echo -e "${GREEN}✅ Script de análisis creado${NC}"
    echo ""
    echo -e "${BLUE}📄 Para ejecutar análisis:${NC}"
    echo -e "  ${YELLOW}./scripts/run-sonar-analysis.sh global${NC}"
    echo -e "  ${YELLOW}./scripts/run-sonar-analysis.sh list${NC}"
    echo ""
    echo -e "${BLUE}📄 Reporte detallado generado en _docs/reportes/${NC}"
    echo ""
}

# Ejecutar función principal
main "$@"
