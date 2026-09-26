import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { get } from 'node:http';

test('production endpoints protect secrets and never silently save an undeliverable contact', async (t) => {
  const child = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: '0', HOST: '127.0.0.1', NODE_ENV: 'production', RESEND_API_KEY: '', CONTACT_RECIPIENT: '', CONTACT_WEBHOOK_URL: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => child.kill());
  const base = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timed out')), 10000);
    child.once('error', reject);
    child.once('exit', () => { clearTimeout(timeout); reject(new Error('Server exited')); });
    child.stdout.on('data', (data) => {
      const address = data.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (address) { clearTimeout(timeout); resolve(address); }
    });
  });
  assert.equal((await fetch(`${base}/health`)).status, 200);
  const redirect = await new Promise((resolve, reject) => {
    get(`${base}/politica-de-privacidade?from=footer`, { headers: { Host: 'www.techtogs.com.br' } }, (response) => {
      response.resume();
      resolve(response);
    }).on('error', reject);
  });
  assert.equal(redirect.statusCode, 308);
  assert.equal(redirect.headers.location, 'https://techtogs.com.br/politica-de-privacidade?from=footer');
  const config = await (await fetch(`${base}/api/config`)).json();
  assert.equal(config.contactAvailable, false);
  for (const route of ['/server.js', '/contact-email.js', '/.env', '/data/leads.jsonl']) {
    assert.equal((await fetch(base + route)).status, 404);
  }
  const send = (body, origin = base) => fetch(`${base}/api/contact`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(body)
  });
  assert.equal((await send({}, 'https://unrelated.example')).status, 403);
  assert.equal((await send({ website: 'spam' })).status, 400);
  const result = await send({ name: 'Teste', contact: 'test@example.com', challenge: 'Sistema interno', message: 'Teste sem envio ou armazenamento.', consent: true });
  assert.equal(result.status, 503);
  assert.match((await result.json()).message, /support@techtogs.com.br/);
});
