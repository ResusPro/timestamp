const CACHE_NAME = "timestamp-logger-v1-4-0-rc3-handover";
const APP_SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
const shellUrls = new Set(APP_SHELL.map(path => new URL(path,self.registration.scope).href));

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(APP_SHELL.map(path => new Request(path,{cache:"reload"})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("timestamp-logger-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate" && shellUrls.has(url.origin+url.pathname)) {
    event.respondWith((async () => {
      const cache=await caches.open(CACHE_NAME);
      try {
        const response=await fetch(event.request,{cache:"no-store"});
        if(response.ok){await cache.put(new URL("./index.html",self.registration.scope).href,response.clone());return response;}
        return (await cache.match(new URL("./index.html",self.registration.scope).href)) || response;
      } catch(err){
        const cached=await cache.match(new URL("./index.html",self.registration.scope).href);
        if(cached)return cached;
        throw err;
      }
    })());
    return;
  }
  if (!shellUrls.has(url.href)) return;
  event.respondWith((async () => {
    const cache=await caches.open(CACHE_NAME);
    const cached=await cache.match(event.request);
    return cached || fetch(event.request);
  })());
});
