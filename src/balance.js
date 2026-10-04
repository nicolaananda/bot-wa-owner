export function createBalanceAction(randomUUID = crypto.randomUUID.bind(crypto)) {
  return { key: randomUUID(), submitting: false };
}

export async function submitBalance({ id, form, action, request, reload }) {
  if (action.submitting) return false;
  const amount = Number(form.amount);
  if (!Number.isSafeInteger(amount) || amount <= 0 || !form.reason?.trim() || form.confirmation !== 'ADJUST') {
    throw new Error('Isi nominal positif, alasan, dan konfirmasi ADJUST.');
  }
  action.submitting = true;
  try {
    await request(`/users/${encodeURIComponent(id)}/balance-adjustments`, {
      method: 'POST',
      headers: { 'Idempotency-Key': action.key },
      body: JSON.stringify({ amount, operation: form.operation, reason: form.reason.trim(), confirmation: form.confirmation })
    });
    await reload();
    return true;
  } catch (error) {
    if (error.status === 409) await reload();
    throw error;
  } finally {
    action.submitting = false;
  }
}
