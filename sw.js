const CACHE_NAME = 'ai-study-assistant-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',

  // External CDNs
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://aistudiocdn.com/@google/genai@^1.29.1',
  'https://aistudiocdn.com/react-dom@^19.2.0/client',
  'https://esm.sh/react-markdown@9?deps=react@19',
  'https://esm.sh/remark-gfm@4'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Use addAll with a catch to prevent a single failed asset from breaking the entire cache
        return cache.addAll(urlsToCache).catch(error => {
          console.error('Failed to cache initial assets:', error);
        });
      })
  );
});

self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Cache hit - return response
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(event.request.clone()).then(
          networkResponse => {
            // Check if we received a valid response (status 200)
            // We don't cache redirects or errors.
            // Also, only cache requests for our own origin or known CDNs to avoid caching opaque responses
            if (networkResponse && networkResponse.status === 200 && (event.request.url.startsWith(self.location.origin) || event.request.url.includes('aistudiocdn.com') || event.request.url.includes('esm.sh'))) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          }
        ).catch(error => {
          console.log('Fetch failed; returning offline fallback if available.', error);
          // In a real-world app, you might want to return a custom offline fallback page.
          // For now, the browser will handle the offline error.
        });
      })
  );
});


self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});