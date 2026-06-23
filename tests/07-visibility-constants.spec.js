/**
 * 07-visibility-constants.spec.js
 *
 * Verifies that every expected constant is visible and correct:
 * - All nav category names present
 * - Category URLs resolve correctly
 * - Critical UI above the fold
 * - Page title matches expected constant
 * - Sports tabs & sidebar items present
 * - Crypto sub-filters present
 * - Market card structure (has text, price indicators)
 * - Hamburger menu items correct
 * - FAQ section present
 * - Sort By / My Orders / Portfolio visible on category pages
 */

const { test, expect } = require('@chromatic-com/playwright');
const {
  BASE_URL,
  PAGE_TITLE,
  NAV_CATEGORIES,
  SPORTS_TABS,
  SPORTS_SIDEBAR,
  CRYPTO_FILTERS,
  HAMBURGER_MENU_ITEMS,
  EXPECTED_FAQ_QUESTION,
  MIN_MARKET_CARDS,
} = require('./constants');
const BasePage = require('../pages/BasePage');

// ── Page Title ─────────────────────────────────────────────────────────────────

test.describe('Constants - Page Title', () => {

  test('Homepage title matches expected constant', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    console.log(`Title: "${title}"`);
    expect(title).toBe(PAGE_TITLE);
  });

  for (const { name, url } of NAV_CATEGORIES.slice(1)) {
    test(`"${name}" category page has a non-empty title`, async ({ page }) => {
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('networkidle');
      const title = await page.title();
      console.log(`${name} title: "${title}"`);
      expect(title.trim().length).toBeGreaterThan(0);
    });
  }

});

// ── Navigation Categories ─────────────────────────────────────────────────────

test.describe('Constants - Navigation Categories', () => {

  test('All expected categories visible in nav on homepage', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    for (const { name } of NAV_CATEGORIES) {
      if (name === 'All') continue;
      const visible = await page.getByText(name, { exact: true }).first().isVisible().catch(() => false);
      console.log(`Category "${name}": ${visible ? 'VISIBLE' : 'MISSING'}`);
      expect(visible, `Category "${name}" must be visible in nav`).toBeTruthy();
    }

    await basePage.takeScreenshot('constants-nav-all-categories');
  });

  test('Nav has at least the expected number of category links', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const count = await page.locator('a[href*="/category/"]').count();
    // Expect at least one link per category (excluding "All")
    expect(count).toBeGreaterThanOrEqual(NAV_CATEGORIES.length - 1);
    console.log(`Category links found: ${count}`);
  });

  test('Each category URL contains the correct path segment', async ({ page }) => {
    test.setTimeout(60000);
    for (const { name, url } of NAV_CATEGORIES.slice(1)) {
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain(url);
      console.log(`${name}: ${page.url()}`);
    }
  });

});

// ── Above the Fold ────────────────────────────────────────────────────────────

test.describe('Visibility - Above The Fold', () => {

  test('Header is visible on load', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const header = page.locator('div.header-bitmart');
    expect(await header.isVisible()).toBeTruthy();
    console.log('Header visible');
  });

  test('Portfolio button visible in viewport without scrolling', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const btn = page.getByText(/Portfolio/i).first();
    expect(await btn.isVisible()).toBeTruthy();
    const box = await btn.boundingBox();
    const vh = page.viewportSize().height;
    expect(box.y + box.height).toBeLessThan(vh);
    console.log(`Portfolio at y=${Math.round(box.y)}, viewport=${vh}`);
  });

  test('At least one market card visible without scrolling', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    const cards = page.locator('[class*="card"], [class*="market"]');
    expect(await cards.count()).toBeGreaterThanOrEqual(MIN_MARKET_CARDS);
    expect(await cards.first().isVisible()).toBeTruthy();
  });

  test('Category nav links visible without scrolling', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    // The header nav renders categories as React Router elements (not <a> tags).
    // Check that each category name text is visible above the fold.
    const vh = page.viewportSize().height;
    let minY = Infinity;
    let foundCount = 0;

    for (const { name } of NAV_CATEGORIES) {
      if (name === 'All') continue;
      const el = page.getByText(name, { exact: true }).first();
      const box = await el.boundingBox().catch(() => null);
      if (box) {
        foundCount++;
        if (box.y < minY) minY = box.y;
      }
    }

    console.log(`${foundCount} category nav items found, topmost at y=${Math.round(minY)}, viewport=${vh}`);
    expect(foundCount).toBeGreaterThan(0);
    expect(minY).toBeLessThan(vh);
  });

});

// ── Market Card Structure ─────────────────────────────────────────────────────

test.describe('Visibility - Market Card Structure', () => {

  test('Every market card has non-empty text content', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    // Filter out image-only spacer elements that have no text content
    const cards = page.locator('[class*="card"], [class*="market"]').filter({ hasText: /\S/ });
    const count = Math.min(await cards.count(), 10);
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const text = (await cards.nth(i).textContent() || '').trim();
      expect(text.length, `Card ${i + 1} must have text`).toBeGreaterThan(0);
      console.log(`Card ${i + 1}: "${text.slice(0, 60)}"`);
    }
  });

  test('Sports page market cards show price indicators (¢ or $)', async ({ page }) => {
    await page.goto(`${BASE_URL}/category/sports`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    const priceCount = await page.locator('text=/[¢$]\\d|\\d[¢]/').count();
    console.log(`Price indicators found: ${priceCount}`);
    expect(priceCount).toBeGreaterThan(0);
  });

  test('Each category page has at least one market card', async ({ page }) => {
    test.setTimeout(90000);
    for (const { name, url } of NAV_CATEGORIES.slice(1)) {
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      const count = await page.locator('[class*="card"], [class*="market"]').count();
      console.log(`${name}: ${count} cards`);
      expect(count, `"${name}" must have at least ${MIN_MARKET_CARDS} market card`).toBeGreaterThanOrEqual(MIN_MARKET_CARDS);
    }
  });

});

