import { proxyOwner } from '../../../../src/proxy.js';
export const onRequest = ({request,env}) => proxyOwner(request,env.OWNER_API_UPSTREAM);
