const CACHE_NAME = 'finance-tracker-v1.0.0';
const API_CACHE_NAME = 'finance-tracker-api-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// API endpoints that should be cached
const API_CACHE_PATTERNS = [
  /\/api\/transactions/,
  /\/api\/budgets/,
  /\/api\/auth\/me/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Old caches cleaned up');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip caching for Chrome extensions and non-http protocols
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleAPIRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const url = new URL(request.url);
  const shouldCache = API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!shouldCache || request.method !== 'GET') {
    // Don't cache non-GET requests or non-cacheable endpoints
    try {
      return await fetch(request);
    } catch (error) {
      console.error('Network request failed:', error);
      throw error;
    }
  }
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for:', request.url);
    
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return error response
    return new Response(
      JSON.stringify({
        error: 'Network unavailable and no cached data found',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Request failed:', error);
    
    // For navigation requests, return cached index.html
    if (request.mode === 'navigate') {
      const cachedResponse = await caches.match('/');
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Return error for other requests
    return new Response('Network error occurred', {
      status: 408,
      statusText: 'Request Timeout'
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncPendingTransactions());
  }
});

// Handle pending transactions when back online
async function syncPendingTransactions() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const keys = await cache.keys();
    
    // Find pending transactions in cache
    const pendingRequests = keys.filter(request => 
      request.url.includes('/api/transactions') && 
      request.method === 'POST'
    );
    
    // Sync each pending transaction
    for (const request of pendingRequests) {
      try {
        await fetch(request);
        await cache.delete(request);
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    title: 'Finance Tracker',
    body: event.data ? event.data.text() : 'New notification',
    icon: '/logo192.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],
    tag: 'finance-notification',
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/dismiss-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
  // Dismiss action or default click - just close notification
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});

// Message handling between service worker and main thread
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (if supported)
if ('periodicsync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'budget-check') {
      event.waitUntil(checkBudgetAlerts());
    }
  });
}

// Check for budget alerts
async function checkBudgetAlerts() {
  try {
    const response = await fetch('/api/budgets/alerts');
    if (response.ok) {
      const alerts = await response.json();
      
      if (alerts.length > 0) {
        // Show notification for budget alerts
        await self.registration.showNotification('Budget Alert', {
          body: `You have ${alerts.length} budget alert(s)`,
          icon: '/logo192.png',
          tag: 'budget-alert'
        });
      }
    }
  } catch (error) {
    console.error('Failed to check budget alerts:', error);
  }
}