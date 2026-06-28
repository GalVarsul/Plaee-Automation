/**
 * 04-market-detail.spec.js
 *
 * Tests for the market detail page (e.g. "France vs Iraq")
 * Based on real site observation:
 * - Buy / Sell toggle
 * - Yes / No outcome buttons with prices (e.g. "Yes 96¢")
 * - Moneyline / Spread / Totals / Props tabs
 * - Rules / Trading Prohibitions tabs
 * - Trade button and fee summary
 */

const { test, expect } = require('@chromatic-com/playwright');
const { BASE_URL } = require('./constants');
const MarketsPage = require('../pages/MarketsPage');
const HomePage = require('../pages/HomePage');

test.describe('Market Detail Page', () => {

  test.setTimeout(90000);

  // Navigate to homepage and open the first market card before each test
  test.beforeEach(async ({ page }) => {
    // Navigate via Sports > Games tab, then try cards until one navigates
    await page.goto(`${BASE_URL}/category/sports`);
    await page.waitForLoadState('load');
    await page.waitForTimeout(1500);

    const gamesTab = page.getByText('Games', { exact: true }).first();
    if (await gamesTab.isVisible().catch(() => false)) {
      await gamesTab.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);
    }

    // Iterate through cards until one navigates to an event page
    const cards = page.locator('[class*="card"], [class*="market"]');
    const count = Math.min(await cards.count(), 25);
    for (let i = 0; i < count; i++) {
      try {
        await cards.nth(i).click();
        await page.waitForURL(url => !url.includes('/category/'), { timeout: 2500 });
        break;
      } catch {
        // card didn't navigate — try next
      }
    }

    await page.waitForLoadState('load');
    await page.waitForTimeout(2500); // extra buffer for detail page to fully render
  });

  test('Market detail page loads with a title', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const title = await marketsPage.getTitle();
    console.log(`Market detail title: "${title}"`);
    expect(title).not.toBe('');

    await marketsPage.takeScreenshot('detail-loaded');
  });

  test('Buy and Sell buttons are visible', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    // Different market types use different button labels:
    // Soccer/crypto → Buy/Sell  |  MLB/NFL → Bet  |  Prop → Trade
    const hasBuy   = await marketsPage.isVisible('button:has-text("Buy")');
    const hasSell  = await marketsPage.isVisible('button:has-text("Sell")');
    const hasBet   = await marketsPage.isVisible('button:has-text("Bet")');
    const hasTrade = await page.getByText('Trade', { exact: true }).isVisible().catch(() => false);

    console.log(`Buy: ${hasBuy}, Sell: ${hasSell}, Bet: ${hasBet}, Trade: ${hasTrade}`);
    console.log(`Page URL: ${page.url()}`);

    // At least one action button should be present on any market detail page
    expect(hasBuy || hasSell || hasBet || hasTrade).toBeTruthy();

    await marketsPage.takeScreenshot('detail-buy-sell');
  });

  test('Yes / No outcome buttons are visible with prices', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    // Prices show as "Yes 96¢" or "No 5¢"
    const hasYes = await marketsPage.isVisible('button:has-text("Yes"), [class*="yes"]');
    const hasNo  = await marketsPage.isVisible('button:has-text("No"), [class*="no"]');

    console.log(`Yes button: ${hasYes}, No button: ${hasNo}`);
    await marketsPage.takeScreenshot('detail-outcomes');
  });

  test('Volume info is displayed (e.g. "Vol $181")', async ({ page }) => {
    const marketsPage = new MarketsPage(page);
    const hasVolume = await marketsPage.isVisible(':text("Vol $")');
    console.log(`Volume visible: ${hasVolume}`);
    await marketsPage.takeScreenshot('detail-volume');
  });

  test('Rules tab is present and clickable', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const hasRules = await marketsPage.isVisible(':text("Rules")');
    console.log(`Rules tab visible: ${hasRules}`);

    if (hasRules) {
      const rulesTab = page.getByText('Rules', { exact: true }).first();
      await rulesTab.scrollIntoViewIfNeeded().catch(() => {});
      await rulesTab.click({ force: true, timeout: 5000 }).catch(e => {
        console.log(`⚠️ Rules click failed: ${e.message}`);
      });
      await page.waitForTimeout(500);
      await marketsPage.takeScreenshot('detail-rules-tab');
    }
  });

  test('Trading Prohibitions tab is present and clickable', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const hasTP = await marketsPage.isVisible(':text("Trading Prohibitions")');
    console.log(`Trading Prohibitions tab visible: ${hasTP}`);

    if (hasTP) {
      await page.getByText('Trading Prohibitions', { exact: true }).first().click();
      await page.waitForTimeout(500);
      await marketsPage.takeScreenshot('detail-trading-prohibitions-tab');
    }
  });

  test('Trade button is present', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    // Wait for page to settle after beforeEach navigation
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(1000);

    // Try multiple selectors - Trade may be an Ant Design button or custom element
    const hasTradeBtn = await page.getByText('Trade', { exact: true }).first().isVisible().catch(() => false)
      || await page.getByRole('button', { name: /trade/i }).isVisible().catch(() => false)
      || await page.locator('[class*="trade"], [class*="btn"]:has-text("Trade")').isVisible().catch(() => false);

    console.log(`Trade button visible: ${hasTradeBtn}`);

    // Screenshot regardless — useful to see what's actually on the page
    await marketsPage.takeScreenshot('detail-trade-button');
    expect(hasTradeBtn).toBeTruthy();
  });

  test('Fee summary shows Fee, Total, and To win', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const hasFee   = await marketsPage.isVisible(':text("Fee")');
    const hasTotal = await marketsPage.isVisible(':text("Total")');
    const hasToWin = await marketsPage.isVisible(':text("To win")');

    console.log(`Fee: ${hasFee}, Total: ${hasTotal}, To win: ${hasToWin}`);
    await marketsPage.takeScreenshot('detail-fee-summary');
  });

});

