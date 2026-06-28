/**
 * MarketsPage.js
 *
 * Represents any page that lists or shows markets/events.
 * Also handles individual market detail pages.
 *
 * HOW TO UPDATE LOCATORS:
 * 1. Go to the markets section of the site
 * 2. Press F12 → inspect market cards and bet buttons
 * 3. Update the locators below to match what you see
 */

const BasePage = require('./BasePage');

class MarketsPage extends BasePage {
  constructor(page) {
    super(page);

    // ─── Real locators based on observed site structure ──────────

    // Market cards on listing pages
    this.marketCards = page.locator('[class*="card"], article');

    // Page heading (e.g. "Sports", "Crypto", "Politics")
    this.pageHeading = page.locator('h1, h2').first();

    // "Back" link (appears on category pages)
    this.backLink = page.getByText('Back', { exact: false });

    // Sort By dropdown (visible on all category pages)
    this.sortByDropdown = page.getByText('Trending', { exact: false });

    // Search input (top right on category pages)
    this.searchInput = page.getByPlaceholder(/search/i);

    // "My Orders" button (top right on category pages)
    this.myOrdersButton = page.getByText('My Orders', { exact: true });

    // ── Market Detail Page locators ───────────────────────────────

    // Match/event title (e.g. "France vs Iraq")
    this.marketDetailTitle = page.locator('h1, [class*="title"]').first();

    // Buy / Sell toggle
    this.buyButton = page.getByRole('button', { name: 'Buy', exact: true });
    this.sellButton = page.getByRole('button', { name: 'Sell', exact: true });

    // Yes / No outcome buttons (with price like "Yes 96¢")
    this.yesButton = page.getByText(/^Yes/i).first();
    this.noButton = page.getByText(/^No/i).first();

    // Dollar amount input
    this.dollarInput = page.getByLabel(/dollars/i).or(page.locator('input[type="number"]')).first();

    // Trade button
    this.tradeButton = page.getByRole('button', { name: 'Trade', exact: true });

    // Market tabs: Moneyline / Spread / Totals / Props (on Sports detail)
    this.moneylineTab = page.getByText('Moneyline', { exact: true });
    this.spreadTab = page.getByText('Spread', { exact: true });
    this.totalsTab = page.getByText('Totals', { exact: true });
    this.propsTab = page.getByText('Props', { exact: false });

    // Rules / Trading Prohibitions tabs
    this.rulesTab = page.getByText('Rules', { exact: true });
    this.tradingProhibitionsTab = page.getByText('Trading Prohibitions', { exact: true });

    // Volume info (e.g. "Vol $181")
    this.volumeInfo = page.getByText(/Vol \$/, { exact: false });

    // Sports-specific: sub-tabs (Live | Games | Props | Futures | Events)
    this.sportsLiveTab    = page.getByText('Live', { exact: false });
    this.sportsGamesTab   = page.getByText('Games', { exact: false });
    this.sportsFuturesTab = page.getByText('Futures', { exact: false });
    this.sportsEventsTab  = page.getByText('Events', { exact: false });

    // Sports left sidebar sport filters
    this.sportsSidebar = page.locator('[class*="sidebar"]');

    // Crypto left sidebar filters (5 Minute, 20 Minute, BTC, ETH, etc.)
    this.cryptoSubFilters = ['All', '5 Minute', '20 Minute', '2 Hour', 'One Time', 'BTC', 'ETH', 'SOL', 'XRP', 'DOGE'];
  }

  // ─── Actions ──────────────────────────────────────────────────

  /**
   * Get the count of market cards on the page
   */
  async getMarketCount() {
    return await this.marketCards.count();
  }

  /**
   * Get all market titles on the page
   */
  async getMarketTitles() {
    const cards = this.marketCards;
    const count = await cards.count();
    const titles = [];

    for (let i = 0; i < count; i++) {
      const title = await cards.nth(i).locator('[class*="title"], h2, h3').textContent().catch(() => null);
      if (title) titles.push(title.trim());
    }

    return titles;
  }

  /**
   * Click on a market card by index (0 = first)
   * @param {number} index
   */
  async clickMarketByIndex(index = 0) {
    await this.marketCards.nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Click on a market by its title text
   * @param {string} title
   */
  async clickMarketByTitle(title) {
    await this.page.getByText(title, { exact: false }).first().click();
    await this.waitForPageLoad();
  }

  /**
   * Filter markets by category (e.g. 'Sports', 'Crypto')
   * @param {string} category
   */
  async filterByCategory(category) {
    await this.page.getByRole('button', { name: category, exact: false }).click();
    await this.waitForPageLoad();
  }

  /**
   * Search for a market
   * @param {string} query
   */
  async searchMarket(query) {
    await this.searchInput.fill(query);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  // ─── Verifications ────────────────────────────────────────────

  /**
   * Verify a market detail page loaded correctly
   * Returns an object with what was found
   */
  async verifyMarketDetailPage() {
    return {
      hasTitle:    await this.isVisible('h1, [class*="title"]'),
      hasOutcomes: await this.isVisible('[class*="outcome"], [class*="option"], [class*="bet"]'),
      hasOdds:     await this.isVisible('[class*="odds"], [class*="probability"], [class*="percent"]'),
      hasVolume:   await this.isVisible('[class*="volume"], [class*="liquidity"]'),
      hasExpiry:   await this.isVisible('[class*="expiry"], [class*="close"], [class*="date"]'),
      url:         this.getURL(),
    };
  }

  /**
   * Verify that market cards are displayed and have content
   */
  async verifyMarketsListed() {
    const count = await this.getMarketCount();
    return {
      marketsFound: count,
      hasMarkets: count > 0,
    };
  }
}

module.exports = MarketsPage;
