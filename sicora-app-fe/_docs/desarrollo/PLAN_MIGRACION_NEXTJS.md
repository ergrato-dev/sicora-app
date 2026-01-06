# Plan de Migración React 19 (Vite) → Next.js 15

**Fecha:** 6 de enero de 2026  
**Autor:** Equipo SICORA  
**Estado:** 📋 Planificación

---

## 📊 Parte 1: Análisis del Estado Actual

### Stack Actual (React 19 + Vite)

| Tecnología       | Versión | Propósito              |
| ---------------- | ------- | ---------------------- |
| React            | 19.2.1  | UI Library             |
| Vite             | 7.2.7   | Build tool             |
| React Router DOM | 6.30.1  | Routing                |
| TailwindCSS      | 3.x     | Estilos                |
| Radix UI         | 1.x-2.x | Componentes accesibles |
| Headless UI      | 2.2.9   | Componentes sin estilo |
| Zustand          | 4.5.7   | Estado global          |
| React Query      | 5.90.12 | Data fetching          |
| React Hook Form  | 7.59.0  | Formularios            |
| Zod              | 3.25.67 | Validación             |

### Estructura de Archivos Actual

```
src/
├── components/          # 23 componentes + UI library
│   ├── ui/              # 17 componentes base (Button, Input, Select, etc.)
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Dialog.tsx
│   │   ├── DropdownMenu.tsx
│   │   ├── Input.tsx
│   │   ├── Radio.tsx
│   │   ├── Select.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Spinner.tsx
│   │   ├── TextArea.tsx
│   │   ├── Toast.tsx
│   │   └── Tooltip.tsx
│   ├── examples/        # 6 demos
│   ├── InstitutionalHeader.tsx
│   ├── InstitutionalSidebar.tsx
│   ├── InstitutionalFooter.tsx
│   ├── InstitutionalLayout.tsx
│   └── LayoutWrapper.tsx
├── pages/               # 8 páginas + 4 secciones
│   ├── Dashboard.tsx
│   ├── ContactPage.tsx
│   ├── DemoPage.tsx
│   ├── NotFoundPage.tsx
│   ├── usuarios/
│   │   └── UsuariosPage.tsx
│   ├── horarios/
│   │   └── HorariosPage.tsx
│   ├── evaluaciones/
│   │   └── EvaluacionesPage.tsx
│   └── legal/
│       ├── index.tsx
│       ├── PoliticaPrivacidad.tsx
│       ├── TerminosUso.tsx
│       ├── MapaSitio.tsx
│       └── Accesibilidad.tsx
├── router/
│   └── index.tsx        # React Router config
├── stores/
│   ├── auth-store.ts    # Autenticación
│   └── userStore.ts     # Usuario
├── hooks/
│   ├── useBreadcrumb.ts
│   ├── useToast.ts
│   └── useValidation.ts
├── lib/
│   └── api-client.ts    # Cliente HTTP
├── config/
│   └── brand.ts         # Configuración multi-tenant
├── types/
│   └── auth.types.ts
└── assets/
```

### Estado de Historias de Usuario

**Progreso actual:** 6/39 HUs completadas (15%)

#### ✅ Completadas (6)

- HU-FE-001: Inicio de Sesión
- HU-FE-002: Cierre de Sesión
- HU-FE-003: Solicitud de Recuperación de Contraseña
- HU-FE-004: Cambio de Contraseña Obligatorio
- HU-FE-029: Restablecimiento de Contraseña
- HU-FE-030: Contexto de Autenticación

#### 🚧 En Desarrollo (2)

- HU-FE-005: Dashboard Aprendiz
- HU-FE-032: Cliente API Autenticado

#### 📋 Pendientes (31)

- Gestión de usuarios, horarios, asistencia, evaluaciones, KB

---

## 🔄 Parte 2: Mapeo React → Next.js

### Equivalencias de Estructura

