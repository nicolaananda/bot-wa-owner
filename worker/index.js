import { proxyOwner } from '../src/proxy.js';
export default {fetch(request,env){const p=new URL(request.url).pathname;return p==='/api'||p.startsWith('/api/')?proxyOwner(request,env.OWNER_API_UPSTREAM):env.ASSETS.fetch(request)}};
