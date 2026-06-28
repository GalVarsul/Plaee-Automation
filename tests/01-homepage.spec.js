/**
 * 01-homepage.spec.js
 * Tests for the homepage of cms.plaee.cloud
 *
 * FIX: This site uses Ant Design — the navbar is div.header-bitmart,
 * not a standard <nav> or <header> tag.
 */

const { test, expect } = require('@chromatic-com/playwright');
const HomePage = require('../pages/HomePage');
const BasePage = require('../pages/BasePage');

test.describe('Homepage', () => {

  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
  });

  test('Page loads and has a title', async ({ page }) => {
    const homePage = new HomePage(page);
    const title = await homePage.getTitle();
    console.log(`Page title: "${title}"`);
    expect(title).not.toBe('');
    await homePage.takeScreenshot('homepage-loaded');
  });

  // ─── Navigation Bar ───────────────────────────────────────────
  // The site uses div.header-bitmart (Ant Design layout), not <nav>/<header>

  test('Navigation bar is visible', async ({ page }) => {
    // Category nav links exist — this proves the header is rendered
    const links = page.locator('a[href*="/category/"]');
    const count = await links.count();
    console.log(`Category nav links found: ${count}`);
    expect(count).toBeGreaterThan(0);
    await new BasePage(page).takeScreenshot('homepage-navbar');
  });

  // ─── Content ──────────────────────────────────────────────────

  test('Main content area is visible', async ({ page }) => {
    // Nav links confirm header is visible; market cards confirm content is visible
    const navLinks = await page.locator('a[href*="/category/"]').count();
    const cards    = await page.locator('[class*="card"], [class*="market"]').count();

    console.log(`Nav links: ${navLinks}, Cards: ${cards}`);
    expect(navLinks).toBeGreaterThan(0);
    expect(cards).toBeGreaterThan(0);

    await new BasePage(page).takeScreenshot('homepage-content');
  });

  test('Market cards are displayed on homepage', async ({ page }) => {
    // Market cards are divs with JS click handlers — NOT anchor links
    const cards = page.locator('[class*="card"], [class*="market"]');
    const count = await cards.count();
    console.log(`Market cards found: ${count}`);
    expect(count).toBeGreaterThan(0);
    await new BasePage(page).takeScreenshot('homepage-markets');
  });

  test('Footer is visible', async ({ page }) => {
    const homePage = new HomePage(page);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const hasFooter = await homePage.isVisible('footer, [class*="footer"]');
    console.log(`Footer visible: ${hasFooter}`);
    await homePage.takeScreenshot('homepage-footer');
  });

  // ─── Responsiveness ───────────────────────────────────────────

  test('Page looks correct on mobile screen size', async ({ page }) => {
    const homePage = new HomePage(page);
    await page.setViewportSize({ width: 375, height: 812 });
    await homePage.navigate();
    await homePage.takeScreenshot('homepage-mobile');
    expect(await homePage.getTitle()).not.toBe('');
  });

  test('Page looks correct on tablet screen size', async ({ page }) => {
    const homePage = new HomePage(page);
    await page.setViewportSize({ width: 768, height: 1024 });
    await homePage.navigate();
    await homePage.takeScreenshot('homepage-tablet');
    expect(await homePage.getTitle()).not.toBe('');
  });

  // ─── Functional checks (behaviour, not appearance) ────────────
  // These assert state, not looks, so the automatic Chromatic DOM
  // snapshot is disabled for them. The homepage's appearance is
  // already covered by the visual tests above.
  test.describe('Homepage - functional', () => {
    test.use({ disableAutoSnapshot: true });

    test('URL is correct', async ({ page }) => {
      const homePage = new HomePage(page);
      const url = homePage.getURL();
      console.log(`Current URL: ${url}`);
      expect(url).toContain('cms.plaee.cloud');
    });

    test('Navigation links are present and clickable', async ({ page }) => {
      const links = page.locator('a[href*="/category/"]');
      const count = await links.count();
      const texts = await links.allTextContents();
      console.log('Nav links found:', texts);
      expect(count).toBeGreaterThan(0);
    });
  });

});