| React 19 (Vite)                       | Next.js 15 (App Router)                |
| ------------------------------------- | -------------------------------------- |
| `src/pages/Dashboard.tsx`             | `app/(dashboard)/page.tsx`             |
| `src/pages/usuarios/UsuariosPage.tsx` | `app/(dashboard)/usuarios/page.tsx`    |
| `src/pages/legal/index.tsx`           | `app/(public)/legal/[slug]/page.tsx`   |
| `src/router/index.tsx`                | **Eliminado** - File-system routing    |
| `src/components/`                     | `components/` (raíz)                   |
| `src/components/ui/`                  | `components/ui/` - **Sin cambios**     |
| `src/stores/`                         | `stores/` o `lib/stores/`              |
| `src/hooks/`                          | `hooks/`                               |
| `src/lib/api-client.ts`               | `lib/api.ts` + Server Actions          |
| `src/config/brand.ts`                 | `lib/config/brand.ts`                  |
| `index.html`                          | `app/layout.tsx`                       |
| `vite.config.ts`                      | `next.config.ts`                       |
| `tailwind.config.ts`                  | `tailwind.config.ts` - **Sin cambios** |

### Nueva Estructura Next.js (App Router)

```
sicora-app-fe/
├── app/
│   ├── layout.tsx              # Root layout (reemplaza index.html)
│   ├── page.tsx                # Landing/redirect
│   ├── globals.css             # Estilos globales
│   ├── not-found.tsx           # Página 404
│   │
│   ├── (auth)/                 # Grupo: rutas públicas auth
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   ├── reset-password/
│   │   │   └── page.tsx
│   │   └── change-password/
│   │       └── page.tsx
│   │
│   ├── (dashboard)/            # Grupo: rutas protegidas
│   │   ├── layout.tsx          # InstitutionalLayout
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── usuarios/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── crear/
│   │   │       └── page.tsx
│   │   ├── horarios/
│   │   │   └── page.tsx
│   │   ├── evaluaciones/
│   │   │   └── page.tsx
│   │   └── contacto-seguro/
│   │       └── page.tsx
│   │
│   ├── (public)/               # Grupo: páginas públicas
│   │   └── legal/
│   │       └── [slug]/
│   │           └── page.tsx
│   │
│   └── api/                    # API Routes (opcional)
│       └── health/
│           └── route.ts
│
├── components/
│   ├── ui/                     # ✅ Se conserva igual
│   │   ├── Alert.tsx
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   └── ... (resto igual)
│   ├── layouts/
│   │   ├── InstitutionalLayout.tsx
│   │   ├── InstitutionalHeader.tsx
│   │   ├── InstitutionalSidebar.tsx
│   │   └── InstitutionalFooter.tsx
│   ├── shared/                 # Componentes compartidos
│   │   ├── Breadcrumb.tsx
│   │   ├── UserMenu.tsx
│   │   └── Navigation.tsx
│   └── providers/
│       └── Providers.tsx       # QueryClient, Theme, etc.
│
├── lib/
│   ├── api.ts                  # Cliente API adaptado
│   ├── utils.ts                # Utilidades (cn, etc.)
│   └── config/
│       └── brand.ts
│
├── stores/                     # Zustand stores
│   ├── auth-store.ts
│   └── userStore.ts
│
├── hooks/                      # Custom hooks
│   ├── useBreadcrumb.ts
│   ├── useToast.ts
│   └── useValidation.ts
│
├── types/                      # TypeScript types
│   └── auth.types.ts
│
├── public/                     # Assets estáticos
│   └── images/
│
└── middleware.ts               # Auth middleware
```

### Cambios Críticos

| Concepto      | React (Vite)        | Next.js 15                    |
| ------------- | ------------------- | ----------------------------- |
| Routing       | `react-router-dom`  | File-system routing           |
| Data Fetching | `useEffect` + axios | Server Components + `fetch`   |
| Estado global | Zustand (client)    | Zustand + Server Actions      |
| Env vars      | `VITE_*`            | `NEXT_PUBLIC_*`               |
| SSR           | No                  | Por defecto                   |
| Layouts       | `<Outlet />`        | `layout.tsx` con `{children}` |
| Link          | `<Link to="">`      | `<Link href="">`              |
| Navigate      | `useNavigate()`     | `useRouter()`                 |
| Params        | `useParams()`       | `params` prop en page         |

---

## 🚀 Parte 3: Plan de Migración por Fases

