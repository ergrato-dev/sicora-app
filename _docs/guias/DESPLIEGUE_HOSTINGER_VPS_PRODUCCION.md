# 🚀 GUÍA DE DESPLIEGUE SICORA-APP EPTI ONEVISION EN HOSTINGER VPS

## 📋 Información General

**Objetivo**: Desplegar la versión EPTI OneVision de SICORA-APP en el VPS de Hostinger para producción.

**Componentes a desplegar**:

- PostgreSQL + Redis con datos de prueba
- Backend Go (todos los microservicios)
- AIService (Python FastAPI)
- Frontend React (EPTI OneVision)
- Nginx como proxy reverso

**Versión**: EPTI OneVision (sin branding SENA)

---

## 🏗️ FASE 1: PREPARACIÓN DEL ENTORNO VPS

### 1.1 Acceso y Configuración Inicial del VPS

```bash
# Conectar al VPS de Hostinger
ssh root@tu-servidor-hostinger.com

# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose v2
mkdir -p ~/.docker/cli-plugins/
curl -SL https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
chmod +x ~/.docker/cli-plugins/docker-compose

# Verificar instalación
docker --version
docker compose version
```

### 1.2 Configuración de Firewall y Puertos

```bash
# Configurar UFW (si está disponible)
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 8000/tcp    # API Gateway (temporal para pruebas)
ufw --force enable

# O usar iptables si UFW no está disponible
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 8000 -j ACCEPT
```

### 1.3 Estructura de Directorios

```bash
# Crear estructura para el proyecto
mkdir -p /opt/sicora-app
cd /opt/sicora-app

# Crear directorios específicos
mkdir -p {database,logs,backup,certs,config}
mkdir -p production/{frontend,backend-go,backend-python,nginx}
```

---

## 🗄️ FASE 2: DESPLIEGUE DE BASE DE DATOS Y REDIS

### 2.1 Preparar Datos de Prueba

```bash
# Crear directorio para scripts de base de datos
mkdir -p /opt/sicora-app/database/init
cd /opt/sicora-app/database/init
```

Crear archivo `/opt/sicora-app/database/init/01-init-sicora.sql`:

```sql
-- Crear base de datos principal
CREATE DATABASE sicora_prod;

-- Crear usuario específico para producción
CREATE USER sicora_prod_user WITH ENCRYPTED PASSWORD 'CAMBIAR_PASSWORD_SEGURO';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE sicora_prod TO sicora_prod_user;

-- Conectar a la base de datos
\c sicora_prod

-- Crear esquemas para microservicios
CREATE SCHEMA IF NOT EXISTS users;
CREATE SCHEMA IF NOT EXISTS schedules;
CREATE SCHEMA IF NOT EXISTS attendance;
CREATE SCHEMA IF NOT EXISTS evaluations;
CREATE SCHEMA IF NOT EXISTS knowledge_base;
CREATE SCHEMA IF NOT EXISTS ai_service;
CREATE SCHEMA IF NOT EXISTS projects;

-- Otorgar permisos en esquemas
GRANT ALL ON SCHEMA users TO sicora_prod_user;
GRANT ALL ON SCHEMA schedules TO sicora_prod_user;
GRANT ALL ON SCHEMA attendance TO sicora_prod_user;
GRANT ALL ON SCHEMA evaluations TO sicora_prod_user;
GRANT ALL ON SCHEMA knowledge_base TO sicora_prod_user;
GRANT ALL ON SCHEMA ai_service TO sicora_prod_user;
GRANT ALL ON SCHEMA projects TO sicora_prod_user;

-- Configurar permisos por defecto
ALTER DEFAULT PRIVILEGES IN SCHEMA users GRANT ALL ON TABLES TO sicora_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA schedules GRANT ALL ON TABLES TO sicora_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA attendance GRANT ALL ON TABLES TO sicora_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA evaluations GRANT ALL ON TABLES TO sicora_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA knowledge_base GRANT ALL ON TABLES TO sicora_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA ai_service GRANT ALL ON TABLES TO sicora_prod_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA projects GRANT ALL ON TABLES TO sicora_prod_user;
```

### 2.2 Docker Compose para Base de Datos

Crear `/opt/sicora-app/docker-compose.database.yml`:

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:18-alpine
    container_name: sicora_postgres_prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: sicora_prod
      POSTGRES_USER: sicora_prod_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_INITDB_ARGS: '--encoding=UTF8 --lc-collate=es_ES.UTF-8 --lc-ctype=es_ES.UTF-8'
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
      - ./logs:/var/log/postgresql
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U sicora_prod_user -d sicora_prod']
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sicora_redis_prod
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
      - ./config/redis.conf:/usr/local/etc/redis/redis.conf
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD}', 'ping']
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local

networks:
  sicora_network:
    driver: bridge
```

### 2.3 Variables de Entorno para Producción

Crear `/opt/sicora-app/.env.production`:

```bash
# Base de Datos
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO_POSTGRES
POSTGRES_DB=sicora_prod
POSTGRES_USER=sicora_prod_user
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Redis
REDIS_PASSWORD=TU_PASSWORD_SEGURO_REDIS
REDIS_HOST=redis
REDIS_PORT=6379

# Aplicación
JWT_SECRET=TU_JWT_SECRET_MUY_SEGURO_DE_AL_MENOS_32_CARACTERES
SECRET_KEY=TU_SECRET_KEY_APLICACION_SEGURA

# Dominio
DOMAIN=tu-dominio.com
API_URL=https://tu-dominio.com/api

# Logs
LOG_LEVEL=INFO
```

### 2.4 Iniciar Base de Datos y Redis

```bash
cd /opt/sicora-app

# Cargar variables de entorno
cp .env.production .env

# Iniciar servicios de base de datos
docker compose -f docker-compose.database.yml up -d

# Verificar que los servicios estén corriendo
docker compose -f docker-compose.database.yml ps

# Verificar logs
docker compose -f docker-compose.database.yml logs postgres
docker compose -f docker-compose.database.yml logs redis

