export async function handleLogin(event, { request, setCsrf, load, setError }) {
  event.preventDefault();
  const formElement = event.currentTarget;
  const submit = formElement.querySelector('button[type="submit"]');
  const password = formElement.elements.namedItem('secret');
  if (submit.disabled) return;
  setError('');
  submit.disabled = true;
  submit.setAttribute('aria-busy', 'true');
  try {
    const form = new FormData(formElement);
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(form)),
    });
    setCsrf(data.csrfToken);
    formElement.reset();
    await load();
  } catch (error) {
    if (password) password.value = '';
    setError(error?.message || 'Tidak dapat masuk. Coba lagi.');
  } finally {
    submit.disabled = false;
    submit.removeAttribute('aria-busy');
  }
}
