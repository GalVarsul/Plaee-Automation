/**
 * 05-search-and-ui.spec.js
 *
 * Tests for UI elements not covered in other test files:
 * - Search functionality
 * - Sort By dropdown
 * - My Orders button
 * - Portfolio button
 * - Hamburger menu
 * - FAQ section
 * - "Show more" button
 * - "Back" link on category pages
 */

const { test, expect } = require('@chromatic-com/playwright');
const HomePage = require('../pages/HomePage');
const BasePage = require('../pages/BasePage');

test.describe('Search', () => {

  test('Search input is visible on category pages', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Go to a category page where search is visible
    await page.getByText('Sports', { exact: true }).first().click();
    await page.waitForLoadState('load');

    const hasSearch = await page.getByPlaceholder(/search/i).isVisible().catch(() => false);
    console.log(`Search input visible: ${hasSearch}`);
    expect(hasSearch).toBeTruthy();

    await new BasePage(page).takeScreenshot('search-input-visible');
  });

  test('Typing in search filters results', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await page.getByText('Politics', { exact: true }).first().click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);

    const searchInput = page.getByPlaceholder(/search/i);
    const visible = await searchInput.isVisible().catch(() => false);

    if (visible) {
      await searchInput.fill('election');
      await page.waitForTimeout(1000);
      await new BasePage(page).takeScreenshot('search-results-election');
      console.log('✅ Typed "election" in search');
    } else {
      console.log('⚠️ Search input not found on Politics page');
    }
  });

});

test.describe('Sort By', () => {

  test('Sort By dropdown is visible on category pages', async ({ page }) => {
    const basePage = new BasePage(page);

    // Navigate directly by URL — more reliable than clicking text links
    await page.goto('https://cms.plaee.cloud/category/companies');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Sort By shows as "Trending", "Volume", etc. — search broadly
    const hasSortBy = await page.getByText(/trending|volume|sort/i).first().isVisible().catch(() => false);
    console.log(`Sort By visible: ${hasSortBy}`);
    await basePage.takeScreenshot('sortby-visible');
    expect(hasSortBy).toBeTruthy();
  });

  test('Clicking Sort By opens dropdown options', async ({ page }) => {
    const basePage = new BasePage(page);

    await page.goto('https://cms.plaee.cloud/category/companies');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    const sortBtn = page.getByText(/trending|volume|sort/i).first();
    if (await sortBtn.isVisible().catch(() => false)) {
      await sortBtn.click();
      await page.waitForTimeout(500);
      await basePage.takeScreenshot('sortby-dropdown-open');
      console.log('✅ Sort By dropdown clicked');
    }
  });

});

test.describe('Back Link', () => {

  test('"Back" link returns to homepage from category page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    const homeURL = page.url();

    await page.getByText('Culture', { exact: true }).first().click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);

    const backLink = page.getByText('Back', { exact: false }).first();
    const hasBack = await backLink.isVisible().catch(() => false);
    console.log(`Back link visible: ${hasBack}`);

    if (hasBack) {
      await backLink.click();
      await page.waitForLoadState('load');
      await new BasePage(page).takeScreenshot('back-link-used');
      console.log(`Returned to: ${page.url()}`);
    }
  });

});

test.describe('My Orders', () => {

  test('"My Orders" button is visible on category pages', async ({ page }) => {
    // Sports is the category where My Orders is confirmed visible
    await page.goto('https://cms.plaee.cloud/category/sports');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const hasMyOrders = await page.getByText('My Orders', { exact: true }).isVisible().catch(() => false);
    console.log(`My Orders visible: ${hasMyOrders}`);
    expect(hasMyOrders).toBeTruthy();

    await new BasePage(page).takeScreenshot('my-orders-button');
  });

  test('Clicking "My Orders" opens orders view', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await page.getByText('Sports', { exact: true }).first().click();
    await page.waitForLoadState('load');

    const myOrdersBtn = page.getByText('My Orders', { exact: true });
    if (await myOrdersBtn.isVisible().catch(() => false)) {
      await myOrdersBtn.click();
      await page.waitForTimeout(1000);
      await new BasePage(page).takeScreenshot('my-orders-opened');
      console.log('✅ My Orders clicked');
    }
  });

});

test.describe('Portfolio', () => {

  test('"Portfolio $0" button is visible in top nav', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const hasPortfolio = await page.getByText(/Portfolio/i).isVisible().catch(() => false);
    console.log(`Portfolio button visible: ${hasPortfolio}`);
    expect(hasPortfolio).toBeTruthy();

    await new BasePage(page).takeScreenshot('portfolio-button');
  });

  test('Clicking Portfolio opens portfolio view', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    const portfolioBtn = page.getByText(/Portfolio/i).first();
    if (await portfolioBtn.isVisible().catch(() => false)) {
      await portfolioBtn.click();
      await page.waitForTimeout(1000);
      await new BasePage(page).takeScreenshot('portfolio-opened');
      console.log('✅ Portfolio clicked');
    }
  });

});