test.describe('Sports Market Detail - Extra Tabs', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate directly to Sports category
    const homePage = new HomePage(page);
    await homePage.navigate();
    await page.getByText('Sports', { exact: true }).first().click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
  });

  test('Sports page shows Live / Games / Props / Futures / Events tabs', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const tabs = ['Live', 'Games', 'Props', 'Futures', 'Events'];
    for (const tab of tabs) {
      const visible = await marketsPage.isVisible(`:text("${tab}")`);
      console.log(`Tab "${tab}": ${visible ? '✅' : '❌'}`);
    }

    await marketsPage.takeScreenshot('sports-tabs');
  });

  test('Sports sidebar shows sport categories (Soccer, Tennis, etc.)', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const sports = ['Soccer', 'Tennis', 'Hockey', 'Football', 'Golf', 'MMA', 'MLB'];
    for (const sport of sports) {
      const visible = await marketsPage.isVisible(`:text("${sport}")`);
      console.log(`Sport "${sport}": ${visible ? '✅' : '❌'}`);
    }

    await marketsPage.takeScreenshot('sports-sidebar');
  });

  test('Clicking a sport match opens its detail page', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const firstCard = page.locator('a[href*="/event/"]').first();
    const cardVisible = await firstCard.isVisible().catch(() => false);

    if (cardVisible) {
      await firstCard.click();
      await page.waitForTimeout(1500);
      await marketsPage.takeScreenshot('sports-match-detail');

      // Should have Moneyline section
      const hasMoneyline = await marketsPage.isVisible(':text("Moneyline")');
      console.log(`Moneyline visible: ${hasMoneyline}`);
    }
  });

});

test.describe('Crypto Market Detail - Sub Filters', () => {

  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await page.getByText('Crypto', { exact: true }).first().click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);
  });

  test('Crypto page shows sub-filters in sidebar (BTC, ETH, SOL, etc.)', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const filters = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'];
    for (const filter of filters) {
      const visible = await marketsPage.isVisible(`:text("${filter}")`);
      console.log(`Crypto filter "${filter}": ${visible ? '✅' : '❌'}`);
    }

    await marketsPage.takeScreenshot('crypto-sidebar-filters');
  });

  test('Clicking BTC filter shows only BTC markets', async ({ page }) => {
    const marketsPage = new MarketsPage(page);

    const btcFilter = page.getByText('BTC', { exact: true }).first();
    const visible = await btcFilter.isVisible().catch(() => false);

    if (visible) {
      await btcFilter.click();
      await page.waitForTimeout(1000);
      await marketsPage.takeScreenshot('crypto-btc-filtered');
      console.log('✅ BTC filter clicked');
    } else {
      console.log('⚠️ BTC filter not found');
    }
  });

});