# Probar conexión a PostgreSQL
docker exec -it sicora_postgres_prod psql -U sicora_prod_user -d sicora_prod -c "\l"

# Probar conexión a Redis
docker exec -it sicora_redis_prod redis-cli -a TU_PASSWORD_SEGURO_REDIS ping
```

---

## 🔧 FASE 3: DESPLIEGUE DEL BACKEND GO

### 3.1 Preparar Código del Backend Go

```bash
# Crear directorio para backend Go
mkdir -p /opt/sicora-app/production/backend-go
cd /opt/sicora-app/production/backend-go

# Clonar o copiar el código (ajusta según tu método de despliegue)
# Opción 1: Git (recomendado)
git clone https://github.com/tu-repo/sicora-be-go.git .

# Opción 2: Copiar desde local
# scp -r ./sicora-be-go/* root@tu-servidor:/opt/sicora-app/production/backend-go/
```

### 3.2 Docker Compose para Backend Go

Crear `/opt/sicora-app/docker-compose.backend-go.yml`:

```yaml
version: '3.9'

services:
  # Servicio de Usuarios
  userservice-go:
    build:
      context: ./production/backend-go/userservice
      dockerfile: Dockerfile
    container_name: sicora_userservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - PORT=8001
      - ENV=production
      - DB_SCHEMA=users
    ports:
      - '8001:8001'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8001/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # Servicio de Horarios
  scheduleservice-go:
    build:
      context: ./production/backend-go/scheduleservice
      dockerfile: Dockerfile
    container_name: sicora_scheduleservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8002
      - ENV=production
      - DB_SCHEMA=schedules
    ports:
      - '8002:8002'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8002/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # Servicio de Asistencia
  attendanceservice-go:
    build:
      context: ./production/backend-go/attendanceservice
      dockerfile: Dockerfile
    container_name: sicora_attendanceservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8003
      - ENV=production
      - DB_SCHEMA=attendance
    ports:
      - '8003:8003'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8003/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # Servicio de Evaluaciones
  evalinservice-go:
    build:
      context: ./production/backend-go/evalinservice
      dockerfile: Dockerfile
    container_name: sicora_evalinservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8004
      - ENV=production
      - DB_SCHEMA=evaluations
    ports:
      - '8004:8004'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8004/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # Servicio de Base de Conocimientos
  kbservice-go:
    build:
      context: ./production/backend-go/kbservice
      dockerfile: Dockerfile
    container_name: sicora_kbservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8005
      - ENV=production
      - DB_SCHEMA=knowledge_base
    ports:
      - '8005:8005'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8005/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # Servicio de Evaluación de Proyectos
  projectevalservice-go:
    build:
      context: ./production/backend-go/projectevalservice
      dockerfile: Dockerfile
    container_name: sicora_projectevalservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8007
      - ENV=production
      - DB_SCHEMA=projects
    ports:
      - '8007:8007'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8007/health']
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  sicora_network:
    external: true
```

### 3.3 Desplegar Backend Go

```bash
cd /opt/sicora-app

# Construir y desplegar servicios Go
docker compose -f docker-compose.backend-go.yml build

# Iniciar servicios
docker compose -f docker-compose.backend-go.yml up -d

# Verificar estado
docker compose -f docker-compose.backend-go.yml ps

# Verificar logs de cada servicio
docker compose -f docker-compose.backend-go.yml logs userservice-go
docker compose -f docker-compose.backend-go.yml logs scheduleservice-go
docker compose -f docker-compose.backend-go.yml logs attendanceservice-go
docker compose -f docker-compose.backend-go.yml logs evalinservice-go
docker compose -f docker-compose.backend-go.yml logs kbservice-go
docker compose -f docker-compose.backend-go.yml logs projectevalservice-go
```

---

## 🤖 FASE 4: DESPLIEGUE DEL AISERVICE (PYTHON)

### 4.1 Preparar AIService

```bash
# Crear directorio para AIService
mkdir -p /opt/sicora-app/production/backend-python
cd /opt/sicora-app/production/backend-python

# Clonar o copiar el código del AIService
# Solo necesitamos el AIService del stack Python
git clone https://github.com/tu-repo/sicora-be-python.git .
# O: scp -r ./sicora-be-python/aiservice/* root@tu-servidor:/opt/sicora-app/production/backend-python/
```

### 4.2 Docker Compose para AIService

Crear `/opt/sicora-app/docker-compose.aiservice.yml`:

```yaml
version: '3.9'

services:
  aiservice:
    build:
      context: ./production/backend-python/aiservice
      dockerfile: Dockerfile
    container_name: sicora_aiservice_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql+asyncpg://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - ENV=production
      - DB_SCHEMA=ai_service
      - PYTHONPATH=/app
    ports:
      - '8006:8004'
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network
    volumes:
      - aiservice_data:/app/data
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8004/health']
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  aiservice_data:
    driver: local

networks:
  sicora_network:
    external: true
```

### 4.3 Desplegar AIService

```bash
cd /opt/sicora-app

# Construir AIService
docker compose -f docker-compose.aiservice.yml build

# Iniciar AIService
docker compose -f docker-compose.aiservice.yml up -d

# Verificar estado
docker compose -f docker-compose.aiservice.yml ps

# Verificar logs
docker compose -f docker-compose.aiservice.yml logs aiservice
```

---

## 🌐 FASE 5: CONFIGURACIÓN DE NGINX

### 5.1 Configuración de Nginx

Crear `/opt/sicora-app/nginx/nginx.conf`:

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    keepalive_timeout 65;
    gzip on;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream para servicios Go
    upstream userservice {
        server userservice-go:8001;
    }

    upstream scheduleservice {
        server scheduleservice-go:8002;
    }

    upstream attendanceservice {
        server attendanceservice-go:8003;
    }

    upstream evalinservice {
        server evalinservice-go:8004;
    }

    upstream kbservice {
        server kbservice-go:8005;
    }

    upstream projectevalservice {
        server projectevalservice-go:8007;
    }

    # Upstream para AIService (Python)
    upstream aiservice {
        server aiservice:8004;
    }

    include /etc/nginx/conf.d/*.conf;
}
```

