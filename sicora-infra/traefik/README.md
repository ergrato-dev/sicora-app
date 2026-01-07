# Traefik para SICORA

## Arquitectura

```
                    ┌─────────────────────────────────────────────────────┐
                    │                     INTERNET                         │
                    └─────────────────────────────────────────────────────┘
                                           │
                                           ▼
                    ┌─────────────────────────────────────────────────────┐
                    │                     TRAEFIK                          │
                    │  ┌───────────┐  ┌───────────┐  ┌───────────────────┐│
                    │  │  :80 HTTP │  │:443 HTTPS │  │ :8080 Dashboard   ││
                    │  └───────────┘  └───────────┘  └───────────────────┘│
                    │                                                      │
                    │  Middlewares:                                        │
                    │  • Rate Limiting (100 req/min)                       │
                    │  • Security Headers                                  │
                    │  • CORS                                              │
                    │  • Compression                                       │
                    │  • Circuit Breaker                                   │
                    └─────────────────────────────────────────────────────┘
                                           │
              ┌────────────────────────────┼────────────────────────────┐
              │                            │                            │
              ▼                            ▼                            ▼
    ┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
    │    FRONTEND     │        │   API GATEWAY   │        │    DASHBOARD    │
    │  app.localhost  │        │  api.localhost  │        │traefik.localhost│
    │    :5173        │        │     :8000       │        │                 │
    └─────────────────┘        └─────────────────┘        └─────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼                  ▼                  ▼
           ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
           │  userservice  │  │scheduleservice│  │  kbservice    │
           │    :8001      │  │    :8002      │  │    :8005      │
           └───────────────┘  └───────────────┘  └───────────────┘
```

## Quick Start

### Desarrollo

```bash
cd sicora-infra

# Copiar variables de entorno
cp traefik/.env.example .env

# Iniciar servicios
docker compose -f docker-compose.traefik.yml up -d

# Ver logs de Traefik
docker compose -f docker-compose.traefik.yml logs -f traefik
```

### URLs de Desarrollo

| Servicio          | URL                                     |
| ----------------- | --------------------------------------- |
| Frontend          | http://localhost o http://app.localhost |
| API Gateway       | http://api.localhost                    |
| Traefik Dashboard | http://traefik.localhost:8080           |
| Prometheus        | http://prometheus.localhost             |
| Grafana           | http://grafana.localhost                |

### Agregar entrada en /etc/hosts (Linux/Mac)

```bash
sudo echo "127.0.0.1 localhost app.localhost api.localhost traefik.localhost prometheus.localhost grafana.localhost" >> /etc/hosts
```

## Configuración

### Archivos principales

```
sicora-infra/
├── docker-compose.traefik.yml    # Compose principal
├── traefik/
│   ├── traefik.yml               # Config estática
│   ├── .env.example              # Variables de entorno
│   └── dynamic/
│       └── middlewares.yml       # Middlewares y routers
```

### Middlewares disponibles

| Middleware          | Descripción             | Uso              |
| ------------------- | ----------------------- | ---------------- |
| `rate-limit`        | 100 req/min, burst 50   | API general      |
| `rate-limit-strict` | 10 req/min, burst 5     | Login, registro  |
| `secure-headers`    | Headers de seguridad    | Todos            |
| `cors-dev`          | CORS para desarrollo    | Dev              |
| `cors-prod`         | CORS para producción    | Prod             |
| `compress`          | Compresión GZIP         | Todos            |
| `retry`             | 3 reintentos            | Backend services |
| `circuit-breaker`   | Protección de servicios | Backend services |
| `dashboard-auth`    | Auth básica             | Dashboard        |

### Aplicar middleware a un servicio

En docker-compose, agregar label:

```yaml
labels:
  - 'traefik.http.routers.myservice.middlewares=rate-limit@file,secure-headers@file'
```

## SSL/HTTPS

### Desarrollo (sin SSL)

El tráfico HTTP funciona sin configuración adicional.

### Producción (Let's Encrypt automático)

1. Asegurarse de que el dominio apunte al servidor
2. Configurar email en `ACME_EMAIL`
3. Descomentar redirección HTTP→HTTPS en `traefik.yml`
4. Reiniciar Traefik

```yaml
# traefik.yml
entryPoints:
  web:
    address: ':80'
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
```

## Monitoreo

### Métricas Prometheus

Traefik expone métricas en `:8082/metrics`:

- `traefik_entrypoint_requests_total`
- `traefik_router_requests_total`
- `traefik_service_requests_total`
- `traefik_entrypoint_request_duration_seconds`

### Dashboard Grafana

Importar dashboard oficial: **17346** (Traefik Official)

## Troubleshooting

### Ver logs

```bash
docker compose -f docker-compose.traefik.yml logs traefik
```

### Verificar configuración

```bash
docker compose -f docker-compose.traefik.yml exec traefik traefik healthcheck
```

### Forzar recarga de configuración dinámica

Traefik detecta cambios automáticamente. Si no:

```bash
docker compose -f docker-compose.traefik.yml restart traefik
```

### Puerto 80 ocupado

```bash
# Ver qué usa el puerto
sudo lsof -i :80

# Detener nginx si está corriendo
sudo systemctl stop nginx
```

## Integración con Redis Cache

El API Gateway usa Redis para:

- **Rate Limiting distribuido** (complementa Traefik)
- **Token Blacklist** (logout real)
- **Sesiones distribuidas**

Flujo:

1. Traefik aplica rate limiting global (100 req/min)
2. API Gateway aplica rate limiting por usuario/IP (Redis)
3. Ambos se complementan para máxima protección

## Comandos útiles

```bash
# Iniciar todo
docker compose -f docker-compose.traefik.yml up -d

# Solo infraestructura (traefik, postgres, redis)
docker compose -f docker-compose.traefik.yml up -d traefik postgres redis

# Reiniciar un servicio
docker compose -f docker-compose.traefik.yml restart apigateway

# Ver estado
docker compose -f docker-compose.traefik.yml ps

# Detener todo
docker compose -f docker-compose.traefik.yml down

# Limpiar volúmenes (¡cuidado, borra datos!)
docker compose -f docker-compose.traefik.yml down -v
```
