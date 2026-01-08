/**
 * SICORA - Middleware de Protección de Rutas
 *
 * Middleware de Next.js para proteger rutas del dashboard
 * y redirigir usuarios no autenticados.
 *
 * Funcionalidades:
 * - Verificación de token JWT
 * - Redirección a login si no autenticado
 * - Redirección a dashboard si ya autenticado (en rutas auth)
 * - Verificación de roles para rutas específicas
 *
 * @fileoverview Next.js middleware
 * @module middleware
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/usuarios',
  '/horarios',
  '/asistencia',
  '/justificaciones',
  '/alertas',
  '/qr',
  '/evaluaciones',
  '/kb',
  '/meval',
  '/proyectos',
  '/ai',
  '/perfil',
  '/configuracion',
];

// Rutas de autenticación (solo para usuarios NO autenticados)
const authRoutes = ['/login', '/forgot-password', '/reset-password'];

// Rutas públicas (no requieren autenticación)
const publicRoutes = ['/', '/api', '/_next', '/favicon.ico'];

// Rutas que requieren rol específico
const roleProtectedRoutes: Record<string, string[]> = {
  '/usuarios': ['admin', 'coordinador'],
  '/configuracion': ['admin', 'coordinador'],
  '/meval': ['admin', 'coordinador'],
  '/evaluaciones/config': ['admin'],
  '/evaluaciones/periodos': ['admin', 'coordinador'],
};

/**
 * Verifica si la ruta es pública
 */
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Verifica si la ruta es de autenticación
 */
function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Verifica si la ruta requiere autenticación
 */
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Obtiene el token de autenticación de las cookies
 */
function getAuthToken(request: NextRequest): string | null {
  // Intentar obtener de cookie HttpOnly (producción)
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  if (tokenFromCookie) return tokenFromCookie;

  // Intentar obtener del header Authorization (desarrollo/API)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
}

/**
 * Verifica si el token es válido (básico - no verifica firma)
 * En producción, esto debería verificar con el backend
 */
function isValidToken(token: string): boolean {
  try {
    // Verificar estructura básica de JWT
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decodificar payload
    const payload = JSON.parse(atob(parts[1]));

    // Verificar expiración
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Obtiene el rol del usuario del token
 */
function getUserRole(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.role || null;
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario tiene permiso para la ruta
 */
function hasRoutePermission(pathname: string, role: string): boolean {
  // Buscar si la ruta tiene restricción de rol
  for (const [route, allowedRoles] of Object.entries(roleProtectedRoutes)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(role);
    }
  }

  // Si no hay restricción específica, permitir acceso
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar rutas públicas y estáticas
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Para desarrollo: verificar localStorage via cookie especial
  // En producción, usar token JWT real
  const authStorage = request.cookies.get('auth-storage')?.value;
  let isAuthenticated = false;
  let userRole: string | null = null;

  // Intentar obtener estado de autenticación
  if (authStorage) {
    try {
      const authData = JSON.parse(authStorage);
      isAuthenticated = authData?.state?.isAuthenticated === true;
      userRole = authData?.state?.user?.role || null;
    } catch {
      isAuthenticated = false;
    }
  }

  // También verificar token JWT si existe
  const token = getAuthToken(request);
  if (token && isValidToken(token)) {
    isAuthenticated = true;
    userRole = getUserRole(token) || userRole;
  }

  // Ruta de autenticación + usuario autenticado = redirigir a dashboard
  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Ruta protegida + usuario NO autenticado = redirigir a login
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);

    // Guardar la URL original para redirigir después del login
    loginUrl.searchParams.set('redirect', pathname);

    return NextResponse.redirect(loginUrl);
  }

  // Verificar permisos de rol para rutas específicas
  if (isProtectedRoute(pathname) && isAuthenticated && userRole) {
    if (!hasRoutePermission(pathname, userRole)) {
      // Redirigir a dashboard con mensaje de error
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Agregar headers útiles para el cliente
  const response = NextResponse.next();

  if (isAuthenticated) {
    response.headers.set('x-user-authenticated', 'true');
    if (userRole) {
      response.headers.set('x-user-role', userRole);
    }
  }

  return response;
}

/**
 * Configuración del middleware
 * Define qué rutas deben pasar por el middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