Crear `/opt/sicora-app/nginx/conf.d/sicora.conf`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    # Redirigir a HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com www.tu-dominio.com;

    # Certificados SSL (configurar según tus certificados)
    ssl_certificate /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Headers de seguridad
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Servir frontend estático
    location / {
        root /var/www/sicora-frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Routes - Servicios Go
    location /api/users/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://userservice/;
        include /etc/nginx/proxy_params;
    }

    location /api/schedules/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://scheduleservice/;
        include /etc/nginx/proxy_params;
    }

    location /api/attendance/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://attendanceservice/;
        include /etc/nginx/proxy_params;
    }

    location /api/evaluations/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://evalinservice/;
        include /etc/nginx/proxy_params;
    }

    location /api/knowledge/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://kbservice/;
        include /etc/nginx/proxy_params;
    }

    location /api/projects/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://projectevalservice/;
        include /etc/nginx/proxy_params;
    }

    # AIService (Python)
    location /api/ai/ {
        limit_req zone=api burst=10 nodelay;
        proxy_pass http://aiservice/;
        include /etc/nginx/proxy_params;
        proxy_read_timeout 300s;  # Mayor timeout para AI
    }

    # Endpoints de autenticación con rate limiting estricto
    location /api/auth/login {
        limit_req zone=login burst=5 nodelay;
        proxy_pass http://userservice/auth/login;
        include /etc/nginx/proxy_params;
    }

    # Archivos estáticos con caché
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /var/www/sicora-frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health checks (sin rate limiting)
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Crear `/opt/sicora-app/nginx/proxy_params`:

```nginx
proxy_set_header Host $http_host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_buffering off;
```

### 5.2 Docker Compose para Nginx

Crear `/opt/sicora-app/docker-compose.nginx.yml`:

```yaml
version: '3.9'

services:
  nginx:
    image: nginx:alpine
    container_name: sicora_nginx_prod
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/proxy_params:/etc/nginx/proxy_params:ro
      - ./certs:/etc/nginx/certs:ro
      - frontend_dist:/var/www/sicora-frontend:ro
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - userservice-go
      - scheduleservice-go
      - attendanceservice-go
      - evalinservice-go
      - kbservice-go
      - projectevalservice-go
      - aiservice
    networks:
      - sicora_network

volumes:
  frontend_dist:
    external: true

networks:
  sicora_network:
    external: true
```

---

## 🎨 FASE 6: DESPLIEGUE DEL FRONTEND

### 6.1 Preparar Frontend EPTI OneVision

```bash
# Crear directorio para frontend
mkdir -p /opt/sicora-app/production/frontend
cd /opt/sicora-app/production/frontend

# Clonar o copiar el código del frontend
git clone https://github.com/tu-repo/sicora-app-fe.git .
# O: scp -r ./sicora-app-fe/* root@tu-servidor:/opt/sicora-app/production/frontend/
```

### 6.2 Configurar Variables de Entorno del Frontend

Crear `/opt/sicora-app/production/frontend/.env.hostinger`:

```bash
# Configuración EPTI OneVision para Hostinger
VITE_BUILD_TARGET=hostinger
VITE_BRAND_CONFIG=epti

# URLs de la API (ajustar según tu dominio)
VITE_API_URL=https://tu-dominio.com/api
VITE_API_BASE_URL=https://tu-dominio.com/api

# Configuración de servicios
VITE_USER_SERVICE_URL=https://tu-dominio.com/api/users
VITE_SCHEDULE_SERVICE_URL=https://tu-dominio.com/api/schedules
VITE_ATTENDANCE_SERVICE_URL=https://tu-dominio.com/api/attendance
VITE_EVALUATION_SERVICE_URL=https://tu-dominio.com/api/evaluations
VITE_KB_SERVICE_URL=https://tu-dominio.com/api/knowledge
VITE_PROJECT_SERVICE_URL=https://tu-dominio.com/api/projects
VITE_AI_SERVICE_URL=https://tu-dominio.com/api/ai

# Configuración de autenticación
VITE_JWT_SECRET_KEY=TU_JWT_SECRET_FRONTEND

# Configuración de ambiente
VITE_NODE_ENV=production
VITE_DEBUG=false

# Configuración de logging
VITE_LOG_LEVEL=error
```

### 6.3 Docker Compose para Build del Frontend

Crear `/opt/sicora-app/docker-compose.frontend-build.yml`:

```yaml
version: '3.9'

services:
  frontend-builder:
    image: node:18-alpine
    container_name: sicora_frontend_builder
    working_dir: /app
    volumes:
      - ./production/frontend:/app
      - frontend_dist:/app/dist
    environment:
      - NODE_ENV=production
    command: >
      sh -c "
        echo 'Instalando dependencias...' &&
        npm install -g pnpm &&
        pnpm install &&
        echo 'Configurando ambiente EPTI OneVision...' &&
        cp .env.hostinger .env &&
        echo 'Construyendo para producción...' &&
        pnpm build:hostinger &&
        echo 'Copiando archivos al volumen...' &&
        cp -r dist/* /app/dist/ &&
        echo 'Build completado!'
      "

volumes:
  frontend_dist:
    driver: local
```

### 6.4 Construir Frontend

```bash
cd /opt/sicora-app

# Crear volumen para el frontend construido
docker volume create frontend_dist

# Ejecutar build del frontend
docker compose -f docker-compose.frontend-build.yml run --rm frontend-builder

# Verificar que el build se completó
docker run --rm -v frontend_dist:/data alpine ls -la /data
```

---

## 🚀 FASE 7: DESPLIEGUE COMPLETO

### 7.1 Docker Compose Maestro

Crear `/opt/sicora-app/docker-compose.yml`:

