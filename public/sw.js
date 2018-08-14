let cacheName = 'ChatApp-v1';

const staticAssets = [
    './',
    './app.js',
    './auth.css',
    './chatpage.css'
];


self.addEventListener('install', function(ev){
    console.log(`[Service Worker] Installed`);
    self.skipWaiting();
    ev.waitUntill(
        caches.open(cacheName).then(function(cache){
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(staticAssets);
        })
    )

});



self.addEventListener('activate', function(ev){
    console.log(`[Service Worker] Activated`);
});
self.addEventListener('fetch', function(ev){
    console.log(`[Service Worker] fetcing`);
});