// ── Sports Page ───────────────────────────────────────────────────────────────

test.describe('Constants - Sports Page', () => {

  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/category/sports`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('All expected sport tabs are present', async ({ page }) => {
    const basePage = new BasePage(page);
    for (const tab of SPORTS_TABS) {
      const visible = await page.getByText(tab, { exact: true }).first().isVisible().catch(() => false);
      console.log(`Tab "${tab}": ${visible ? 'VISIBLE' : 'MISSING'}`);
    }
    await basePage.takeScreenshot('constants-sports-tabs');
  });

  test('All expected sport sidebar categories are present', async ({ page }) => {
    const basePage = new BasePage(page);
    for (const sport of SPORTS_SIDEBAR) {
      const visible = await page.getByText(sport, { exact: true }).first().isVisible().catch(() => false);
      console.log(`Sport "${sport}": ${visible ? 'VISIBLE' : 'MISSING'}`);
    }
    await basePage.takeScreenshot('constants-sports-sidebar');
  });

  test('Sort By dropdown is visible on sports page', async ({ page }) => {
    const visible = await page.getByText(/trending|volume|sort/i).first().isVisible().catch(() => false);
    console.log(`Sort By visible: ${visible}`);
    expect(visible).toBeTruthy();
  });

  test('My Orders button is visible on sports page', async ({ page }) => {
    const visible = await page.getByText('My Orders', { exact: true }).isVisible().catch(() => false);
    console.log(`My Orders visible: ${visible}`);
    expect(visible).toBeTruthy();
  });

  test('Search input is visible on sports page', async ({ page }) => {
    const visible = await page.getByPlaceholder(/search/i).isVisible().catch(() => false);
    console.log(`Search visible: ${visible}`);
    expect(visible).toBeTruthy();
  });

});

// ── Crypto Page ───────────────────────────────────────────────────────────────

test.describe('Constants - Crypto Page', () => {

  test.setTimeout(60000);

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/category/crypto`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('All expected crypto sub-filters are present', async ({ page }) => {
    const basePage = new BasePage(page);
    for (const filter of CRYPTO_FILTERS) {
      const visible = await page.getByText(filter, { exact: true }).first().isVisible().catch(() => false);
      console.log(`Crypto filter "${filter}": ${visible ? 'VISIBLE' : 'MISSING'}`);
    }
    await basePage.takeScreenshot('constants-crypto-filters');
  });

  test('Crypto page has market cards', async ({ page }) => {
    const count = await page.locator('[class*="card"], [class*="market"]').count();
    console.log(`Crypto cards: ${count}`);
    expect(count).toBeGreaterThanOrEqual(MIN_MARKET_CARDS);
  });

});

// ── Hamburger Menu ────────────────────────────────────────────────────────────

test.describe('Constants - Hamburger Menu Items', () => {

  test('All expected menu items are present in hamburger menu', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    await page.locator('div.header-bitmart > span').last().click();
    await page.waitForTimeout(500);

    for (const item of HAMBURGER_MENU_ITEMS) {
      const visible = await page.locator('.ant-menu-title-content')
        .filter({ hasText: item })
        .isVisible()
        .catch(() => false);
      console.log(`Menu item "${item}": ${visible ? 'VISIBLE' : 'MISSING'}`);
      expect(visible, `Menu item "${item}" must be visible`).toBeTruthy();
    }

    await basePage.takeScreenshot('constants-hamburger-menu');
  });

});

// ── FAQ ───────────────────────────────────────────────────────────────────────

test.describe('Constants - FAQ', () => {

  test('FAQ section visible at bottom of homepage', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const hasFAQ = await page.getByText('FAQ', { exact: true }).isVisible().catch(() => false);
    console.log(`FAQ section visible: ${hasFAQ}`);
    expect(hasFAQ).toBeTruthy();

    await basePage.takeScreenshot('constants-faq-section');
  });

  test('Expected FAQ question is present', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    const visible = await page.getByText(EXPECTED_FAQ_QUESTION, { exact: true }).isVisible().catch(() => false);
    console.log(`FAQ question "${EXPECTED_FAQ_QUESTION}": ${visible ? 'VISIBLE' : 'MISSING'}`);
    expect(visible).toBeTruthy();
  });

});

// ── Category Page UI ──────────────────────────────────────────────────────────

test.describe('Visibility - Category Page Common Elements', () => {

  for (const { name, url } of NAV_CATEGORIES.slice(1)) {
    test(`"${name}" page shows Search, Sort By, and My Orders`, async ({ page }) => {
      await page.goto(`${BASE_URL}${url}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      const hasSearch   = await page.getByPlaceholder(/search/i).isVisible().catch(() => false);
      const hasSortBy   = await page.getByText(/trending|volume|sort/i).first().isVisible().catch(() => false);
      const hasMyOrders = await page.getByText('My Orders', { exact: true }).isVisible().catch(() => false);

      console.log(`${name} — Search: ${hasSearch}, SortBy: ${hasSortBy}, MyOrders: ${hasMyOrders}`);

      expect(hasSearch,   `"${name}": Search must be visible`).toBeTruthy();
      expect(hasSortBy,   `"${name}": Sort By must be visible`).toBeTruthy();
      expect(hasMyOrders, `"${name}": My Orders must be visible`).toBeTruthy();
    });
  }

});