```yaml
version: '3.9'

services:
  # Base de datos y Redis
  postgres:
    image: postgres:18-alpine
    container_name: sicora_postgres_prod
    restart: unless-stopped
    environment:
      POSTGRES_DB: sicora_prod
      POSTGRES_USER: sicora_prod_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U sicora_prod_user -d sicora_prod']
      interval: 30s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: sicora_redis_prod
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    networks:
      - sicora_network
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD}', 'ping']
      interval: 30s
      timeout: 10s
      retries: 5

  # Servicios Go
  userservice-go:
    build:
      context: ./production/backend-go/userservice
      dockerfile: Dockerfile
    container_name: sicora_userservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - PORT=8001
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network

  scheduleservice-go:
    build:
      context: ./production/backend-go/scheduleservice
      dockerfile: Dockerfile
    container_name: sicora_scheduleservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8002
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network

  attendanceservice-go:
    build:
      context: ./production/backend-go/attendanceservice
      dockerfile: Dockerfile
    container_name: sicora_attendanceservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8003
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network

  evalinservice-go:
    build:
      context: ./production/backend-go/evalinservice
      dockerfile: Dockerfile
    container_name: sicora_evalinservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8004
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network

  kbservice-go:
    build:
      context: ./production/backend-go/kbservice
      dockerfile: Dockerfile
    container_name: sicora_kbservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8005
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network

  projectevalservice-go:
    build:
      context: ./production/backend-go/projectevalservice
      dockerfile: Dockerfile
    container_name: sicora_projectevalservice_go_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgres://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod?sslmode=disable
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - PORT=8007
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network

  # AIService (Python)
  aiservice:
    build:
      context: ./production/backend-python/aiservice
      dockerfile: Dockerfile
    container_name: sicora_aiservice_prod
    restart: unless-stopped
    environment:
      - DATABASE_URL=postgresql+asyncpg://sicora_prod_user:${POSTGRES_PASSWORD}@postgres:5432/sicora_prod
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - sicora_network

  # Nginx
  nginx:
    image: nginx:alpine
    container_name: sicora_nginx_prod
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./nginx/proxy_params:/etc/nginx/proxy_params:ro
      - ./certs:/etc/nginx/certs:ro
      - frontend_dist:/var/www/sicora-frontend:ro
    depends_on:
      - userservice-go
      - scheduleservice-go
      - attendanceservice-go
      - evalinservice-go
      - kbservice-go
      - projectevalservice-go
      - aiservice
    networks:
      - sicora_network

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  frontend_dist:
    external: true

networks:
  sicora_network:
    driver: bridge
```

### 7.2 Script de Despliegue Automático

Crear `/opt/sicora-app/deploy.sh`:

```bash
#!/bin/bash

set -e

echo "🚀 Iniciando despliegue de SICORA-APP EPTI OneVision..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "docker-compose.yml" ]; then
    print_error "docker-compose.yml no encontrado. Ejecutar desde /opt/sicora-app"
    exit 1
fi

# Verificar variables de entorno
if [ ! -f ".env" ]; then
    print_error "Archivo .env no encontrado. Copiar desde .env.production"
    exit 1
fi

print_status "Verificando variables de entorno..."
source .env

if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$REDIS_PASSWORD" ] || [ -z "$JWT_SECRET" ]; then
    print_error "Variables de entorno requeridas no configuradas"
    exit 1
fi

# Crear red de Docker si no existe
print_status "Creando red Docker..."
docker network create sicora_network 2>/dev/null || true

# Detener servicios existentes
print_status "Deteniendo servicios existentes..."
docker compose down --remove-orphans || true

# Construir imágenes
print_status "Construyendo imágenes Docker..."
docker compose build --parallel

# Construir frontend
print_status "Construyendo frontend EPTI OneVision..."
docker compose -f docker-compose.frontend-build.yml run --rm frontend-builder

# Iniciar servicios de base de datos primero
print_status "Iniciando base de datos y Redis..."
docker compose up -d postgres redis

# Esperar a que la base de datos esté lista
print_status "Esperando a que PostgreSQL esté listo..."
until docker exec sicora_postgres_prod pg_isready -U sicora_prod_user -d sicora_prod; do
    sleep 2
done

print_status "Esperando a que Redis esté listo..."
until docker exec sicora_redis_prod redis-cli -a "$REDIS_PASSWORD" ping; do
    sleep 2
done

# Iniciar servicios backend
print_status "Iniciando servicios backend..."
docker compose up -d \
    userservice-go \
    scheduleservice-go \
    attendanceservice-go \
    evalinservice-go \
    kbservice-go \
    projectevalservice-go \
    aiservice

# Esperar a que los servicios estén listos
print_status "Esperando a que los servicios backend estén listos..."
sleep 30

# Verificar salud de servicios
print_status "Verificando salud de servicios..."
services=("userservice-go:8001" "scheduleservice-go:8002" "attendanceservice-go:8003" "evalinservice-go:8004" "kbservice-go:8005" "projectevalservice-go:8007")

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)

    if docker exec $name curl -f http://localhost:$port/health >/dev/null 2>&1; then
        print_status "✅ $name está saludable"
    else
        print_warning "⚠️  $name no responde en health check"
    fi
done

# Iniciar Nginx
print_status "Iniciando Nginx..."
docker compose up -d nginx

# Verificar estado final
print_status "Verificando estado final..."
docker compose ps

# Mostrar información de acceso
print_status "🎉 Despliegue completado!"
echo ""
echo "📋 Información de acceso:"
echo "🌐 Frontend: https://tu-dominio.com"
echo "🔧 API Base: https://tu-dominio.com/api"
echo ""
echo "🏥 Health checks:"
echo "curl https://tu-dominio.com/health"
echo "curl https://tu-dominio.com/api/users/health"
echo ""
echo "📊 Para ver logs:"
echo "docker compose logs -f [servicio]"
echo ""
echo "🔧 Para ver estado:"
echo "docker compose ps"
```

---

## 🔒 FASE 8: CONFIGURACIÓN DE SSL/TLS

### 8.1 Obtener Certificados SSL con Let's Encrypt

