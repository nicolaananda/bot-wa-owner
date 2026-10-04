import assert from 'node:assert/strict';
import { createBalanceAction, submitBalance } from '../src/balance.js';

const action=createBalanceAction(()=> 'fixed-key'),calls=[];
let release;
const pending=new Promise(resolve=>release=resolve);
const request=(path,options)=>{calls.push([path,options]);return pending};
const input={id:'user/1',form:{amount:'25',operation:'credit',reason:' correction ',confirmation:'ADJUST'},action,request,reload:async()=>calls.push(['reload'])};
const first=submitBalance(input),second=await submitBalance(input);
assert.equal(second,false);
assert.equal(calls.length,1);
assert.equal(calls[0][0],'/users/user%2F1/balance-adjustments');
assert.equal(calls[0][1].method,'POST');
assert.equal(calls[0][1].headers['Idempotency-Key'],'fixed-key');
assert.deepEqual(JSON.parse(calls[0][1].body),{amount:25,operation:'credit',reason:'correction',confirmation:'ADJUST'});
release({});await first;
assert.equal(calls.at(-1)[0],'reload');

let conflicts=0;
await assert.rejects(submitBalance({id:'u',form:input.form,action:createBalanceAction(()=> 'retry-key'),request:async()=>{throw Object.assign(new Error('conflict'),{status:409})},reload:async()=>conflicts++}),/conflict/);
assert.equal(conflicts,1);
console.log('balance adjustment regression: PASS');