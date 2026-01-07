# 🔷 Configuración Go 1.25 - SICORA Backend

## 📋 Resumen

A partir de **Enero 2026**, el backend Go de SICORA requiere **Go 1.25 o superior**.

## 🔧 Archivos Actualizados

### go.mod (todos los servicios)

```go
go 1.25

toolchain go1.25.5
```

## 📦 Servicios Actualizados

| Servicio           | Versión Go | Toolchain | Estado           |
| ------------------ | ---------- | --------- | ---------------- |
| userservice        | 1.25       | go1.25.5  | ✅ Compila       |
| attendanceservice  | 1.25       | go1.25.5  | ✅ Compila       |
| scheduleservice    | 1.25       | go1.25.5  | ✅ Compila       |
| evalinservice      | 1.25       | go1.25.5  | ✅ Compila       |
| projectevalservice | 1.25       | go1.25.5  | ✅ Compila       |
| mevalservice       | 1.25       | go1.25.5  | ✅ Compila       |
| kbservice          | 1.25       | go1.25.5  | ✅ Compila       |
| apigateway         | 1.25       | go1.25.5  | 🚧 En desarrollo |

## 🆕 Novedades Go 1.25

### Mejoras de Rendimiento

- **Garbage Collector mejorado** - Menor latencia en aplicaciones de alta concurrencia
- **Optimizaciones del compilador** - Binarios más rápidos
- **Mejor inlining** - Reducción de overhead en llamadas a funciones

### Nuevas Características

- **Iteradores mejorados** en el paquete `iter`
- **Mejoras en generics** - Mayor flexibilidad en tipos genéricos
- **Telemetría opt-in** para métricas de runtime

### Compatibilidad

- Totalmente compatible con GORM 1.30+
- Soporte completo para Gin 1.10+
- Compatible con PostgreSQL 18

## 📦 Dependencias Principales

| Paquete                                | Versión  | Notas                 |
| -------------------------------------- | -------- | --------------------- |
| github.com/gin-gonic/gin               | v1.10.1  | Framework web         |
| gorm.io/gorm                           | v1.30.0  | ORM                   |
| gorm.io/driver/postgres                | v1.6.0   | Driver PostgreSQL     |
| github.com/golang-jwt/jwt/v5           | v5.2.2   | Autenticación JWT     |
| github.com/swaggo/swag                 | v1.16.6  | Documentación Swagger |
| github.com/go-playground/validator/v10 | v10.26.0 | Validación            |

## 🚀 Instalación

### Verificar Versión de Go

```bash
go version
# Debe mostrar: go version go1.25.x
```

### Actualizar Go (si es necesario)

```bash
# Linux/macOS
wget https://go.dev/dl/go1.25.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.25.5.linux-amd64.tar.gz

# Verificar
go version
```

### Actualizar Dependencias

```bash
cd sicora-be-go/userservice
go mod tidy
go build ./cmd/...
```

## 🔄 Migración desde Go 1.23

La migración es directa sin cambios de código requeridos:

```bash
# En cada servicio
cd sicora-be-go/<service>
go mod tidy
go build ./cmd/...
go test ./...
```

### Cambios Automáticos en go.mod

El toolchain se actualiza automáticamente:

```diff
- go 1.23.0
- toolchain go1.24.4
+ go 1.25
+ toolchain go1.25.5
```

## 🐳 Docker

Los Dockerfiles deben usar la imagen Go 1.25:

```dockerfile
FROM golang:1.25-alpine AS builder
# ... build steps ...

FROM alpine:latest
# ... runtime steps ...
```

## 🧪 Verificación

### Compilar Todos los Servicios

```bash
cd sicora-be-go
for service in userservice attendanceservice evalinservice kbservice mevalservice projectevalservice scheduleservice; do
  echo "Building $service..."
  cd "$service" && go build -o /dev/null ./cmd/... && cd ..
done
```

### Ejecutar Tests

```bash
cd sicora-be-go/userservice
go test -v ./...
```

---

**Fecha de actualización**: 6 de Enero 2026  
**Versión Go requerida**: 1.25+  
**Toolchain**: go1.25.5