```bash
# Instalar Certbot
apt install snapd
snap install core; snap refresh core
snap install --classic certbot

# Crear enlace simbólico
ln -s /snap/bin/certbot /usr/bin/certbot

# Detener Nginx temporalmente para obtener certificados
docker compose stop nginx

# Obtener certificados
certbot certonly --standalone \
    --email tu-email@dominio.com \
    --agree-tos \
    --non-interactive \
    -d tu-dominio.com \
    -d www.tu-dominio.com

# Copiar certificados al directorio de Nginx
mkdir -p /opt/sicora-app/certs
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem /opt/sicora-app/certs/
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem /opt/sicora-app/certs/

# Ajustar permisos
chown -R 999:999 /opt/sicora-app/certs
chmod 600 /opt/sicora-app/certs/*

# Reiniciar Nginx
docker compose start nginx
```

### 8.2 Configurar Renovación Automática de Certificados

```bash
# Crear script de renovación
cat > /opt/sicora-app/renew-certs.sh << 'EOF'
#!/bin/bash

# Renovar certificados
certbot renew --quiet

# Copiar certificados actualizados
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem /opt/sicora-app/certs/
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem /opt/sicora-app/certs/

# Ajustar permisos
chown -R 999:999 /opt/sicora-app/certs
chmod 600 /opt/sicora-app/certs/*

# Recargar Nginx
docker compose exec nginx nginx -s reload
EOF

chmod +x /opt/sicora-app/renew-certs.sh

# Agregar a crontab para renovación automática
(crontab -l 2>/dev/null; echo "0 2 * * 1 /opt/sicora-app/renew-certs.sh") | crontab -
```

---

## 📊 FASE 9: MONITOREO Y LOGGING

### 9.1 Configurar Logging Centralizado

Crear `/opt/sicora-app/docker-compose.monitoring.yml`:

```yaml
version: '3.9'

services:
  # Grafana para visualización
  grafana:
    image: grafana/grafana:latest
    container_name: sicora_grafana
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
    networks:
      - sicora_network

  # Prometheus para métricas
  prometheus:
    image: prom/prometheus:latest
    container_name: sicora_prometheus
    restart: unless-stopped
    ports:
      - '9090:9090'
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    networks:
      - sicora_network

  # Node Exporter para métricas del sistema
  node-exporter:
    image: prom/node-exporter:latest
    container_name: sicora_node_exporter
    restart: unless-stopped
    ports:
      - '9100:9100'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - sicora_network

volumes:
  grafana_data:
    driver: local
  prometheus_data:
    driver: local

networks:
  sicora_network:
    external: true
```

### 9.2 Configurar Prometheus

Crear `/opt/sicora-app/monitoring/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'rules/*.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: []

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'sicora-services'
    static_configs:
      - targets:
          - 'userservice-go:8001'
          - 'scheduleservice-go:8002'
          - 'attendanceservice-go:8003'
          - 'evalinservice-go:8004'
          - 'kbservice-go:8005'
          - 'projectevalservice-go:8007'
          - 'aiservice:8004'
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:80']
```

### 9.3 Scripts de Monitoreo

Crear `/opt/sicora-app/scripts/health-check.sh`:

```bash
#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

echo "🏥 SICORA Health Check - $(date)"
echo "=================================="

# Verificar contenedores
echo "📦 Estado de contenedores:"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 Health checks de servicios:"

# Verificar servicios Go
services=(
    "userservice-go:8001"
    "scheduleservice-go:8002"
    "attendanceservice-go:8003"
    "evalinservice-go:8004"
    "kbservice-go:8005"
    "projectevalservice-go:8007"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)

    docker exec $name curl -f -s http://localhost:$port/health > /dev/null 2>&1
    print_status "$name" $?
done

# Verificar AIService
docker exec sicora_aiservice_prod curl -f -s http://localhost:8004/health > /dev/null 2>&1
print_status "aiservice" $?

# Verificar base de datos
docker exec sicora_postgres_prod pg_isready -U sicora_prod_user -d sicora_prod > /dev/null 2>&1
print_status "PostgreSQL" $?

# Verificar Redis
docker exec sicora_redis_prod redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1
print_status "Redis" $?

# Verificar Nginx
curl -f -s http://localhost/health > /dev/null 2>&1
print_status "Nginx" $?

echo ""
echo "💾 Uso de recursos:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
echo "RAM: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
echo "Disco: $(df -h / | awk 'NR==2 {print $5}')"

echo ""
echo "🔍 Logs recientes (últimas 5 líneas):"
docker compose logs --tail=5 --timestamps
```

Crear `/opt/sicora-app/scripts/backup.sh`:

```bash
#!/bin/bash

BACKUP_DIR="/opt/sicora-app/backup"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

echo "📦 Iniciando backup - $DATE"

# Backup de base de datos
echo "Respaldando PostgreSQL..."
docker exec sicora_postgres_prod pg_dump -U sicora_prod_user sicora_prod | gzip > $BACKUP_DIR/postgres_$DATE.sql.gz

# Backup de Redis
echo "Respaldando Redis..."
docker exec sicora_redis_prod redis-cli -a "$REDIS_PASSWORD" --rdb /data/dump_$DATE.rdb
docker cp sicora_redis_prod:/data/dump_$DATE.rdb $BACKUP_DIR/redis_$DATE.rdb

# Backup de configuración
echo "Respaldando configuración..."
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /opt/sicora-app/nginx \
    /opt/sicora-app/.env \
    /opt/sicora-app/docker-compose.yml

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "✅ Backup completado en $BACKUP_DIR"
```

---

## 🔧 FASE 10: CONFIGURACIÓN DE DATOS DE PRUEBA

### 10.1 Script de Carga de Datos de Prueba

Crear `/opt/sicora-app/database/init/02-sample-data.sql`:

