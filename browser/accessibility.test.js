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
    child.once('error', error => { clearTimeout(deadline); reject(error); });
    child.once('exit', () => { clearTimeout(deadline); reject(new Error('Fixture server exited')); });
    child.stdout.on('data', data => {
      const address = data.toString().match(/http:\/\/127\.0\.0\.1:\d+/)?.[0];
      if (address) { clearTimeout(deadline); resolve(address); }
    });
  });
  browser = await chromium.launch({ headless: true,
    ...(process.env.BROWSER_CHANNEL ? { channel: process.env.BROWSER_CHANNEL } : {}) });
});
after(async () => { await browser?.close(); child?.kill(); });

async function fixture(width, contactResponse = route => route.fulfill({ json: { message: 'Solicitação fictícia recebida QA.' } })) {
  const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(8000);
  const errors = [], sent = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    if (url.pathname === '/api/config') return route.fulfill({ json: { contactAvailable: true } });
    if (url.pathname === '/api/contact') {
      sent.push(JSON.parse(route.request().postData()));
      return contactResponse(route);
    }
    return route.continue();
  });
  await page.goto(base);
  await page.locator('#contact-form [type=submit]').waitFor();
  return { page, errors, sent };
}

async function fillContact(page, contact = 'qa@example.invalid') {
  await page.locator('[name=name]').fill('Pessoa QA');
  await page.locator('[name=contact]').fill(contact);
  await page.locator('[name=challenge]').selectOption({ label: 'Sistema interno' });
  await page.locator('[name=message]').fill('Solicitação inteiramente fictícia para QA.');
  await page.locator('[name=consent]').check();
}

async function assertFocus(page, selector) {
  assert.ok(await page.locator(selector).evaluate(element => element === document.activeElement), 'Expected focus at ' + selector);
}

async function assertDialogKeyboard(page, selector) {
  for (const key of [...Array(10).fill('Tab'), ...Array(10).fill('Shift+Tab')]) {
    await page.keyboard.press(key);
    // Native dialogs may visit browser chrome (activeElement BODY), never a background control.
    assert.ok(await page.locator(selector).evaluate(dialog => dialog.contains(document.activeElement) || document.activeElement === document.body), 'Modal keyboard cannot enter background controls of ' + selector);
  }
}

