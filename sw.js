const CACHE='filesaathi-v6';
const OCR_FILES=['./libs/tesseract/tesseract.min.js','./libs/tesseract/worker.min.js','./libs/tesseract/core/tesseract-core-simd-lstm.wasm.js','./libs/tesseract/core/tesseract-core-lstm.wasm.js','./libs/tesseract/lang/eng.traineddata.gz','./libs/tesseract/lang/hin.traineddata.gz'];
const SHELL=['./','./index.html','./config.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png',
  './libs/jszip.min.js','./libs/pdf.min.js','./libs/pdf.worker.min.js','./libs/jspdf.umd.min.js'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).then(()=>c.addAll(OCR_FILES).catch(()=>{}))).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('filesaathi-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });

function openDB(){
  return new Promise((res,rej)=>{ const r=indexedDB.open('filesaathi',1);
    r.onupgradeneeded=()=>{ const d=r.result; ['docs','blobs','inbox'].forEach(s=>{ if(!d.objectStoreNames.contains(s)) d.createObjectStore(s); }); };
    r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); });
}
async function stash(files){
  const d=await openDB();
  await new Promise((res,rej)=>{ const t=d.transaction('inbox','readwrite'); const s=t.objectStore('inbox');
    files.forEach((f,i)=>s.put(f,Date.now()+'_'+i)); t.oncomplete=res; t.onerror=()=>rej(t.error); });
}

self.addEventListener('fetch',e=>{
  const req=e.request, url=new URL(req.url);
  // Files shared into FileSaathi from WhatsApp or other apps (Android)
  if(req.method==='POST' && url.pathname.endsWith('/share-target')){
    e.respondWith((async()=>{
      try{ const fd=await req.formData(); const files=fd.getAll('files').filter(f=>f && typeof f!=='string'); if(files.length) await stash(files); }catch{}
      return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303);
    })());
    return;
  }
  if(req.method!=='GET') return;
  // App files: network first so updates pushed to GitHub arrive, cache when offline
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{ if(r.ok){ const c=r.clone(); caches.open(CACHE).then(x=>x.put(req.mode==='navigate'?'./index.html':req,c)); } return r; })
      .catch(()=>caches.match(req.mode==='navigate'?'./index.html':req).then(h=>h||caches.match('./index.html'))));
    return;
  }
  // Libraries and fonts: cache first
  if(/cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url.host)){
    e.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(r=>{ if(r.ok||r.type==='opaque'){ const c=r.clone(); caches.open(CACHE).then(x=>x.put(req,c)); } return r; })));
  }
  // Google sign-in and Drive requests always go straight to the network
});