```sql
-- Conectar a la base de datos principal
\c sicora_prod

-- Datos de prueba para el esquema de usuarios
INSERT INTO users.roles (id, name, description, created_at) VALUES
(1, 'admin', 'Administrador del sistema', NOW()),
(2, 'instructor', 'Instructor/Docente', NOW()),
(3, 'student', 'Estudiante/Aprendiz', NOW()),
(4, 'coordinator', 'Coordinador académico', NOW())
ON CONFLICT (id) DO NOTHING;

-- Usuarios de prueba
INSERT INTO users.users (id, username, email, password_hash, first_name, last_name, role_id, active, created_at) VALUES
(1, 'admin', 'admin@sicora.com', '$2b$12$LQv3c1yqBwEHxPuNYyXf8O9Zjh.QHwRNOFkEEZBX8mGwwTZOr.K6G', 'Admin', 'Sistema', 1, true, NOW()),
(2, 'instructor1', 'instructor1@sicora.com', '$2b$12$LQv3c1yqBwEHxPuNYyXf8O9Zjh.QHwRNOFkEEZBX8mGwwTZOr.K6G', 'Carlos', 'Martínez', 2, true, NOW()),
(3, 'student1', 'student1@sicora.com', '$2b$12$LQv3c1yqBwEHxPuNYyXf8O9Zjh.QHwRNOFkEEZBX8mGwwTZOr.K6G', 'Ana', 'García', 3, true, NOW()),
(4, 'coordinator1', 'coordinator1@sicora.com', '$2b$12$LQv3c1yqBwEHxPuNYyXf8O9Zjh.QHwRNOFkEEZBX8mGwwTZOr.K6G', 'María', 'López', 4, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Datos de prueba para horarios
INSERT INTO schedules.programs (id, name, description, duration_months, created_at) VALUES
(1, 'Desarrollo de Software', 'Programa técnico en desarrollo de software', 24, NOW()),
(2, 'Administración de Redes', 'Programa técnico en administración de redes', 18, NOW()),
(3, 'Diseño Gráfico', 'Programa técnico en diseño gráfico', 20, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO schedules.courses (id, program_id, name, description, credits, created_at) VALUES
(1, 1, 'Programación Básica', 'Fundamentos de programación', 3, NOW()),
(2, 1, 'Base de Datos', 'Diseño y administración de bases de datos', 4, NOW()),
(3, 1, 'Desarrollo Web', 'Desarrollo de aplicaciones web', 5, NOW()),
(4, 2, 'Redes I', 'Fundamentos de redes de computadores', 3, NOW()),
(5, 3, 'Diseño Digital', 'Principios de diseño digital', 3, NOW())
ON CONFLICT (id) DO NOTHING;

-- Datos de prueba para asistencia
INSERT INTO attendance.class_sessions (id, course_id, instructor_id, session_date, start_time, end_time, status, created_at) VALUES
(1, 1, 2, CURRENT_DATE, '08:00:00', '12:00:00', 'completed', NOW()),
(2, 1, 2, CURRENT_DATE + INTERVAL '1 day', '08:00:00', '12:00:00', 'scheduled', NOW()),
(3, 2, 2, CURRENT_DATE, '14:00:00', '18:00:00', 'completed', NOW())
ON CONFLICT (id) DO NOTHING;

-- Datos de prueba para evaluaciones
INSERT INTO evaluations.evaluation_types (id, name, description, weight, created_at) VALUES
(1, 'quiz', 'Evaluación corta', 0.2, NOW()),
(2, 'exam', 'Examen parcial', 0.3, NOW()),
(3, 'project', 'Proyecto final', 0.5, NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO evaluations.evaluations (id, course_id, type_id, title, description, max_score, evaluation_date, created_at) VALUES
(1, 1, 1, 'Quiz Variables y Tipos de Datos', 'Evaluación sobre variables y tipos de datos en programación', 100, CURRENT_DATE + INTERVAL '3 days', NOW()),
(2, 1, 2, 'Examen Parcial - Estructuras de Control', 'Examen sobre estructuras de control y funciones', 100, CURRENT_DATE + INTERVAL '10 days', NOW()),
(3, 2, 3, 'Proyecto Base de Datos', 'Diseño e implementación de una base de datos', 100, CURRENT_DATE + INTERVAL '30 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Datos de prueba para base de conocimientos
INSERT INTO knowledge_base.categories (id, name, description, created_at) VALUES
(1, 'Programación', 'Recursos sobre programación y desarrollo', NOW()),
(2, 'Redes', 'Recursos sobre redes y telecomunicaciones', NOW()),
(3, 'Diseño', 'Recursos sobre diseño gráfico y multimedia', NOW()),
(4, 'General', 'Recursos generales y transversales', NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO knowledge_base.articles (id, category_id, title, content, author_id, status, created_at) VALUES
(1, 1, 'Introducción a Python', 'Python es un lenguaje de programación interpretado...', 2, 'published', NOW()),
(2, 1, 'Estructuras de Datos', 'Las estructuras de datos son formas de organizar...', 2, 'published', NOW()),
(3, 2, 'Modelo OSI', 'El modelo OSI es un modelo de referencia...', 2, 'published', NOW()),
(4, 4, 'Metodologías Ágiles', 'Las metodologías ágiles son enfoques...', 2, 'published', NOW())
ON CONFLICT (id) DO NOTHING;

-- Confirmar inserción de datos
SELECT 'Datos de prueba cargados exitosamente' as status;
```

### 10.2 Script de Configuración Adicional

Crear `/opt/sicora-app/scripts/load-sample-data.sh`:

```bash
#!/bin/bash

echo "📊 Cargando datos de prueba adicionales..."

# Esperar a que PostgreSQL esté listo
until docker exec sicora_postgres_prod pg_isready -U sicora_prod_user -d sicora_prod; do
    echo "Esperando PostgreSQL..."
    sleep 2
done

# Cargar datos adicionales si es necesario
docker exec -i sicora_postgres_prod psql -U sicora_prod_user -d sicora_prod << 'EOF'
-- Verificar que los datos se cargaron correctamente
SELECT 'Users:' as table_name, COUNT(*) as count FROM users.users
UNION ALL
SELECT 'Roles:', COUNT(*) FROM users.roles
UNION ALL
SELECT 'Programs:', COUNT(*) FROM schedules.programs
UNION ALL
SELECT 'Courses:', COUNT(*) FROM schedules.courses
UNION ALL
SELECT 'Articles:', COUNT(*) FROM knowledge_base.articles;
EOF

echo "✅ Datos de prueba cargados exitosamente"
```