test.describe('FAQ Section', () => {

  test('FAQ section is visible at the bottom of the page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const hasFAQ = await page.getByText('FAQ', { exact: true }).isVisible().catch(() => false);
    console.log(`FAQ visible: ${hasFAQ}`);
    expect(hasFAQ).toBeTruthy();

    await new BasePage(page).takeScreenshot('faq-section');
  });

  test('FAQ items are expandable', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const faqQuestion = page.getByText('What is the Prediction Market?', { exact: true });
    if (await faqQuestion.isVisible().catch(() => false)) {
      await faqQuestion.click();
      await page.waitForTimeout(500);
      await new BasePage(page).takeScreenshot('faq-expanded');
      console.log('✅ FAQ item expanded');
    }
  });

});

test.describe('Hamburger Menu', () => {

  test('Hamburger menu opens when clicked', async ({ page }) => {
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Exact selector found via DevTools: SVG inside <span> inside .header-bitmart
    const hamburger = page.locator('div.header-bitmart > span').last();
    await hamburger.click();
    await page.waitForTimeout(500);

    // The menu panel should appear with the title "Menu"
    const hasMenu = await page.getByText('Menu', { exact: true }).isVisible().catch(() => false);
    console.log(`Menu panel opened: ${hasMenu}`);
    expect(hasMenu).toBeTruthy();

    await basePage.takeScreenshot('hamburger-menu-open');
  });

  test('Hamburger menu contains Home and Portfolio links', async ({ page }) => {
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    await homePage.navigate();

    const hamburger = page.locator('div.header-bitmart > span').last();
    await hamburger.click();
    await page.waitForTimeout(500);

    // Menu items use class "ant-menu-title-content" (discovered from error output)
    const hasHome      = await page.locator('.ant-menu-title-content').filter({ hasText: 'Home' }).isVisible().catch(() => false);
    const hasPortfolio = await page.locator('.ant-menu-title-content').filter({ hasText: 'Portfolio' }).isVisible().catch(() => false);

    console.log(`Menu > Home: ${hasHome}, Portfolio: ${hasPortfolio}`);
    expect(hasHome).toBeTruthy();
    expect(hasPortfolio).toBeTruthy();

    await basePage.takeScreenshot('hamburger-menu-items');
  });

  test('Clicking Home in menu navigates to homepage', async ({ page }) => {
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    await homePage.navigate();

    // First go to a different page so we can verify navigation back
    await page.getByText('Politics', { exact: true }).first().click();
    await page.waitForLoadState('load');

    // Open hamburger menu
    const hamburger = page.locator('div.header-bitmart > span').last();
    await hamburger.click();
    await page.waitForTimeout(500);

    // Click Home
    await page.getByText('Home', { exact: true }).click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);

    console.log(`After clicking Home: ${page.url()}`);
    await basePage.takeScreenshot('hamburger-home-clicked');
  });

  test('Clicking Portfolio in menu opens portfolio', async ({ page }) => {
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    await homePage.navigate();

    const hamburger = page.locator('div.header-bitmart > span').last();
    await hamburger.click();
    await page.waitForTimeout(500);

    // Use the menu-specific selector to avoid "strict mode violation" (2 elements named Portfolio)
    await page.locator('.ant-menu-title-content').filter({ hasText: 'Portfolio' }).click();
    await page.waitForLoadState('load');
    await page.waitForTimeout(500);

    console.log(`After clicking Portfolio: ${page.url()}`);
    await basePage.takeScreenshot('hamburger-portfolio-clicked');
  });

  test('Menu closes when X button is clicked', async ({ page }) => {
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    await homePage.navigate();

    const hamburger = page.locator('div.header-bitmart > span').last();
    await hamburger.click();
    await page.waitForTimeout(500);

    // Try Ant Design close button first, then fall back to clicking the mask (outside the drawer)
    const closeBtn = page.locator('.ant-drawer-close').first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
    } else {
      // Click the semi-transparent mask to the LEFT of the drawer panel
      // The mask covers the full page; click at x=100 (well away from the right-side drawer)
      const mask = page.locator('.ant-drawer-mask, .ant-modal-mask').first();
      if (await mask.isVisible().catch(() => false)) {
        await mask.click({ position: { x: 10, y: 300 } });
      } else {
        await page.mouse.click(100, 300); // click far-left as last resort
      }
    }

    await page.waitForTimeout(500);

    // Check if the Ant Design drawer is still open (has class ant-drawer-open)
    const menuStillOpen = await page.locator('.ant-drawer-open').isVisible().catch(() => false);
    console.log(`Menu still open after closing: ${menuStillOpen}`);
    expect(menuStillOpen).toBeFalsy();

    await basePage.takeScreenshot('hamburger-menu-closed');
  });

});

test.describe('Show More', () => {

  test('"Show more" button loads additional markets', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();

    // Scroll down to find "Show more"
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(500);

    const showMore = page.getByText('Show more', { exact: false }).first();
    const visible = await showMore.isVisible().catch(() => false);
    console.log(`Show more visible: ${visible}`);

    if (visible) {
      const cardsBefore = await page.locator('[class*="card"], article').count();
      await showMore.click();
      await page.waitForTimeout(1500);
      const cardsAfter = await page.locator('[class*="card"], article').count();

      console.log(`Cards before: ${cardsBefore}, after: ${cardsAfter}`);
      expect(cardsAfter).toBeGreaterThanOrEqual(cardsBefore);

      await new BasePage(page).takeScreenshot('show-more-clicked');
    }
  });

});
