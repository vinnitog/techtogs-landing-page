import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { get } from 'node:http';
import { once } from 'node:events';

test('local input errors stay 400 without provider calls; invalid accepted-provider JSON is 503, not validation', async t => {
  const program = `
    let calls = 0;
    globalThis.fetch = async (url, options) => {
      if (url !== 'https://api.resend.com/emails' || options.method !== 'POST') throw new Error('External network blocked');
      calls++;
      return calls === 1
        ? new Response('{invalid-fictional-provider-json', {status: 202})
        : new Response(JSON.stringify({id: 'fictional-provider-receipt'}), {status: 200});
    };
    process.on('message', message => {
      if (message === 'fixture-count') process.send({calls});
    });
    await import(${JSON.stringify(new URL('../server.js', import.meta.url).href)});
  `;
  const child = spawn(process.execPath, ['--input-type=module', '-e', program], {
    env: { ...process.env, PORT: '0', HOST: '127.0.0.1', NODE_ENV: 'production',
      RESEND_API_KEY: 'fixture-not-a-key', CONTACT_RECIPIENT: 'qa@example.invalid', CONTACT_WEBHOOK_URL: '' },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  });
  let errors = '';
  child.stderr.on('data', data => { errors += data.toString(); });
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) { const closed = once(child, 'close'); child.kill(); await closed; }
  });
  const base = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Fixture startup timeout')), 5000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('exit', () => { clearTimeout(timer); reject(new Error('Fixture exited')); });
    child.stdout.on('data', data => {
      const address = data.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (address) { clearTimeout(timer); resolve(address); }
    });
  });
  const calls = async () => {
    const reply = once(child, 'message', { signal: AbortSignal.timeout(3000) });
    child.send('fixture-count'); return (await reply)[0].calls;
  };
  const send = body => fetch(base + '/api/contact', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body,
    signal: AbortSignal.timeout(3000),
  });
  const lead = { name: 'Pessoa QA', contact: 'qa@example.invalid', challenge: 'Sistema interno',
    message: 'Solicitação inteiramente fictícia.', consent: true };
  for (const body of ['{invalid-input', 'null', '[]', JSON.stringify({ ...lead, name: 42 }), JSON.stringify({ ...lead, consent: false })]) {
    assert.equal((await send(body)).status, 400);
    assert.equal(await calls(), 0, 'Input failure cannot reach even the fictional provider.');
  }
  const failed = await send(JSON.stringify(lead));
  assert.equal(failed.status, 503);
  assert.equal((await failed.json()).message, 'Não foi possível confirmar o recebimento da sua mensagem. Confira com a equipe pelos contatos da página antes de reenviar.');
  assert.equal(await calls(), 1, 'Accepted-provider parse failure is not retried.');
  const accepted = await send(JSON.stringify(lead));
  assert.equal(accepted.status, 201);
  const receipt = await accepted.json();
  assert.match(receipt.message, /Recebemos sua mensagem/);
  assert.match(receipt.id, /^[a-f0-9-]{36}$/);
  assert.equal(await calls(), 2, 'Valid provider confirmation is one call per manual request.');
  const closed = once(child, 'close'); child.kill(); await closed;
  assert.equal(errors.trim(), 'Falha no recebimento de contato: SyntaxError', 'Only the error name is logged, without input/provider content.');
});

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
  const raw = headers => new Promise((resolve, reject) => {
    get(base + '/assets/variants/motion-gsap.js', { headers }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks) }));
    }).on('error', reject);
  });
  const identity = await raw({ 'Accept-Encoding': 'identity' });
  const compressed = await raw({ 'Accept-Encoding': 'gzip' });
  assert.equal(compressed.headers['content-encoding'], 'gzip');
  assert.equal(compressed.headers.vary, 'Accept-Encoding');
  assert.equal(compressed.headers['cache-control'], 'no-cache');
  assert.deepEqual((await import('node:zlib')).gunzipSync(compressed.body), identity.body);
  assert.ok(compressed.body.length < identity.body.length / 2);
  const notModified = await raw({ 'Accept-Encoding': 'gzip', 'If-None-Match': compressed.headers.etag });
  assert.equal(notModified.status, 304);
  assert.equal(notModified.body.length, 0);
  const head = await fetch(base + '/assets/variants/motion-gsap.js', { method: 'HEAD', headers: { 'Accept-Encoding': 'gzip' } });
  assert.equal(head.headers.get('content-length'), String(compressed.body.length));
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal((await raw({ 'Accept-Encoding': 'gzip;q=0, *;q=1' })).headers['content-encoding'], undefined);
  assert.equal((await fetch(base + '/api/config', { headers: { 'Accept-Encoding': 'gzip' } })).headers.get('content-encoding'), null);
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