### FASE 1: Scaffolding Next.js (1-2 días)

#### 1.1 Crear proyecto Next.js en paralelo

```bash
cd /home/epti/Documents/epti-dev/sicora-app
pnpm create next-app@latest sicora-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm
```

#### 1.2 Copiar configuraciones que se conservan

- `tailwind.config.ts` → Adaptar paths de content
- `.env.*` → Renombrar `VITE_*` a `NEXT_PUBLIC_*`
- `postcss.config.js` → Sin cambios
- `.prettierrc`, `.eslintrc` → Adaptar reglas

#### 1.3 Copiar assets y estilos

- `src/assets/` → `public/`
- `src/index.css` → `app/globals.css`
- `src/App.css` → Integrar en globals.css

---

### FASE 2: Componentes UI (2-3 días)

#### 2.1 Migrar componentes UI (sin cambios de lógica)

```
src/components/ui/ → components/ui/
```

#### 2.2 Adaptar imports

```typescript
// Antes (Vite)
import { cn } from '../lib/utils';

// Después (Next.js)
import { cn } from '@/lib/utils';
```

#### 2.3 Marcar Client Components donde sea necesario

```typescript
// components/ui/Button.tsx
'use client'; // Añadir si usa useState, useEffect, eventos

import { forwardRef } from 'react';
// ... resto igual
```

#### Clasificación de Componentes

**Requieren `'use client'`:**

- ✅ Button, Input, Select (eventos onClick, onChange)
- ✅ Dialog, Toast, Dropdown (useState, useEffect)
- ✅ Tooltip (interactividad)
- ✅ Checkbox, Radio, Switch (estado controlado)

**Pueden ser Server Components:**

- ❌ Badge (solo renderizado)
- ❌ Alert (solo renderizado)
- ❌ Skeleton (solo CSS)
- ❌ Spinner (solo CSS animation)

---

### FASE 3: Layouts Institucionales (1-2 días)

#### 3.1 Root Layout (`app/layout.tsx`)

