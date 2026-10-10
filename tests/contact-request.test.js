import test from 'node:test';
import assert from 'node:assert/strict';
import { contactAttempt, validateContactAttempt, RETRY_WINDOW } from '../contact-request.js';

const payload = { name: ' Pessoa QA ', company: '', contact: 'qa@example.invalid', challenge: 'Sistema interno', message: 'Mensagem fictícia.', consent: true };
test('manual retry keeps identity and timestamp for the identical normalized payload', () => {
  const first = contactAttempt(null, payload, 1000000);
  assert.equal(contactAttempt(first, { ...payload, name: 'Pessoa QA' }, 1001000), first);
  assert.notEqual(contactAttempt(first, { ...payload, message: 'Outra intenção fictícia.' }, 1001000).requestId, first.requestId);
  assert.throws(() => contactAttempt(first, payload, 1000000 + RETRY_WINDOW), { code: 'CONTACT_RETRY_EXPIRED' });
  assert.equal(validateContactAttempt(first, 1001000).createdAt, first.submittedAt);
});
test('invalid, partial, future or expired metadata is rejected; legacy stays compatible', () => {
  const first = contactAttempt(null, payload);
  assert.equal(validateContactAttempt({}), null);
  for (const input of [{ requestId: first.requestId }, { submittedAt: first.submittedAt }, { ...first, requestId: 'bad' }, { ...first, submittedAt: 'bad' }, { ...first, submittedAt: new Date(Date.now() + 3600000).toISOString() }]) assert.throws(() => validateContactAttempt(input), { status: 400 });
  assert.throws(() => validateContactAttempt(first, Date.parse(first.submittedAt) + RETRY_WINDOW), { status: 409 });
});
