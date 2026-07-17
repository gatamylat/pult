/* Латимер 2 · service worker · network-first, офлайн из кэша */
const CACHE='pult-v2';
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./','./index.html'])).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return; /* api.anthropic.com и шрифты — мимо кэша */
  e.respondWith(
    fetch(e.request).then(r=>{
      const cp=r.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
      return r;
    }).catch(()=>caches.match(e.request).then(m=>m||caches.match('./index.html')))
  );
});
