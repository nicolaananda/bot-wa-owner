import assert from 'node:assert/strict';
import { handleLogin } from '../src/login.js';

class FakeFormData {
  constructor(form) { this.entries = form.values; }
  [Symbol.iterator]() { return Object.entries(this.entries)[Symbol.iterator](); }
}
globalThis.FormData = FakeFormData;

const submit = {
  disabled: false,
  attrs: new Set(),
  setAttribute(name) { this.attrs.add(name); },
  removeAttribute(name) { this.attrs.delete(name); },
};
const password = { value: 'secret' };
const form = {
  values: { owner: '62812', secret: 'secret' },
  querySelector: () => submit,
  elements: { namedItem: name => name === 'secret' ? password : null },
  resetCalled: false,
  reset() { this.resetCalled = true; password.value = ''; },
};
let prevented = false;
const event = { currentTarget: form, preventDefault() { prevented = true; } };
let csrf = '';
let loaded = false;
const promise = handleLogin(event, {
  request: async () => {
    await Promise.resolve();
    event.currentTarget = null; // Browser event cleanup after the first await.
    return { csrfToken: 'csrf-test' };
  },
  setCsrf: value => { csrf = value; },
  load: async () => { loaded = true; },
  setError: value => assert.equal(value, ''),
});
assert.equal(submit.disabled, true);
await promise;
assert.equal(prevented, true);
assert.equal(csrf, 'csrf-test');
assert.equal(form.resetCalled, true);
assert.equal(loaded, true);
assert.equal(submit.disabled, false);
assert.equal(submit.attrs.has('aria-busy'), false);

password.value = 'wrong';
let error = '';
await handleLogin({ currentTarget: form, preventDefault() {} }, {
  request: async () => { throw new Error('Kredensial salah'); },
  setCsrf: () => assert.fail('CSRF must not change'),
  load: () => assert.fail('load must not run'),
  setError: value => { error = value; },
});
assert.equal(error, 'Kredensial salah');
assert.equal(password.value, '');
assert.equal(submit.disabled, false);
console.log('login regression: PASS');
