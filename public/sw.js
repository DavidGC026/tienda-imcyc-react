// Service Worker para funcionalidad offline
const CACHE_NAME = 'tienda-imcyc-v2.0.0';
const EBOOKS_CACHE = 'ebooks-offline-v2';

// Archivos esenciales para funcionamiento offline
const STATIC_CACHE_URLS = [
  '/TiendaReact/',
  '/TiendaReact/static/js/main.8d803a9d.js',
  '/TiendaReact/static/css/main.a5b252b5.css',
  '/TiendaReact/manifest.json',
  '/TiendaReact/favicon.ico'
];

// Rutas que deben funcionar offline
const OFFLINE_ROUTES = [
  '/TiendaReact/',
  '/TiendaReact/biblioteca',
  '/TiendaReact/ebook/'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('SW: Instalando Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Cacheando archivos estáticos');
      return cache.addAll(STATIC_CACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activando Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== EBOOKS_CACHE) {
            console.log('SW: Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar peticiones de red
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // NO interceptar peticiones que no sean HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  // NO interceptar extensiones del navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }
  
  // NO interceptar peticiones que no sean de nuestro dominio
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Estrategia para archivos estáticos (CSS, JS, imágenes)
  if (isStaticResource(event.request)) {
    event.respondWith(cacheFirstStrategy(event.request));
    return;
  }
  
  // Estrategia para APIs (siempre intentar red primero)
  if (isApiRequest(event.request)) {
    event.respondWith(networkFirstStrategy(event.request));
    return;
  }
  
  // Estrategia para rutas de la app (HTML)
  if (isAppRoute(url.pathname)) {
    event.respondWith(appShellStrategy(event.request));
    return;
  }
  
  // Estrategia para ebooks offline
  if (isOfflineEbook(url.pathname)) {
    event.respondWith(ebookOfflineStrategy(event.request));
    return;
  }
  
  // Default: intentar red, luego caché (solo para nuestro dominio)
  event.respondWith(networkFirstStrategy(event.request));
});

// Estrategia: Cache First (para archivos estáticos)
async function cacheFirstStrategy(request) {
  try {
    // Verificar que sea una petición válida para cachear
    const url = new URL(request.url);
    if (!url.protocol.startsWith('http')) {
      return fetch(request);
    }
    
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok && networkResponse.status < 400) {
      try {
        await cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.log('SW: Error cacheando recurso:', cacheError);
        // Continuar sin cachear
      }
    }
    return networkResponse;
  } catch (error) {
    console.log('SW: Error en cacheFirstStrategy:', error);
    // Intentar servir desde caché como fallback
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      console.log('SW: Error accediendo a caché:', cacheError);
    }
    return new Response('Recurso no disponible offline', { status: 503 });
  }
}

// Estrategia: Network First (para APIs)
async function networkFirstStrategy(request) {
  try {
    // Para peticiones de autenticación, siempre usar la red sin interferir
    const url = new URL(request.url);
    if (url.pathname.includes('/auth/login') || url.pathname.includes('/auth/register') || url.pathname.includes('/auth/verify')) {
      return fetch(request);
    }
    
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('SW: Network failed, intentando caché para:', request.url);
    
    // NO usar caché para peticiones de autenticación
    const url = new URL(request.url);
    if (url.pathname.includes('/auth/')) {
      return new Response(JSON.stringify({
        error: 'Error de conexión en autenticación'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        return cachedResponse;
      }
    } catch (cacheError) {
      console.log('SW: Error accediendo a caché:', cacheError);
    }
    
    return new Response(JSON.stringify({
      error: 'Sin conexión y recurso no disponible offline'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Estrategia: App Shell (para rutas de la aplicación)
async function appShellStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('SW: Mostrando app shell offline para:', request.url);
    const cache = await caches.open(CACHE_NAME);
    const appShell = await cache.match('/TiendaReact/');
    return appShell || new Response('App no disponible offline', { status: 503 });
  }
}

// Estrategia: Ebooks Offline
async function ebookOfflineStrategy(request) {
  try {
    const cache = await caches.open(EBOOKS_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Ebook no disponible offline', { status: 404 });
  } catch (error) {
    return new Response('Error accediendo a ebook offline', { status: 503 });
  }
}

// Funciones helper
function isStaticResource(request) {
  return request.destination === 'script' || 
         request.destination === 'style' || 
         request.destination === 'image' ||
         request.url.includes('/static/');
}

function isApiRequest(request) {
  return request.url.includes('/api/');
}

function isAppRoute(pathname) {
  return OFFLINE_ROUTES.some(route => {
    if (route.endsWith('/')) {
      return pathname === route || pathname.startsWith(route);
    }
    return pathname === route;
  });
}

function isOfflineEbook(pathname) {
  return pathname.startsWith('/offline-ebook/');
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'TEST_MESSAGE') {
    // Manejar mensaje de prueba
    if (event.ports && event.ports[0]) {
      event.ports[0].postMessage({
        success: true,
        message: 'Test message received successfully',
        echo: event.data.data
      });
    }
  }
  
  if (event.data && event.data.type === 'CACHE_EBOOK') {
    // Manejar comunicación bidireccional con MessageChannel
    if (event.ports && event.ports[0]) {
      event.waitUntil(
        cacheEbookWithResponse(event.data.ebookData, event.ports[0])
      );
    } else {
      // Fallback al método anterior
      event.waitUntil(cacheEbook(event.data.ebookData));
    }
  }
});

// Cachear ebook cuando se solicite
async function cacheEbook(ebookData) {
  try {
    const cache = await caches.open(EBOOKS_CACHE);
    const response = new Response(ebookData.blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': ebookData.blob.size
      }
    });
    
    await cache.put(`/offline-ebook/${ebookData.id}`, response);
    console.log('SW: Ebook cacheado:', ebookData.id);
  } catch (error) {
    console.error('SW: Error cacheando ebook:', error);
  }
}

// Cachear ebook con respuesta bidireccional
async function cacheEbookWithResponse(ebookData, port) {
  try {
    const cache = await caches.open(EBOOKS_CACHE);
    
    // Crear blob desde ArrayBuffer si es necesario
    let blob;
    if (ebookData.arrayBuffer) {
      blob = new Blob([ebookData.arrayBuffer], { type: 'application/pdf' });
    } else if (ebookData.blob) {
      blob = ebookData.blob;
    } else {
      throw new Error('No se proporcionó datos del ebook');
    }
    
    const response = new Response(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': blob.size || ebookData.size
      }
    });
    
    await cache.put(`/offline-ebook/${ebookData.id}`, response);
    console.log('SW: Ebook cacheado exitosamente:', ebookData.id);
    
    // Enviar respuesta exitosa
    port.postMessage({
      success: true,
      message: 'Ebook cacheado exitosamente'
    });
  } catch (error) {
    console.error('SW: Error cacheando ebook:', error);
    
    // Enviar respuesta de error
    port.postMessage({
      success: false,
      error: error.message
    });
  }
}
