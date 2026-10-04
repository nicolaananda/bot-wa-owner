import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/pages/index.astro',import.meta.url),'utf8');
const values={from:{value:''},to:{value:''}};
const context=vm.createContext({$:id=>values[id],jakartaDate:()=> '2026-10-04'});
for(const name of ['rangeError','delta']){
 const start=source.indexOf(`function ${name}(`);
 const end=source.indexOf(name==='delta'?'\nconst money':'function rangeQuery',start+9);
 vm.runInContext(source.slice(start,end),context);
}
values.from.value='2026-10-01';assert.match(vm.runInContext('rangeError()',context),/berpasangan/);
values.to.value='2026-09-30';assert.match(vm.runInContext('rangeError()',context),/setelah/);
values.to.value='2026-10-05';assert.match(vm.runInContext('rangeError()',context),/hari ini/);
values.to.value='2026-10-04';assert.equal(vm.runInContext('rangeError()',context),'');
assert.match(vm.runInContext('delta(12)',context),/\+12%/);
assert.doesNotMatch(vm.runInContext('delta(null)',context),/NaN/);
assert.ok(source.includes("$('detailContent').onclick=detailClick"));
assert.ok(source.includes('<style is:global>'));
for(const contract of [
  '/users/${encodeURIComponent(id)}/ledger?page=${page}&limit=10',
  '/zoom/${encodeURIComponent(tier)}/hosts',
  '/zoom/${encodeURIComponent(tier)}/bookings',
  'Ekspor ringkasan CSV',
  'Detail order tidak tersedia pada kontrak API saat ini.',
  'Pemeriksaan dinonaktifkan'
]) assert.ok(source.includes(contract),`missing UI contract: ${contract}`);
assert.doesNotMatch(source,/request\([^\n]*stock[^\n]*method:\s*['"](?:POST|PUT|PATCH|DELETE)/i);
const csvStart=source.indexOf('function csvCell('),csvEnd=source.indexOf('function downloadCsv',csvStart);
vm.runInContext(source.slice(csvStart,csvEnd),context);
assert.equal(vm.runInContext("csvCell('=cmd')",context),'"\'=cmd"');
assert.equal(vm.runInContext("csvCell('a\\\"b')",context),'"a""b"');
console.log('dashboard capability/UI regression: PASS');
