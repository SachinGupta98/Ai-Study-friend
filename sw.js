const CACHE_NAME = 'ai-study-assistant-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',

  // Core scripts
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/constants.ts',

  // Services
  '/services/authService.ts',
  '/services/geminiService.ts',

  // Components
  '/components/Auth.tsx',
  '/components/ChatMessage.tsx',
  '/components/GeneralChat.tsx',
  '/components/Header.tsx',
  '/components/Dashboard.tsx',
  '/components/Spinner.tsx',
  '/components/StudyPlanner.tsx',
  '/components/TopicSelector.tsx',
  '/components/TutorChat.tsx',

  // Icons
  '/components/icons/BookOpenIcon.tsx',
  '/components/icons/BookmarkIcon.tsx',
  '/components/icons/ChatBubbleIcon.tsx',
  '/components/icons/CheckCircleIcon.tsx',
  '/components/icons/CheckIcon.tsx',
  '/components/icons/ChevronLeftIcon.tsx',
  '/components/icons/ChevronRightIcon.tsx',
  '/components/icons/ClipboardIcon.tsx',
  '/components/icons/CodeBracketIcon.tsx',
  '/components/icons/DownloadIcon.tsx',
  '/components/icons/GeneralChatIcon.tsx',
  '/components/icons/LayoutDashboardIcon.tsx',
  '/components/icons/LogoutIcon.tsx',
  '/components/icons/PaperclipIcon.tsx',
  '/components/icons/SendIcon.tsx',
  '/components/icons/SparklesIcon.tsx',
  '/components/icons/XCircleIcon.tsx',

  // External CDNs
  'https://cdn.tailwindcss.com',
  'https://aistudiocdn.com/react@^19.2.0',
  'https://aistudiocdn.com/react-dom@^19.2.0',
  'https://aistudiocdn.com/@google/genai@^1.28.0',
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