```typescript
import type { Metadata } from 'next';
import { Inter, Work_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans'
});

export const metadata: Metadata = {
  title: 'SICORA - Sistema de Coordinación Académica',
  description: 'Plataforma integral para la gestión académica',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={workSans.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### 3.2 Dashboard Layout (`app/(dashboard)/layout.tsx`)

```typescript
import { InstitutionalHeader } from '@/components/layouts/InstitutionalHeader';
import { InstitutionalSidebar } from '@/components/layouts/InstitutionalSidebar';
import { InstitutionalFooter } from '@/components/layouts/InstitutionalFooter';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <InstitutionalHeader />
      <div className="flex flex-1">
        <InstitutionalSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <InstitutionalFooter />
    </div>
  );
}
```

#### 3.3 Providers (`components/providers/Providers.tsx`)

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

### FASE 4: Autenticación y Estado (2-3 días)

#### 4.1 Adaptar Zustand stores

```typescript
// stores/auth-store.ts
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  access_token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      access_token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({
          access_token: token,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          access_token: null,
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'sicora-auth', // Mantener para compatibilidad
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

#### 4.2 Crear middleware de autenticación

```typescript
// middleware.ts (raíz del proyecto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicPaths = ['/login', '/forgot-password', '/reset-password', '/legal'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Verificar token en cookies
  const token = request.cookies.get('sicora-token')?.value;

  // Si no hay token y es ruta protegida, redirigir a login
  if (!token && !pathname.startsWith('/login')) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si hay token y es página de login, redirigir a dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
```

#### 4.3 Adaptar api-client.ts

```typescript
// lib/api.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001';

// Para Server Components
export async function fetchServer<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    cache: 'no-store', // o 'force-cache' según necesidad
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// Para Client Components
export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const authData = localStorage.getItem('sicora-auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.state?.access_token || null;
    }
    return null;
  }

  async get<T>(endpoint: string): Promise<T> {
    const token = this.getAuthToken();
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const token = this.getAuthToken();
    const res = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return res.json();
  }
}

export const apiClient = new ApiClient();
```

---

### FASE 5: Migración de Páginas (3-4 días)

#### 5.1 Orden de migración

| Prioridad | Página       | Origen                   | Destino                             |
| --------- | ------------ | ------------------------ | ----------------------------------- |
| 1         | Dashboard    | `pages/Dashboard.tsx`    | `app/(dashboard)/page.tsx`          |
| 2         | Login        | (nuevo)                  | `app/(auth)/login/page.tsx`         |
| 3         | Usuarios     | `pages/usuarios/`        | `app/(dashboard)/usuarios/`         |
| 4         | Horarios     | `pages/horarios/`        | `app/(dashboard)/horarios/`         |
| 5         | Evaluaciones | `pages/evaluaciones/`    | `app/(dashboard)/evaluaciones/`     |
| 6         | Legal        | `pages/legal/`           | `app/(public)/legal/[slug]/`        |
| 7         | Contacto     | `pages/ContactPage.tsx`  | `app/(dashboard)/contacto/page.tsx` |
| 8         | 404          | `pages/NotFoundPage.tsx` | `app/not-found.tsx`                 |

#### 5.2 Ejemplo migración Dashboard

**Página Server Component (`app/(dashboard)/page.tsx`):**

```typescript
import { DashboardClient } from '@/components/pages/DashboardClient';

export const metadata = {
  title: 'Dashboard | SICORA',
};

export default function DashboardPage() {
  return <DashboardClient />;
}
```

**Componente Client (`components/pages/DashboardClient.tsx`):**

```typescript
'use client';

import { useAuthStore } from '@/stores/auth-store';
import { useUserStore } from '@/stores/userStore';
// ... mover lógica de src/pages/Dashboard.tsx aquí
```

#### 5.3 Ejemplo migración rutas dinámicas

**Página con parámetros (`app/(dashboard)/usuarios/[id]/page.tsx`):**

```typescript
interface Props {
  params: Promise<{ id: string }>;
}

export default async function UsuarioDetailPage({ params }: Props) {
  const { id } = await params;

  return <UsuarioDetail userId={id} />;
}
```

---

### FASE 6: Testing y Cleanup (1-2 días)

#### 6.1 Configurar testing con Jest/Vitest

```typescript
// vitest.config.ts (si se mantiene Vitest)
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

#### 6.2 Eliminar dependencias obsoletas

```bash
pnpm remove react-router-dom @vitejs/plugin-react vite
```

#### 6.3 Actualizar scripts en package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:coverage": "vitest --coverage"
  }
}
```

---

## ✅ Parte 4: Lista de Verificación y Comandos

### Checklist Pre-Migración

- [ ] Backup del proyecto actual (git commit/branch)
- [ ] Documentar todas las env vars actuales
- [ ] Listar dependencias críticas y versiones
- [ ] Verificar compatibilidad de dependencias con Next.js 15
- [ ] Definir estrategia: migración en paralelo vs in-place

### Comandos de Ejecución - Fase 1

```bash
# 1. Crear rama de migración
cd /home/epti/Documents/epti-dev/sicora-app
git checkout -b feature/nextjs-migration

# 2. Crear proyecto Next.js en carpeta temporal
cd /tmp
pnpm create next-app@latest sicora-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --use-pnpm

# 3. Copiar estructura base al proyecto
cp -r /tmp/sicora-next/* \
  /home/epti/Documents/epti-dev/sicora-app/sicora-app-fe-next/
```

### Dependencias a Mantener

```json
{
  "dependencies": {
    "@headlessui/react": "^2.2.9",
    "@heroicons/react": "^2.2.0",
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toast": "^1.2.15",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.90.12",
    "axios": "^1.13.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "framer-motion": "^12.23.25",
    "immer": "^10.1.1",
    "lucide-react": "^0.522.0",
    "react-hook-form": "^7.59.0",
    "tailwind-merge": "^1.14.0",
    "zod": "^3.25.67",
    "zustand": "^4.5.7"
  }
}
```

### Dependencias a Eliminar

```bash
pnpm remove react-router-dom vite @vitejs/plugin-react
```

### Mapeo de Variables de Entorno

| Vite (`.env`)           | Next.js (`.env.local`)         |
| ----------------------- | ------------------------------ |
| `VITE_API_BASE_URL`     | `NEXT_PUBLIC_API_BASE_URL`     |
| `VITE_USER_SERVICE_URL` | `NEXT_PUBLIC_USER_SERVICE_URL` |
| `VITE_BRAND_NAME`       | `NEXT_PUBLIC_BRAND_NAME`       |
| `VITE_BRAND_SUBTITLE`   | `NEXT_PUBLIC_BRAND_SUBTITLE`   |
| `VITE_BUILD_TARGET`     | `NEXT_PUBLIC_BUILD_TARGET`     |
| `VITE_ORGANIZATION`     | `NEXT_PUBLIC_ORGANIZATION`     |
| `VITE_SHOW_LOGO`        | `NEXT_PUBLIC_SHOW_LOGO`        |
| `VITE_CONTACT_EMAIL`    | `NEXT_PUBLIC_CONTACT_EMAIL`    |
| `VITE_SUPPORT_URL`      | `NEXT_PUBLIC_SUPPORT_URL`      |
| `VITE_DOCS_URL`         | `NEXT_PUBLIC_DOCS_URL`         |

**Script de conversión:**

```bash
# Convertir .env.development a .env.local
sed 's/VITE_/NEXT_PUBLIC_/g' .env.development > .env.local
```

### Archivo de Configuración Next.js

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Habilitar strict mode
  reactStrictMode: true,

  // Optimización de imágenes
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.onevision.com.co',
      },
    ],
  },

  // Redirecciones (si necesarias)
  async redirects() {
    return [
      {
        source: '/demo',
        destination: '/design-tokens',
        permanent: false,
      },
    ];
  },

  // Variables de entorno públicas
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version,
  },
};

