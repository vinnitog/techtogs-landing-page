import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

let child, browser, base;
before(async () => {
  child = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: '0', HOST: '127.0.0.1', NODE_ENV: 'production',
      RESEND_API_KEY: '', CONTACT_RECIPIENT: '', CONTACT_WEBHOOK_URL: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  base = await new Promise((resolve, reject) => {
    const deadline = setTimeout(() => reject(new Error('Fixture server startup timeout')), 10000);
    child.once('error', reject);
    child.once('exit', () => reject(new Error('Fixture server exited')));
    child.stdout.on('data', data => {
      const address = data.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (address) { clearTimeout(deadline); resolve(address); }
    });
  });
  browser = await chromium.launch({ headless: true,
    ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
});
after(async () => {
  await browser?.close();
  child?.kill();
});

async function fixture(path, width, reducedMotion = 'no-preference') {
  const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion });
  page.setDefaultTimeout(8000);
  const errors = [];
  const sent = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => {
    window.animationCalls = [];
    const original = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      window.animationCalls.push({ target: this.className.baseVal ?? this.className,
        frames: structuredClone(frames) });
      return original.call(this, frames, options);
    };
  });
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(base).origin) return route.abort();
    if (url.pathname === '/api/config') return route.fulfill({ json: { contactAvailable: true } });
    if (url.pathname === '/api/contact') {
      sent.push(JSON.parse(route.request().postData()));
      return route.fulfill({ json: { message: 'Solicitação fictícia recebida QA.' } });
    }
    return route.continue();
  });
  await page.goto(base + path);
  await page.getByRole('button', { name: 'Simular fluxo de automação' }).waitFor();
  return { page, errors, sent };
}

for (const [path, width] of [['/', 1440], ['/motion', 1440], ['/gsap', 1440], ['/motion-gsap', 390]]) {
  test('motion regression ' + path + ' at ' + width + 'px', async () => {
    const { page, errors } = await fixture(path, width);
    try {
      if (path !== '/gsap') {
        await page.locator('.flow-ai').hover();
        await page.waitForFunction(() => {
          const matrix = getComputedStyle(document.querySelector('.flow-ai')).transform;
          return matrix !== 'none' && Number(matrix.slice(7).split(',')[0]) > 1.005;
        });
      }
      await page.getByRole('button', { name: 'Simular fluxo de automação' }).click();
      await page.getByText('Demonstração concluída. Tudo conectado.', { exact: true }).waitFor();
      assert.equal(await page.locator('#simulate-flow').getAttribute('aria-busy'), null);
      assert.equal(await page.locator('.is-running').count(), 0);
      if (path !== '/gsap') {
        const calls = await page.evaluate(() => window.animationCalls);
        assert.ok(calls.some(call => call.frames.transform?.includes('scale(1.035)')));
        assert.ok(calls.some(call => call.frames.transform?.includes('rotate(-6deg) scale(1.14)')));
      }
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

test('reduced motion keeps flow and contact functional without Motion animations', async () => {
  const { page, errors, sent } = await fixture('/', 390, 'reduce');
  try {
    await page.getByRole('button', { name: 'Simular fluxo de automação' }).click();
    await page.getByText('Demonstração concluída. Tudo conectado.', { exact: true }).waitFor();
    assert.deepEqual(await page.evaluate(() => window.animationCalls), []);
    await page.locator('[name=name]').fill('Pessoa QA');
    await page.locator('[name=contact]').fill('qa@example.invalid');
    await page.locator('[name=challenge]').selectOption({ label: 'Sistema interno' });
    await page.locator('[name=message]').fill('Solicitação inteiramente fictícia para QA.');
    await page.locator('[name=consent]').check();
    await page.getByRole('button', { name: 'Enviar meu desafio' }).click();
    await page.getByText('Solicitação fictícia recebida QA.', { exact: true }).waitFor();
    assert.equal(sent.length, 1);
    assert.equal(sent[0].consent, true);
    assert.equal(await page.locator('[name=name]').inputValue(), '');
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});
