const PREFIX = '/api/owner/v1';
const failure = (status, code, message) => Response.json({success:false,error:{code,message}}, {status,headers:{'Cache-Control':'private, no-store'}});
export async function proxyOwner(request, upstream, fetcher = fetch) {
  const url = new URL(request.url);
  if (url.pathname !== PREFIX && !url.pathname.startsWith(PREFIX + '/')) return failure(404,'NOT_FOUND','Endpoint tidak ditemukan');
  if (!['GET','HEAD','POST','PUT','PATCH','DELETE','OPTIONS'].includes(request.method)) return failure(405,'METHOD_NOT_ALLOWED','Metode tidak didukung');
  if (/%(?:2f|5c|2e)|\\/.test(url.pathname.toLowerCase())) return failure(400,'INVALID_PATH','Path tidak valid');
  if (!['GET','HEAD'].includes(request.method) && request.headers.get('Origin') !== url.origin) return failure(403,'ORIGIN_FORBIDDEN','Origin tidak diizinkan');
  let target;
  try { target = new URL(upstream); if(target.protocol !== 'https:' || target.hostname !== 'pay.ghzm.us' || target.port || target.username || target.password || target.search || target.hash || target.pathname !== '/') throw Error(); }
  catch { return failure(503,'API_NOT_CONFIGURED','API owner belum dikonfigurasi'); }
  const headers = new Headers({'Accept':'application/json','Origin':url.origin});
  for(const key of ['content-type','cookie','x-csrf-token','idempotency-key']) { const value=request.headers.get(key); if(value) headers.set(key,value); }
  let body;
  if(!['GET','HEAD'].includes(request.method)) {
    if(Number(request.headers.get('content-length'))>65536) return failure(413,'PAYLOAD_TOO_LARGE','Payload terlalu besar');
    const reader=request.body?.getReader(); const chunks=[]; let size=0;
    if(reader) { for(;;) {const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>65536){await reader.cancel();return failure(413,'PAYLOAD_TOO_LARGE','Payload terlalu besar');}chunks.push(value);} }
    body=new Uint8Array(size);let at=0;for(const chunk of chunks){body.set(chunk,at);at+=chunk.length;}
  }
  try {
    const response=await fetcher(new URL(url.pathname+url.search,target),{method:request.method,headers,body,redirect:'manual',signal:AbortSignal.timeout(15000)});
    if(response.status>=300&&response.status<400) return failure(502,'UPSTREAM_REDIRECT','API mengembalikan redirect tak terduga');
    if(!(response.headers.get('content-type')||'').includes('application/json')) return failure(502,'API_NOT_READY','Endpoint API owner belum aktif');
    const out=new Headers({'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});
    for(const name of ['retry-after']) {const val=response.headers.get(name);if(val)out.set(name,val);}
    const cookies=response.headers.getSetCookie ? response.headers.getSetCookie() : response.headers.getAll ? response.headers.getAll('Set-Cookie') : [];
    for(const value of cookies) out.append('Set-Cookie',value.replace(/;\s*Domain=[^;]*/ig,'').replace(/;\s*Path=[^;]*/ig,'; Path=/api/owner/v1') + (/;\s*Secure/i.test(value)?'':'; Secure'));
    return new Response(response.body,{status:response.status,headers:out});
  } catch { return failure(502,'API_UNAVAILABLE','API tidak dapat dihubungi. Coba lagi nanti.'); }
}