---

## 🚀 FASE 11: VALIDACIÓN Y PRUEBAS FINALES

### 11.1 Script de Validación Completa

Crear `/opt/sicora-app/scripts/validate-deployment.sh`:

```bash
#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo -e "${BLUE}$1${NC}"
    echo "=================================="
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

DOMAIN="tu-dominio.com"  # Cambiar por tu dominio real

print_header "🔍 VALIDACIÓN COMPLETA DEL DESPLIEGUE SICORA"

# 1. Verificar contenedores
print_header "📦 1. Estado de Contenedores"
docker compose ps

# 2. Verificar conectividad de red
print_header "🌐 2. Conectividad de Red"

# Ping interno entre contenedores
if docker exec sicora_userservice_go_prod ping -c 1 postgres > /dev/null 2>&1; then
    print_success "Conectividad interna: userservice -> postgres"
else
    print_error "Fallo conectividad: userservice -> postgres"
fi

if docker exec sicora_userservice_go_prod ping -c 1 redis > /dev/null 2>&1; then
    print_success "Conectividad interna: userservice -> redis"
else
    print_error "Fallo conectividad: userservice -> redis"
fi

# 3. Verificar health checks
print_header "🏥 3. Health Checks de Servicios"

services=(
    "userservice-go:8001"
    "scheduleservice-go:8002"
    "attendanceservice-go:8003"
    "evalinservice-go:8004"
    "kbservice-go:8005"
    "projectevalservice-go:8007"
)

for service in "${services[@]}"; do
    name=$(echo $service | cut -d: -f1)
    port=$(echo $service | cut -d: -f2)

    if timeout 10 docker exec $name curl -f -s http://localhost:$port/health > /dev/null 2>&1; then
        print_success "$name health check"
    else
        print_error "$name health check failed"
    fi
done

# AIService
if timeout 10 docker exec sicora_aiservice_prod curl -f -s http://localhost:8004/health > /dev/null 2>&1; then
    print_success "aiservice health check"
else
    print_error "aiservice health check failed"
fi

# 4. Verificar base de datos
print_header "🗄️  4. Verificación de Base de Datos"

if docker exec sicora_postgres_prod pg_isready -U sicora_prod_user -d sicora_prod > /dev/null 2>&1; then
    print_success "PostgreSQL está corriendo"

    # Verificar esquemas
    schemas=$(docker exec sicora_postgres_prod psql -U sicora_prod_user -d sicora_prod -t -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('users', 'schedules', 'attendance', 'evaluations', 'knowledge_base', 'ai_service');")
    schema_count=$(echo "$schemas" | wc -w)

    if [ $schema_count -eq 6 ]; then
        print_success "Todos los esquemas de base de datos presentes"
    else
        print_warning "Solo $schema_count de 6 esquemas encontrados"
    fi
else
    print_error "PostgreSQL no está respondiendo"
fi

# 5. Verificar Redis
print_header "🔴 5. Verificación de Redis"

if docker exec sicora_redis_prod redis-cli -a "$REDIS_PASSWORD" ping > /dev/null 2>&1; then
    print_success "Redis está corriendo"
else
    print_error "Redis no está respondiendo"
fi

# 6. Verificar frontend
print_header "🎨 6. Verificación de Frontend"

if curl -f -s http://localhost/ > /dev/null 2>&1; then
    print_success "Frontend accesible en HTTP"
else
    print_error "Frontend no accesible en HTTP"
fi

if curl -f -s -k https://localhost/ > /dev/null 2>&1; then
    print_success "Frontend accesible en HTTPS"
else
    print_warning "Frontend no accesible en HTTPS (normal si SSL no está configurado)"
fi

# 7. Verificar APIs
print_header "🔌 7. Verificación de APIs"

api_endpoints=(
    "/api/users/health"
    "/api/schedules/health"
    "/api/attendance/health"
    "/api/evaluations/health"
    "/api/knowledge/health"
    "/api/projects/health"
    "/api/ai/health"
)

for endpoint in "${api_endpoints[@]}"; do
    if curl -f -s http://localhost$endpoint > /dev/null 2>&1; then
        print_success "API$endpoint"
    else
        print_error "API$endpoint no responde"
    fi
done

# 8. Verificar logs por errores críticos
print_header "📋 8. Verificación de Logs"

error_count=$(docker compose logs --since 1h 2>&1 | grep -i -E "(error|fatal|panic|exception)" | wc -l)

if [ $error_count -eq 0 ]; then
    print_success "Sin errores críticos en logs recientes"
elif [ $error_count -lt 5 ]; then
    print_warning "$error_count errores encontrados en logs recientes"
else
    print_error "$error_count errores críticos en logs recientes"
fi

# 9. Verificar recursos del sistema
print_header "💾 9. Recursos del Sistema"

# CPU
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
cpu_int=${cpu_usage%.*}

if [ $cpu_int -lt 80 ]; then
    print_success "Uso de CPU: ${cpu_usage}%"
else
    print_warning "Uso alto de CPU: ${cpu_usage}%"
fi

# Memoria
mem_usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')

if [ $mem_usage -lt 80 ]; then
    print_success "Uso de memoria: ${mem_usage}%"
else
    print_warning "Uso alto de memoria: ${mem_usage}%"
fi

# Disco
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ $disk_usage -lt 80 ]; then
    print_success "Uso de disco: ${disk_usage}%"
else
    print_warning "Uso alto de disco: ${disk_usage}%"
fi

# 10. Resumen final
print_header "📊 10. Resumen de Validación"

total_containers=$(docker compose ps -q | wc -l)
running_containers=$(docker compose ps --filter "status=running" -q | wc -l)

echo "📦 Contenedores: $running_containers/$total_containers corriendo"
echo "🌐 Frontend: $(curl -s -o /dev/null -w "%{http_code}" http://localhost/)"
echo "🔧 APIs: Verificadas arriba"
echo "🗄️  Base de datos: $(docker exec sicora_postgres_prod pg_isready -U sicora_prod_user -d sicora_prod > /dev/null 2>&1 && echo "OK" || echo "FAIL")"
echo "🔴 Redis: $(docker exec sicora_redis_prod redis-cli -a "$REDIS_PASSWORD" ping 2>/dev/null | tr -d '\r')"

if [ $running_containers -eq $total_containers ]; then
    print_success "🎉 DESPLIEGUE EXITOSO - Todos los servicios están corriendo"
    echo ""
    echo "🌐 Acceso:"
    echo "   Frontend: http://$DOMAIN (o http://$(curl -s ifconfig.me))"
    echo "   API: http://$DOMAIN/api"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   Ver logs: docker compose logs -f [servicio]"
    echo "   Reiniciar: docker compose restart [servicio]"
    echo "   Estado: docker compose ps"
else
    print_error "DESPLIEGUE INCOMPLETO - $((total_containers - running_containers)) servicios no están corriendo"
    echo ""
    echo "🔍 Para diagnosticar:"
    echo "   docker compose ps"
    echo "   docker compose logs [servicio-fallido]"
fi
```

