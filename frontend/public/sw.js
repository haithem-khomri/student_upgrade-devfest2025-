// Service Worker for PWA
// In development, we skip caching to avoid stale content
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Use versioned cache name to force cache refresh
const CACHE_VERSION = 'student-ai-v2';
const CACHE_NAME = `${CACHE_VERSION}-${Date.now()}`;

// Install event
self.addEventListener('install', (event) => {
  if (isDevelopment) {
    // Skip caching in development
    self.skipWaiting();
    return;
  }
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache essential assets in production
        return cache.addAll([
          '/',
          '/dashboard',
        ]).catch((err) => {
          console.log('Cache install error:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('student-ai-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - Network first strategy in development
self.addEventListener('fetch', (event) => {
  // Skip caching for API routes
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Skip caching in development
  if (isDevelopment) {
    return;
  }
  
  // Network first strategy for production
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Cache successful GET requests
        if (event.request.method === 'GET' && response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});

