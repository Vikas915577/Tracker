/* Winter Arc Tracker V26.0 — root and webcore PWA worker. */
const CACHE='winter-arc-v26.0';
const CORE=[
  './','./index.html','./styles.css','./v25-overrides.css','./v26-arcpilot.css',
  './app.js','./arcpilot.js','./manifest.json','./cloud-config.js',
  './icon-192.png','./icon-512.png','./creator-profile.jpg',
  './creator-photo-1.jpg','./creator-photo-2.jpg','./creator-photo-3.jpg'
];

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(async cache=>{
        await Promise.allSettled(CORE.map(path=>cache.add(path)));
      })
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys
        .filter(key=>key.startsWith('winter-arc-')&&key!==CACHE)
        .map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  event.respondWith((async()=>{
    const url=new URL(event.request.url);
    if(url.origin!==location.origin){
      try{return await fetch(event.request);}
      catch(_){return caches.match(event.request);}
    }
    try{
      if(event.request.mode==='navigate'){
        const response=await fetch(event.request,{cache:'no-store'});
        if(response.ok){
          const cache=await caches.open(CACHE);
          cache.put('./index.html',response.clone()).catch(()=>{});
        }
        return response;
      }
      const response=await fetch(event.request);
      if(response.ok){
        const cache=await caches.open(CACHE);
        cache.put(event.request,response.clone()).catch(()=>{});
      }
      return response;
    }catch(_){
      return (await caches.match(event.request)) || (await caches.match('./index.html'));
    }
  })());
});
