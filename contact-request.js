// Keep a margin inside the provider's documented 24-hour deduplication window.
export const RETRY_WINDOW = 23 * 60 * 60 * 1000;
const fields = ['name', 'company', 'contact', 'challenge', 'message'];
export function contactAttempt(previous, data, now = Date.now()) {
  const normalized = Object.fromEntries(fields.map(key => [key, String(data[key] || '').trim()]));
  const fingerprint = JSON.stringify({ ...normalized, consent: data.consent === true });
  if (previous?.fingerprint === fingerprint) {
    if (now - Date.parse(previous.submittedAt) >= RETRY_WINDOW) throw Object.assign(new Error('A confirmação desta tentativa expirou. Confira com a equipe antes de reenviar.'), { code: 'CONTACT_RETRY_EXPIRED' });
    return previous;
  }
  return { fingerprint, requestId: crypto.randomUUID(), submittedAt: new Date(now).toISOString() };
}
export function validateContactAttempt(input, now = Date.now()) {
  if (input.requestId === undefined && input.submittedAt === undefined) return null;
  const age = now - Date.parse(input.submittedAt);
  if (typeof input.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(input.requestId)
    || typeof input.submittedAt !== 'string' || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(input.submittedAt)
    || !Number.isFinite(age) || new Date(input.submittedAt).toISOString() !== input.submittedAt || age < -300000) throw Object.assign(new Error('Identificador ou horário da tentativa inválido. Confira o relógio do dispositivo.'), { status: 400 });
  if (age >= RETRY_WINDOW) throw Object.assign(new Error('A confirmação desta tentativa expirou. Confira com a equipe antes de reenviar.'), { status: 409 });
  return { id: input.requestId, createdAt: input.submittedAt };
}
