// Explicit, read-only public sampling. Never submit a form or call a provider API.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const target = 'https://techtogs.com.br/';
const allowed = new Set(['techtogs.com.br', 'fonts.googleapis.com', 'fonts.gstatic.com']);
const report = { sampledAt: new Date().toISOString(), target, fieldData: false, interactionsMeasured: false, samples: [] };
const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) });
const deadline = setTimeout(() => { void browser.close(); }, 180000);
try {
  for (const width of [1440, 390]) {
    for (let iteration = 0; iteration < 3; iteration++) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      try {
        await context.route('**/*', route => {
          const request = route.request(), url = new URL(request.url());
          return ['GET', 'HEAD'].includes(request.method()) && url.protocol === 'https:' && allowed.has(url.hostname)
            && !url.pathname.startsWith('/api/contact') ? route.continue() : route.abort();
        });
        await context.addInitScript(() => {
          window.publicPerf = { lcp: null, shifts: [], longTasks: [] };
          for (const type of ['largest-contentful-paint', 'layout-shift', 'longtask']) {
            if (!PerformanceObserver.supportedEntryTypes.includes(type)) continue;
            new PerformanceObserver(list => {
              for (const entry of list.getEntries()) {
                if (type === 'largest-contentful-paint') window.publicPerf.lcp = entry.startTime;
                else if (type === 'layout-shift' && !entry.hadRecentInput) window.publicPerf.shifts.push({ time: entry.startTime, value: entry.value });
                else if (type === 'longtask') window.publicPerf.longTasks.push(entry.duration);
              }
            }).observe({ type, buffered: true });
          }
        });
        const page = await context.newPage();
        const response = await page.goto(target, { waitUntil: 'load', timeout: 30000 });
        assert.equal(response.status(), 200);
        await page.waitForTimeout(4000);
        const result = await page.evaluate(() => {
          const { shifts, longTasks, lcp } = window.publicPerf;
          let cls = 0, total = 0, start = 0, last = -Infinity;
          for (const shift of shifts) {
            if (shift.time - last < 1000 && shift.time - start < 5000) total += shift.value;
            else { start = shift.time; total = shift.value; }
            last = shift.time; cls = Math.max(cls, total);
          }
          const navigation = performance.getEntriesByType('navigation')[0];
          const resources = performance.getEntriesByType('resource').map(entry => ({ url: entry.name, transfer: entry.transferSize, encoded: entry.encodedBodySize, decoded: entry.decodedBodySize }));
          return { visibility: document.visibilityState, lcpMs: lcp, clsWindowObserved: cls,
            longTasks: longTasks.length, longestTaskMs: longTasks.length ? Math.max(...longTasks) : 0,
            navigation: { ttfbMs: navigation.responseStart, encoded: navigation.encodedBodySize, decoded: navigation.decodedBodySize },
            resources, unknownResourceSizes: resources.filter(entry => !entry.transfer && !entry.encoded).length };
        });
        report.samples.push({ width, iteration, browser: browser.version(), ...result });
        console.log(JSON.stringify({ width, iteration, lcpMs: result.lcpMs, clsWindowObserved: result.clsWindowObserved, longTasks: result.longTasks, longestTaskMs: result.longestTaskMs }));
      } finally { await context.close(); }
    }
  }
  fs.mkdirSync('.tmp', { recursive: true });
  fs.writeFileSync(`.tmp/public-performance-${report.sampledAt.slice(0, 10).replaceAll('-', '')}.json`, JSON.stringify(report, null, 2));
} finally { clearTimeout(deadline); await browser.close(); }
