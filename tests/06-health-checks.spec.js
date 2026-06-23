/**
 * 06-health-checks.spec.js
 *
 * Site-wide health checks:
 * - Every page returns HTTP 200
 * - Site is served over HTTPS
 * - Pages load within the performance budget
 * - No critical console errors
 * - No failed network requests
 * - 404 pages handled gracefully
 * - API calls succeed
 */

const { test, expect } = require('@chromatic-com/playwright');
const { BASE_URL, NAV_CATEGORIES, PERFORMANCE_BUDGET_MS } = require('./constants');
const BasePage = require('../pages/BasePage');

// ── HTTP Status ────────────────────────────────────────────────────────────────

test.describe('Health - HTTP Status Codes', () => {

  for (const { name, url } of NAV_CATEGORIES) {
    test(`"${name}" page returns HTTP 200`, async ({ page }) => {
      const response = await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('load');
      const status = response.status();
      console.log(`${name} (${BASE_URL}${url}) → ${status}`);
      expect(status).toBe(200);
    });
  }

  test('Non-existent page handled gracefully — no crash', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/this-page-does-not-exist-xyz999`);
    const status = response.status();
    console.log(`404 test: HTTP ${status}, URL: ${page.url()}`);
    // App must respond — either redirect (200) or explicit 404
    expect([200, 404]).toContain(status);
    // Body must not be blank
    const bodyText = (await page.locator('body').textContent()).trim();
    expect(bodyText.length).toBeGreaterThan(0);
  });

});

// ── HTTPS & Security ──────────────────────────────────────────────────────────

test.describe('Health - HTTPS & Security', () => {

  test('Homepage is served over HTTPS', async ({ page }) => {
    await page.goto(BASE_URL);
    expect(page.url()).toMatch(/^https:\/\//);
    console.log(`HTTPS confirmed: ${page.url()}`);
  });

  test('All internal category hrefs use HTTPS (no mixed content)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    const links = await page.locator('a[href*="/category/"]').all();
    for (const link of links) {
      const href = await link.getAttribute('href');
      if (href && href.startsWith('http')) {
        expect(href, `Link "${href}" must be HTTPS`).toMatch(/^https:\/\//);
      }
    }
    console.log(`${links.length} category links checked — all HTTPS`);
  });

  test('Page does not expose sensitive data in URL', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    const url = page.url();
    expect(url).not.toMatch(/password|token|secret|key=/i);
    console.log(`URL clean: ${url}`);
  });

});

// ── Performance ───────────────────────────────────────────────────────────────

test.describe('Health - Performance', () => {

  test(`Homepage loads within ${PERFORMANCE_BUDGET_MS}ms`, async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    const elapsed = Date.now() - start;
    console.log(`Homepage: ${elapsed}ms (budget: ${PERFORMANCE_BUDGET_MS}ms)`);
    expect(elapsed).toBeLessThan(PERFORMANCE_BUDGET_MS);
  });

  test(`Sports category loads within ${PERFORMANCE_BUDGET_MS}ms`, async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/category/sports`);
    await page.waitForLoadState('load');
    const elapsed = Date.now() - start;
    console.log(`Sports: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(PERFORMANCE_BUDGET_MS);
  });

  test(`Crypto category loads within ${PERFORMANCE_BUDGET_MS}ms`, async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/category/crypto`);
    await page.waitForLoadState('load');
    const elapsed = Date.now() - start;
    console.log(`Crypto: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(PERFORMANCE_BUDGET_MS);
  });

  test(`Politics category loads within ${PERFORMANCE_BUDGET_MS}ms`, async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/category/politics`);
    await page.waitForLoadState('load');
    const elapsed = Date.now() - start;
    console.log(`Politics: ${elapsed}ms`);
    expect(elapsed).toBeLessThan(PERFORMANCE_BUDGET_MS);
  });

});

// ── Console & Network ─────────────────────────────────────────────────────────

test.describe('Health - Console & Network', () => {

  test('Homepage has no critical JavaScript errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE_URL);
    await page.waitForLoadState('load');

    const critical = errors.filter(e =>
      !e.includes('favicon') &&
      !e.includes('analytics') &&
      !e.includes('gtag') &&
      !e.includes('ERR_BLOCKED_BY_CLIENT') &&
      !e.includes('net::ERR_ABORTED')
    );

    console.log(`Console errors (filtered): ${critical.length}`);
    critical.forEach(e => console.log(`  ERROR: ${e}`));
    expect(critical.length).toBe(0);
  });

  test('No failed network requests on homepage', async ({ page }) => {
    const failed = [];
    page.on('requestfailed', req => {
      failed.push({ url: req.url(), error: req.failure()?.errorText });
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('load');

    const critical = failed.filter(r =>
      !r.url.includes('analytics') &&
      !r.url.includes('tracking') &&
      !r.url.includes('fonts.gstatic') &&
      !r.url.includes('ads') &&
      !r.url.includes('gtag') &&
      !r.url.includes('_rsc=')   // Next.js React Server Component prefetch — aborts are normal
    );

    console.log(`Failed requests: ${critical.length}`);
    critical.forEach(r => console.log(`  FAILED: ${r.url} → ${r.error}`));
    expect(critical.length).toBe(0);
  });

  test('API responses on homepage all return 2xx', async ({ page }) => {
    const apiErrors = [];
    page.on('response', res => {
      if (res.url().includes('plaee.cloud') && res.status() >= 400) {
        apiErrors.push({ url: res.url(), status: res.status() });
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('load');

    console.log(`API errors: ${apiErrors.length}`);
    apiErrors.forEach(r => console.log(`  API ERROR: ${r.url} → ${r.status}`));
    expect(apiErrors.length).toBe(0);
  });

  test('No JavaScript errors on Sports page', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`${BASE_URL}/category/sports`);
    await page.waitForLoadState('load');

    console.log(`JS errors on Sports: ${errors.length}`);
    errors.forEach(e => console.log(`  ERROR: ${e}`));
    expect(errors.length).toBe(0);
  });

});
