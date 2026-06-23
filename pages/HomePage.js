/**
 * HomePage.js
 *
 * Represents the main landing page of cms.plaee.cloud
 *
 * HOW TO UPDATE LOCATORS:
 * 1. Open https://cms.plaee.cloud in Chrome
 * 2. Press F12 → click the cursor icon → click any element
 * 3. Find the id, class, or text and update the locators below
 */

const BasePage = require('./BasePage');

class HomePage extends BasePage {
  constructor(page) {
    super(page);

    // ─── Locators ─────────────────────────────────────────────────
    // These are the elements we interact with on the homepage.
    // Update these if the site structure changes.

    // ── Real locators based on observed site structure ────────────

    // Top navigation category links (All | FIFA World Cup | Crypto | Sports | Politics | Culture | Economics | Companies)
    this.navLinks = page.locator('nav a, header a');
    this.navCategories = ['All', 'FIFA World Cup', 'Crypto', 'Sports', 'Politics', 'Culture', 'Economics', 'Companies'];

    // Portfolio button (top right)
    this.portfolioButton = page.getByText('Portfolio', { exact: false });

    // Hamburger menu button (top right ≡)
    this.hamburgerMenu = page.locator('button').filter({ hasText: /^$/ }).last(); // icon-only button

    // Live match hero section (France vs Iraq style banner at top)
    this.heroSection = page.locator('[class*="hero"], [class*="banner"], [class*="featured"]').first();

    // "All Markets" section heading
    this.allMarketsHeading = page.getByText('All Markets', { exact: false });

    // Market category filter tabs below "All Markets" heading
    this.marketFilterTabs = page.locator('[class*="tab"], [class*="filter"]').filter({ hasText: /All|FIFA|Crypto|Sports|Politics|Culture|Economics|Companies/ });

    // Market cards (each card is a clickable prediction market)
    this.marketCards = page.locator('[class*="card"], article').filter({ has: page.locator('[class*="title"], h3, h2') });

    // Search input
    this.searchInput = page.getByPlaceholder(/search/i);

    // FAQ section at bottom
    this.faqSection = page.getByText('FAQ', { exact: true });
    this.faqItems = page.locator('[class*="faq"] [class*="item"], [class*="accordion"]');

    // Footer
    this.footer = page.locator('footer');
  }

  // ─── Actions ──────────────────────────────────────────────────

  /**
   * Navigate to the homepage
   */
  async navigate() {
    await this.goto('/');
  }

  /**
   * Get all navigation link texts
   */
  async getNavLinkTexts() {
    return await this.navLinks.allTextContents();
  }

  /**
   * Click a nav link by its text label
   * @param {string} linkText - e.g. 'Markets', 'Home', 'Leaderboard'
   */
  async clickNavLink(linkText) {
    await this.page.getByRole('link', { name: linkText, exact: false }).first().click();
    await this.waitForPageLoad();
  }

  /**
   * Get all market category names shown on homepage
   */
  async getMarketCategories() {
    return await this.marketCategories.allTextContents();
  }

  /**
   * Get all market card titles visible on homepage
   */
  async getMarketCardTitles() {
    return await this.marketCards.allTextContents();
  }

  /**
   * Click on the first visible market card
   */
  async clickFirstMarket() {
    await this.marketCards.first().click();
    await this.waitForPageLoad();
  }

  // ─── Verifications ────────────────────────────────────────────

  /**
   * Check that the page loaded correctly (title, navbar, content)
   */
  async verifyPageLoaded() {
    const title = await this.getTitle();
    const hasNavbar = await this.isVisible('nav, header');
    const hasContent = await this.isVisible('main, [class*="content"], [class*="home"]');

    return { title, hasNavbar, hasContent };
  }

  /**
   * Check that market cards are visible
   */
  async verifyMarketsVisible() {
    return await this.isVisible('[class*="market"], [class*="card"]');
  }
}

module.exports = HomePage;