### 11.2 Comandos de Mantenimiento Frecuente

Crear `/opt/sicora-app/scripts/maintenance.sh`:

```bash
#!/bin/bash

case "$1" in
    "status")
        echo "📊 Estado de SICORA:"
        docker compose ps
        echo ""
        echo "💾 Recursos:"
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
        echo "RAM: $(free | grep Mem | awk '{printf("%.1f%%", $3/$2 * 100.0)}')"
        echo "Disco: $(df -h / | awk 'NR==2 {print $5}')"
        ;;

    "restart")
        echo "🔄 Reiniciando SICORA..."
        docker compose restart
        echo "✅ Reinicio completado"
        ;;

    "update")
        echo "🔄 Actualizando imágenes..."
        docker compose pull
        docker compose up -d
        echo "✅ Actualización completada"
        ;;

    "backup")
        echo "📦 Iniciando backup..."
        /opt/sicora-app/scripts/backup.sh
        ;;

    "logs")
        if [ -z "$2" ]; then
            docker compose logs --tail=50 --timestamps
        else
            docker compose logs $2 --tail=50 --timestamps
        fi
        ;;

    "health")
        /opt/sicora-app/scripts/health-check.sh
        ;;

    *)
        echo "🛠️  Comandos de mantenimiento SICORA:"
        echo "  $0 status   - Ver estado del sistema"
        echo "  $0 restart  - Reiniciar todos los servicios"
        echo "  $0 update   - Actualizar imágenes"
        echo "  $0 backup   - Crear backup"
        echo "  $0 logs [servicio] - Ver logs"
        echo "  $0 health   - Verificar salud del sistema"
        ;;
esac
```

---

## 📋 CHECKLIST FINAL DE DESPLIEGUE

### ✅ Pre-requisitos

- [ ] VPS de Hostinger configurado
- [ ] Docker y Docker Compose instalados
- [ ] Dominio configurado apuntando al VPS
- [ ] Firewall configurado

### ✅ Base de Datos

- [ ] PostgreSQL corriendo
- [ ] Redis corriendo
- [ ] Esquemas creados
- [ ] Datos de prueba cargados
- [ ] Backups configurados

### ✅ Backend

- [ ] Todos los microservicios Go desplegados
- [ ] AIService (Python) desplegado
- [ ] Health checks funcionando
- [ ] APIs respondiendo

### ✅ Frontend

- [ ] Frontend EPTI OneVision construido
- [ ] Archivos estáticos servidos
- [ ] Configuración EPTI aplicada

### ✅ Infraestructura

- [ ] Nginx configurado
- [ ] SSL/TLS configurado
- [ ] Monitoreo activo
- [ ] Logs centralizados

### ✅ Seguridad

- [ ] Passwords seguros configurados
- [ ] Certificados SSL instalados
- [ ] Firewall activo
- [ ] Rate limiting configurado

### ✅ Validación

- [ ] Todos los contenedores corriendo
- [ ] Health checks pasando
- [ ] Frontend accesible
- [ ] APIs funcionando
- [ ] Base de datos conectada

---

## 🚨 SOLUCIÓN DE PROBLEMAS COMUNES

### Problema: Contenedor no inicia

```bash
# Ver logs del contenedor
docker compose logs [nombre-servicio]

# Verificar configuración
docker compose config

# Reiniciar específico
docker compose restart [nombre-servicio]
```

### Problema: Base de datos no conecta

```bash
# Verificar PostgreSQL
docker exec sicora_postgres_prod pg_isready -U sicora_prod_user -d sicora_prod

# Ver logs de PostgreSQL
docker compose logs postgres

# Conectar manualmente
docker exec -it sicora_postgres_prod psql -U sicora_prod_user -d sicora_prod
```

### Problema: Frontend no carga

```bash
# Verificar Nginx
docker compose logs nginx

# Verificar archivos estáticos
docker run --rm -v frontend_dist:/data alpine ls -la /data

# Reconstruir frontend
docker compose -f docker-compose.frontend-build.yml run --rm frontend-builder
```

### Problema: APIs no responden

```bash
# Verificar conectividad interna
docker exec sicora_userservice_go_prod ping postgres
docker exec sicora_userservice_go_prod ping redis

# Verificar puertos
netstat -tlnp | grep -E "(8001|8002|8003|8004|8005|8006|8007)"

# Verificar logs de servicios
docker compose logs userservice-go
```

---

## 📞 CONTACTO Y SOPORTE

Para soporte técnico o problemas con el despliegue:

- **Documentación**: Consulta `_docs/` en el repositorio
- **Logs**: Usa `docker compose logs [servicio]`
- **Monitoreo**: Accede a Grafana en `http://tu-dominio:3000`
- **Health Checks**: Ejecuta `/opt/sicora-app/scripts/health-check.sh`

---

**🎉 ¡SICORA-APP EPTI OneVision DESPLEGADO CON ÉXITO!**

La aplicación está lista para uso en producción con todos los microservicios funcionando, datos de prueba cargados y monitoreo activo.