export default nextConfig;
```

### Verificación Post-Migración

```bash
# 1. Verificar build
pnpm build

# 2. Verificar tipos
pnpm type-check

# 3. Verificar lint
pnpm lint

# 4. Ejecutar tests
pnpm test

# 5. Verificar en desarrollo
pnpm dev
```

### Criterios de Aceptación Final

| Criterio                  | Verificación             |
| ------------------------- | ------------------------ |
| Todas las rutas funcionan | Navegar cada página      |
| Autenticación funciona    | Login/logout completo    |
| Estado persiste           | Refresh mantiene sesión  |
| Estilos idénticos         | Comparación visual       |
| API calls funcionan       | Network tab sin errores  |
| Build production OK       | `pnpm build` sin errores |
| Tests pasan               | `pnpm test` verde        |
| Lighthouse ≥ 90           | Performance audit        |

---

## 📅 Resumen Timeline

| Fase             | Duración | Entregable                             |
| ---------------- | -------- | -------------------------------------- |
| 1. Scaffolding   | 1-2 días | Proyecto Next.js base configurado      |
| 2. UI Components | 2-3 días | Librería UI completamente migrada      |
| 3. Layouts       | 1-2 días | Sistema de layouts institucionales     |
| 4. Auth + Estado | 2-3 días | Autenticación funcional con middleware |
| 5. Páginas       | 3-4 días | Todas las rutas migradas               |
| 6. Testing       | 1-2 días | Tests pasando, cleanup completo        |

**Total estimado: 10-16 días laborales**

---

## 🚦 Estrategia de Migración

### Opción A: Migración en Paralelo (Recomendada)

**Ventajas:**

- React actual sigue funcionando durante migración
- Menor riesgo de romper funcionalidad existente
- Permite comparación lado a lado
- Rollback fácil si hay problemas

**Proceso:**

1. Crear `sicora-app-fe-next/` junto a `sicora-app-fe/`
2. Migrar componentes y páginas progresivamente
3. Probar cada fase antes de continuar
4. Al finalizar, renombrar carpetas
5. Eliminar versión React antigua

### Opción B: Migración In-Place

**Ventajas:**

- Más rápido en términos de tiempo total
- Menos duplicación de código
- Git history más limpio

**Riesgos:**

- Mayor riesgo de romper funcionalidad
- Requiere branch dedicado estable
- Más difícil hacer rollback

---

## 📚 Referencias

- [Next.js 15 Documentation](https://nextjs.org/docs)
- [App Router Migration Guide](https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
