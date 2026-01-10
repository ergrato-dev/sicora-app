#!/bin/bash
# =============================================================================
# SICORA - Script de Seed de Datos (Estructura REAL)
# =============================================================================

set -e

DB_NAME="${DB_NAME:-sicora_dev}"
DB_USER="${DB_USER:-sicora_user}"
CONTAINER_NAME="${POSTGRES_CONTAINER:-sicora_postgres}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

exec_sql() {
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME -c "$1" 2>/dev/null
}

exec_sql_file() {
    docker exec -i $CONTAINER_NAME psql -U $DB_USER -d $DB_NAME < "$1" 2>/dev/null
}

check_db() {
    echo -e "${BLUE}🔍 Verificando conexión...${NC}"
    if ! docker ps --format '{{.Names}}' | grep -q "$CONTAINER_NAME"; then
        echo -e "${RED}❌ Contenedor $CONTAINER_NAME no encontrado${NC}"
        return 1
    fi
    if exec_sql "SELECT 1" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Conexión OK${NC}"
        return 0
    fi
    return 1
}

seed_all() {
    echo -e "${BLUE}🚀 Ejecutando seeds...${NC}"
    echo "=============================================="
    
    echo -e "${YELLOW}1/9 Users...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/01_users_seed.sql"
    
    echo -e "${YELLOW}2/9 KB Documents...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/02_kbservice_documents_seed.sql"
    
    echo -e "${YELLOW}3/9 KB FAQs...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/03_kbservice_faqs_seed.sql"
    
    echo -e "${YELLOW}4/9 Committees...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/04_mevalservice_committees_seed.sql"
    
    echo -e "${YELLOW}5/9 Student Cases...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/05_mevalservice_cases_seed.sql"
    
    echo -e "${YELLOW}6/9 Sanctions...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/06_mevalservice_sanctions_seed.sql"
    
    echo -e "${YELLOW}7/9 Appeals...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/07_mevalservice_appeals_seed.sql"
    
    echo -e "${YELLOW}8/9 Improvement Plans...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/08_mevalservice_plans_seed.sql"
    
    echo -e "${YELLOW}9/9 Committee Decisions...${NC}"
    exec_sql_file "$SCRIPT_DIR/sql/09_mevalservice_decisions_seed.sql"
    
    echo ""
    echo -e "${GREEN}🎉 Seeds completados${NC}"
}

clean_all() {
    echo -e "${RED}⚠️  Limpiando datos de seed...${NC}"
    exec_sql "
    DELETE FROM committee_decisions WHERE id::text LIKE 'cd000001%';
    DELETE FROM improvement_plans WHERE id::text LIKE 'ip000001%';
    DELETE FROM appeals WHERE id::text LIKE 'ap000001%';
    DELETE FROM sanctions WHERE id::text LIKE 'sn000001%';
    DELETE FROM student_cases WHERE id::text LIKE 'sc000001%';
    DELETE FROM committee_members WHERE id::text LIKE 'cm000001%';
    DELETE FROM committees WHERE id::text LIKE 'c0000001%';
    DELETE FROM kb_faqs WHERE id::text LIKE 'b0000001%';
    DELETE FROM kb_documents WHERE id::text LIKE 'a0000001%';
    DELETE FROM users WHERE id LIKE 'admin-%' OR id LIKE 'coord-%' OR id LIKE 'inst-%' OR id LIKE 'stud-%';
    "
    echo -e "${GREEN}✅ Limpieza completada${NC}"
}

status() {
    echo -e "${BLUE}📊 Estado de datos seed:${NC}"
    exec_sql "
    SELECT 'users' as tabla, COUNT(*) as registros FROM users WHERE id LIKE 'admin-%' OR id LIKE 'coord-%' OR id LIKE 'inst-%' OR id LIKE 'stud-%'
    UNION ALL SELECT 'kb_documents', COUNT(*) FROM kb_documents WHERE id::text LIKE 'a0000001%'
    UNION ALL SELECT 'kb_faqs', COUNT(*) FROM kb_faqs WHERE id::text LIKE 'b0000001%'
    UNION ALL SELECT 'committees', COUNT(*) FROM committees WHERE id::text LIKE 'c0000001%'
    UNION ALL SELECT 'committee_members', COUNT(*) FROM committee_members WHERE id::text LIKE 'cm000001%'
    UNION ALL SELECT 'student_cases', COUNT(*) FROM student_cases WHERE id::text LIKE 'sc000001%'
    UNION ALL SELECT 'sanctions', COUNT(*) FROM sanctions WHERE id::text LIKE 'sn000001%'
    UNION ALL SELECT 'appeals', COUNT(*) FROM appeals WHERE id::text LIKE 'ap000001%'
    UNION ALL SELECT 'improvement_plans', COUNT(*) FROM improvement_plans WHERE id::text LIKE 'ip000001%'
    UNION ALL SELECT 'committee_decisions', COUNT(*) FROM committee_decisions WHERE id::text LIKE 'cd000001%';
    "
}

case "${1:-help}" in
    seed-all) check_db && seed_all ;;
    clean-all) check_db && clean_all ;;
    status) check_db && status ;;
    *) echo "Uso: $0 {seed-all|clean-all|status}" ;;
esac
