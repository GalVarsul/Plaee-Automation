/**
 * BasePage.js
 *
 * Every page in our app extends this class.
 * It contains shared actions that work on ANY page:
 * taking screenshots, checking the title, waiting for load, etc.
 */

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - The Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  // ─── Navigation ──────────────────────────────────────────────

  /**
   * Go to a specific URL path (e.g. '/' or '/markets')
   */
  async goto(path = '/') {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  // ─── Page State ───────────────────────────────────────────────

  /**
   * Wait until the page has fully loaded (no more network requests)
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get the current page title
   */
  async getTitle() {
    return await this.page.title();
  }

  /**
   * Get the current URL
   */
  getURL() {
    return this.page.url();
  }

  // ─── Screenshots ─────────────────────────────────────────────

  /**
   * Take a full-page screenshot and save it to /screenshots folder
   * @param {string} name - filename without extension (e.g. 'homepage')
   */
  async takeScreenshot(name, fullPage = false) {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1500);
    const filename = `screenshots/${name}.png`;
    await this.page.screenshot({ path: filename, fullPage });
    console.log(`📸 Screenshot saved: ${filename}`);
    return filename;
  }

  // ─── Element Helpers ──────────────────────────────────────────

  /**
   * Check if an element is visible on the page
   * @param {string} selector - CSS selector or text
   */
  async isVisible(selector) {
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all text content from elements matching a selector
   * @param {string} selector
   */
  async getAllTexts(selector) {
    return await this.page.locator(selector).allTextContents();
  }

  /**
   * Click an element and wait for the page to settle
   * @param {string} selector
   */
  async clickAndWait(selector) {
    await this.page.locator(selector).click();
    await this.waitForPageLoad();
  }

  // ─── Health & Assertions ──────────────────────────────────────

  /**
   * Assert current URL contains the given path segment
   * @param {string} path
   */
  async assertURL(path) {
    const url = this.getURL();
    if (!url.includes(path)) {
      throw new Error(`Expected URL to contain "${path}" but got "${url}"`);
    }
  }

  /**
   * Assert the page title matches exactly
   * @param {string} expected
   */
  async assertTitle(expected) {
    const actual = await this.getTitle();
    if (actual !== expected) {
      throw new Error(`Expected title "${expected}" but got "${actual}"`);
    }
  }

  /**
   * Count occurrences of a selector on the page
   * @param {string} selector
   */
  async countElements(selector) {
    return await this.page.locator(selector).count();
  }

  /**
   * Measure how long a page navigation takes in milliseconds
   * @param {string} url
   */
  async measureLoadTime(url) {
    const start = Date.now();
    await this.page.goto(url);
    await this.waitForPageLoad();
    return Date.now() - start;
  }

  /**
   * Collect all console errors fired during a page load
   * @param {string} url
   */
  async collectConsoleErrors(url) {
    const errors = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    this.page.on('pageerror', err => errors.push(err.message));
    await this.page.goto(url);
    await this.waitForPageLoad();
    return errors;
  }

  /**
   * Scroll to the bottom of the page and wait for lazy content
   */
  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(500);
  }
}

module.exports = BasePage;
