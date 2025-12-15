const CACHE_NAME = 'khelar-khata-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'
];

// ইনস্টল ইভেন্ট
self.addEventListener('install', (event) => {
  self.skipWaiting(); // নতুন সার্ভিস ওয়ার্কার সাথে সাথে একটিভ হবে
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// ফেচ ইভেন্ট (Network First strategy for HTML, Cache First for assets)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // নেটওয়ার্ক থেকে পেলে ক্যাশ আপডেট করুন এবং রেসপন্স দিন
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // নেটওয়ার্ক না থাকলে ক্যাশ থেকে লোড করুন
        return caches.match(event.request);
      })
  );
});

// একটিভ ইভেন্ট (পুরানো ক্যাশ ডিলিট করা)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});