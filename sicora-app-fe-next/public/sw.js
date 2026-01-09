/// <reference lib="webworker" />

/**
 * Service Worker - PWA Offline Support
 * Sprint 15-16: PWA y sincronización offline
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'sicora-cache-v1';
const STATIC_CACHE = 'sicora-static-v1';
const API_CACHE = 'sicora-api-v1';

// Recursos estáticos que se cachean inmediatamente
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Rutas de API que se cachean con estrategia network-first
const API_ROUTES_CACHE_FIRST = [
  '/api/v1/programas',
  '/api/v1/grupos',
  '/api/v1/ambientes',
];

// Rutas de API que usan stale-while-revalidate
const API_ROUTES_SWR = [
  '/api/v1/estudiantes',
  '/api/v1/horarios',
];

// Rutas que nunca se cachean
const NO_CACHE_ROUTES = [
  '/api/v1/auth',
  '/api/v1/asistencia',
  '/api/ai/',
];

// ============================================================================
// INSTALACIÓN
// ============================================================================

self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');

  event.waitUntil(
    Promise.all([
      // Cache de recursos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
    ]).then(() => {
      console.log('[SW] Installation complete');
      // Activar inmediatamente sin esperar que otras tabs cierren
      return self.skipWaiting();
    })
  );
});

// ============================================================================
// ACTIVACIÓN
// ============================================================================

self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');

  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (
                name.startsWith('sicora-') &&
                name !== CACHE_NAME &&
                name !== STATIC_CACHE &&
                name !== API_CACHE
              );
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      }),
      // Tomar control de todas las tabs inmediatamente
      self.clients.claim(),
    ]).then(() => {
      console.log('[SW] Activation complete');
      // Notificar a los clientes
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({
            type: 'OFFLINE_READY',
            timestamp: new Date().toISOString(),
          });
        });
      });
    })
  );
});

// ============================================================================
// FETCH - ESTRATEGIAS DE CACHE
// ============================================================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no son HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar requests a otros dominios
  if (url.origin !== self.location.origin) {
    return;
  }

  // Determinar estrategia según el tipo de recurso
  if (request.destination === 'document') {
    // Páginas HTML: Network first, fallback to cache
    event.respondWith(networkFirstWithOfflineFallback(request));
  } else if (request.destination === 'script' || request.destination === 'style') {
    // Scripts y estilos: Cache first
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (request.destination === 'image') {
    // Imágenes: Cache first con timeout
    event.respondWith(cacheFirstWithTimeout(request, STATIC_CACHE, 3000));
  } else if (url.pathname.startsWith('/api/')) {
    // API requests: Estrategia según ruta
    event.respondWith(handleApiRequest(request));
  } else {
    // Otros recursos: Stale-while-revalidate
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
  }
});

// ============================================================================
// ESTRATEGIAS DE CACHE
// ============================================================================

/**
 * Cache First: Buscar en cache primero, si no existe ir a red
 */
async function cacheFirst(
  request: Request,
  cacheName: string
): Promise<Response> {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First Error:', error);
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Cache First con Timeout: Buscar en cache, si tarda mucho ir a cache
 */
async function cacheFirstWithTimeout(
  request: Request,
  cacheName: string,
  timeoutMs: number
): Promise<Response> {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const networkResponse = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Si hay una versión en cache, usarla
    const staleResponse = await caches.match(request);
    if (staleResponse) {
      return staleResponse;
    }

    return new Response('', { status: 504, statusText: 'Gateway Timeout' });
  }
}

/**
 * Network First con Fallback Offline
 */
async function networkFirstWithOfflineFallback(
  request: Request
): Promise<Response> {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache la respuesta para uso offline
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Buscar en cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Retornar página offline
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }

    return new Response('Offline', { status: 503 });
  }
}

/**
 * Network First: Intentar red primero, fallback a cache
 */
async function networkFirst(
  request: Request,
  cacheName: string
): Promise<Response> {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({ error: 'No hay conexión y no hay datos en cache' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Stale While Revalidate: Retornar cache inmediatamente, actualizar en background
 */
async function staleWhileRevalidate(
  request: Request,
  cacheName: string
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => cachedResponse || new Response('Offline', { status: 503 }));

  return cachedResponse || fetchPromise;
}

/**
 * Manejar requests de API con estrategia apropiada
 */
async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);

  // Requests que nunca se cachean
  if (NO_CACHE_ROUTES.some((route) => url.pathname.startsWith(route))) {
    try {
      return await fetch(request);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Sin conexión' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // POST/PUT/DELETE: Intentar enviar, si falla encolar para sync
  if (request.method !== 'GET') {
    try {
      return await fetch(request);
    } catch (error) {
      // Encolar para sincronización posterior
      await queueForSync(request);

      return new Response(
        JSON.stringify({
          success: true,
          offline: true,
          message: 'Cambio guardado localmente. Se sincronizará cuando haya conexión.',
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  // GET requests: Aplicar estrategia según ruta
  if (API_ROUTES_CACHE_FIRST.some((route) => url.pathname.startsWith(route))) {
    return cacheFirst(request, API_CACHE);
  }

  if (API_ROUTES_SWR.some((route) => url.pathname.startsWith(route))) {
    return staleWhileRevalidate(request, API_CACHE);
  }

  // Default: Network first
  return networkFirst(request, API_CACHE);
}

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);

  if (event.tag === 'sync-pending-changes') {
    event.waitUntil(syncPendingChanges());
  }
});

/**
 * Encolar request para sincronización posterior
 */
async function queueForSync(request: Request): Promise<void> {
  try {
    const body = await request.clone().text();
    const queueItem = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
    };

    // Guardar en IndexedDB (simplificado aquí)
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'QUEUE_FOR_SYNC',
        payload: queueItem,
        timestamp: new Date().toISOString(),
      });
    });

    // Registrar sync
    if ('sync' in self.registration) {
      await self.registration.sync.register('sync-pending-changes');
    }
  } catch (error) {
    console.error('[SW] Error queueing for sync:', error);
  }
}

/**
 * Sincronizar cambios pendientes
 */
async function syncPendingChanges(): Promise<void> {
  console.log('[SW] Syncing pending changes');

  try {
    // Notificar a los clientes que procesen la cola
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_REQUESTED',
        timestamp: new Date().toISOString(),
      });
    });
  } catch (error) {
    console.error('[SW] Sync error:', error);
    throw error; // Re-throw para reintentar
  }
}

// ============================================================================
// MENSAJES
// ============================================================================

self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);

  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_CACHE_SIZE':
      getCacheSize().then((size) => {
        event.ports[0]?.postMessage({ size });
      });
      break;

    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0]?.postMessage({ success: true });
      });
      break;

    case 'CACHE_URLS':
      if (payload?.urls) {
        cacheUrls(payload.urls).then(() => {
          event.ports[0]?.postMessage({ success: true });
        });
      }
      break;
  }
});

/**
 * Obtener tamaño total de caches
 */
async function getCacheSize(): Promise<number> {
  let totalSize = 0;

  const cacheNames = await caches.keys();
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.clone().blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

/**
 * Limpiar todos los caches
 */
async function clearAllCaches(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
}

/**
 * Cachear URLs específicas
 */
async function cacheUrls(urls: string[]): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
}

// ============================================================================
// PUSH NOTIFICATIONS (PREPARADO)
// ============================================================================

self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  if (!event.data) return;

  try {
    const data = event.data.json();

    const options: NotificationOptions = {
      body: data.body || 'Nueva notificación de SICORA',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
      },
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'SICORA', options)
    );
  } catch (error) {
    console.error('[SW] Push error:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click');

  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir nueva ventana
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});
