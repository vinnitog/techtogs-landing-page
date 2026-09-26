import test from 'node:test';
import assert from 'node:assert/strict';
import { contactEmail, sendContactEmail } from '../contact-email.js';

const lead = { id: 'test-id', createdAt: '2026-09-26T00:00:00Z', name: '<b>Teste</b>', company: '', contact: 'visitor@example.com', challenge: 'Sistema interno', message: 'Mensagem de teste sem envio real.' };

test('fixed sender and recipient; visitor address is only the reply destination', () => {
  const message = contactEmail(lead, 'owner@example.com');
  assert.equal(message.from, 'TechTogs <support@techtogs.com.br>');
  assert.deepEqual(message.to, ['owner@example.com']);
  assert.equal(message.reply_to, 'visitor@example.com');
  assert.equal(message.html, undefined);
  assert.match(message.text, /<b>Teste<\/b>/);
  assert.equal(contactEmail({ ...lead, contact: '(11) 99999-9999' }, 'owner@example.com').reply_to, undefined);
});

test('provider accepts the request before delivery is confirmed', async () => {
  const id = await sendContactEmail(lead, {
    apiKey: 'test-only', recipient: 'owner@example.com',
    fetcher: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      assert.equal(options.headers['Idempotency-Key'], 'contact/test-id');
      assert.equal(JSON.parse(options.body).reply_to, lead.contact);
      return { ok: true, json: async () => ({ id: 'email-accepted' }) };
    }
  });
  assert.equal(id, 'email-accepted');
});

test('failed or unconfirmed delivery is never reported as success', async () => {
  for (const result of [{ ok: false }, { ok: true, json: async () => ({}) }]) {
    await assert.rejects(sendContactEmail(lead, { apiKey: 'test-only', recipient: 'owner@example.com', fetcher: async () => result }));
  }
  await assert.rejects(sendContactEmail(lead, { apiKey: '', recipient: 'owner@example.com', fetcher: () => assert.fail('must not call provider') }));
});