test('desktop skip link bypasses header and project dialog traps keyboard then returns focus on Escape', async () => {
  const { page, errors } = await fixture(1440);
  try {
    await page.keyboard.press('Tab');
    await assertFocus(page, '.skip-link');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    assert.ok(await page.locator('main').evaluate(main => main.contains(document.activeElement)));
    await page.locator('[data-project=central]').focus();
    await page.keyboard.press('Enter');
    await assertFocus(page, '#project-dialog .dialog-close');
    await assertDialogKeyboard(page, '#project-dialog');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#project-dialog').open && document.body.style.overflow === '');
    await assertFocus(page, '[data-project=central]');
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('mobile menu supports keyboard containment, Escape and native section navigation', async () => {
  const { page, errors } = await fixture(390);
  try {
    await page.locator('.menu-toggle').focus();
    await page.keyboard.press('Enter');
    await assertFocus(page, '.mobile-nav-close');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
    assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
    await assertDialogKeyboard(page, '#mobile-nav');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('#mobile-nav').open && document.body.style.overflow === '');
    await assertFocus(page, '.menu-toggle');
    assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    await page.keyboard.press('Enter');
    await page.locator('#mobile-nav a[href="#solucoes"]').focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => location.hash === '#solucoes' && !document.querySelector('#mobile-nav').open && document.body.style.overflow === '');
    await page.keyboard.press('Tab');
    assert.ok(await page.locator('#solucoes').evaluate(section => section.contains(document.activeElement)));
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

for (const width of [390, 1440]) {
  test('project contact CTA hands keyboard to the form at ' + width + 'px, including repeated navigation', async () => {
    const { page, errors } = await fixture(width);
    try {
      for (const [project, challenge] of [['central', 'Sistema interno'], ['integracao', 'Integração entre ferramentas']]) {
        await page.locator('[data-project=' + project + ']').focus();
        await page.keyboard.press('Enter');
        await page.locator('#dialog-cta').focus();
        if (project === 'central') await page.keyboard.press('Enter');
        else await page.locator('#dialog-cta').click();
        await page.waitForFunction(() => location.hash === '#contato' && !document.querySelector('#project-dialog').open && document.body.style.overflow === '');
        assert.equal(await page.locator('[name=challenge]').inputValue(), challenge);
        await assertFocus(page, '[name=name]');
        const field = await page.locator('[name=name]').boundingBox();
        assert.ok(field.y >= 80 && field.y + field.height <= 844, 'Focused input stays visible below the header');
        await page.keyboard.press('Tab');
        await assertFocus(page, '[name=company]');
      }
      assert.deepEqual(errors, []);
    } finally { await page.close(); }
  });
}

test('mobile validation explains invalid contact without POST and clears error on correction', async () => {
  const { page, errors, sent } = await fixture(390);
  try {
    await fillContact(page, 'contato-invalido');
    await page.locator('#contact-form [type=submit]').focus();
    await page.keyboard.press('Enter');
    await assertFocus(page, '[name=contact]');
    assert.equal(await page.locator('[name=contact]').getAttribute('aria-invalid'), 'true');
    assert.equal(await page.locator('[name=contact]').getAttribute('aria-describedby'), 'contact-error');
    assert.equal(await page.locator('#contact-error').textContent(), 'Informe um e-mail válido ou WhatsApp com DDD.');
    assert.equal(sent.length, 0);
    await page.locator('[name=contact]').fill('qa@example.invalid');
    assert.equal(await page.locator('[name=contact]').getAttribute('aria-invalid'), null);
    assert.equal(await page.locator('#contact-error').textContent(), '');
    await page.locator('#contact-form [type=submit]').focus();
    await page.keyboard.press('Enter');
    await page.getByRole('status').filter({ hasText: 'Solicitação fictícia recebida QA.' }).waitFor();
    assert.equal(sent.length, 1);
    assert.deepEqual(errors, []);
  } finally { await page.close(); }
});

test('mobile pending request blocks concurrent submits, preserves fields on error and allows an explicit successful retry', async () => {
  let releaseResponse;
  const pending = new Promise(resolve => { releaseResponse = resolve; });
  let requests = 0;
  const { page, errors, sent } = await fixture(390, async route => {
    requests++;
    if (requests === 1) { await pending; return route.fulfill({ status: 503, json: { message: 'Serviço fictício indisponível QA.' } }); }
    return route.fulfill({ json: { message: 'Solicitação fictícia recebida QA.' } });
  });
  try {
    await fillContact(page);
    const submit = page.locator('#contact-form [type=submit]');
    await submit.focus();
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelector('#contact-form [type=submit]').getAttribute('aria-busy') === 'true');
    await assertFocus(page, '#contact-form [type=submit]');
    assert.equal(await submit.getAttribute('aria-disabled'), 'true');
    await page.keyboard.press('Enter');
    await submit.click({ force: true });
    await page.evaluate(() => { const form = document.querySelector('#contact-form'); form.requestSubmit(); form.requestSubmit(); });
    releaseResponse();
    await page.getByRole('status').filter({ hasText: 'Serviço fictício indisponível QA.' }).waitFor();
    assert.equal(sent.length, 1);
    assert.equal(await page.locator('[name=name]').inputValue(), 'Pessoa QA');
    assert.equal(await page.locator('[name=message]').inputValue(), 'Solicitação inteiramente fictícia para QA.');
    assert.equal(await page.locator('[name=consent]').isChecked(), true);
    assert.equal(await submit.getAttribute('aria-busy'), null);
    assert.equal(await submit.getAttribute('aria-disabled'), null);
    await submit.focus();
    await page.keyboard.press('Enter');
    await page.getByRole('status').filter({ hasText: 'Solicitação fictícia recebida QA.' }).waitFor();
    assert.equal(sent.length, 2);
    assert.equal(sent[1].consent, true);
    assert.equal(await page.locator('[name=name]').inputValue(), '');
    assert.equal(await page.locator('[name=consent]').isChecked(), false);
    assert.deepEqual(errors, []);
  } finally { releaseResponse(); await page.close(); }
});
