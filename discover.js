/**
 * discover.js
 *
 * Run this FIRST before writing tests.
 * It visits the site and prints out everything it finds:
 * - All links and their URLs
 * - All buttons and their text
 * - All input fields
 * - Page title
 *
 * This helps you know what locators to use in your tests.
 *
 * WHY THE FIX: This site is a SPA (Single Page Application).
 * The URL doesn't change when you click nav links — React/Vue
 * handles navigation internally. So instead of following hrefs,
 * we CLICK each link and take a screenshot of whatever appears.
 *
 * HOW TO RUN:
 *   node discover.js
 */

const { chromium } = require('playwright');

const BASE_URL = 'https://cms.plaee.cloud';

/**
 * Get a stable "fingerprint" of the current page.
 * We use ONLY headings and the URL hash — NOT live data like odds or scores,
 * because those update every second and would make identical pages look different.
 */
async function getPageFingerprint(page) {
  const url = page.url();
  const stableContent = await page.evaluate(() => {
    // Only grab headings and nav items — these don't change with live data
    const headings = [...document.querySelectorAll('h1, h2, h3, nav a, [class*="tab"], [class*="category"]')]
      .map(el => el.innerText.trim())
      .filter(t => t.length > 0)
      .join('|');
    return headings;
  });
  return `${url}::${stableContent}`;
}

/**
 * Print and screenshot the current state of the page (after a click)
 */
async function snapshotCurrentPage(page, label) {
  // Wait for any animations/data loading to finish
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1000); // extra buffer for SPA rendering

  const title = await page.title();
  const url = page.url();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 PAGE: ${label}`);
  console.log(`🔗 URL: ${url}`);
  console.log(`Title: "${title}"`);
  console.log('='.repeat(60));

  // Screenshot
  const safeName = label.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase().slice(0, 50);
  const filename = `screenshots/discover-${safeName}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`📸 Screenshot: ${filename}`);

  // All links
  const links = await page.locator('a').all();
  console.log(`\n--- Links (${links.length}) ---`);
  for (const link of links) {
    const text = (await link.textContent() || '').trim();
    const href = await link.getAttribute('href') || '';
    if (text) console.log(`  "${text}" → ${href || '(no href, JS navigation)'}`);
  }

  // All buttons
  const buttons = await page.locator('button').all();
  console.log(`\n--- Buttons (${buttons.length}) ---`);
  for (const btn of buttons) {
    const text = (await btn.textContent() || '').trim();
    const classes = (await btn.getAttribute('class') || '').slice(0, 60);
    if (text) console.log(`  "${text}" [class="${classes}"]`);
  }

  // All inputs
  const inputs = await page.locator('input, textarea, select').all();
  console.log(`\n--- Inputs (${inputs.length}) ---`);
  for (const input of inputs) {
    const type = await input.getAttribute('type') || 'text';
    const name = await input.getAttribute('name') || '';
    const placeholder = await input.getAttribute('placeholder') || '';
    const id = await input.getAttribute('id') || '';
    console.log(`  type="${type}" name="${name}" id="${id}" placeholder="${placeholder}"`);
  }

  // All headings
  const headings = await page.locator('h1, h2, h3').all();
  console.log(`\n--- Headings (${headings.length}) ---`);
  for (const h of headings) {
    const text = (await h.textContent() || '').trim();
    const tag = await h.evaluate(el => el.tagName);
    if (text) console.log(`  <${tag}> "${text}"`);
  }
}

(async () => {
  console.log('🚀 Starting site discovery for', BASE_URL);
  console.log('NOTE: This site is a SPA — we click nav links instead of following URLs.\n');

  const fs = require('fs');
  if (!fs.existsSync('screenshots')) fs.mkdirSync('screenshots');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // ── Step 1: Load homepage ─────────────────────────────────────
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await snapshotCurrentPage(page, 'homepage');

    // ── Step 2: Collect all nav link labels BEFORE clicking ───────
    // We collect text labels first, then click one by one.
    // (If we store element references, they go stale after navigation.)
    const navLinkTexts = await page.locator('nav a, header a').allTextContents();
    const cleanedLinks = [...new Set(
      navLinkTexts.map(t => t.trim()).filter(t => t.length > 0)
    )];

    console.log(`\nFound ${cleanedLinks.length} nav links: ${cleanedLinks.join(', ')}`);

    // ── Step 3: Click each nav link and snapshot the result ───────
    // Track fingerprints of pages we've already seen, to skip duplicates
    const seenFingerprints = new Set();

    // Add homepage fingerprint as already seen
    const homeFingerprint = await getPageFingerprint(page);
    seenFingerprints.add(homeFingerprint);

    for (const linkText of cleanedLinks) {
      try {
        // Go back to homepage first to ensure nav is available
        await page.goto(BASE_URL);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);

        // Find and click the link by its text
        const link = page.getByRole('link', { name: linkText, exact: true })
          .or(page.locator('nav a, header a').filter({ hasText: linkText }))
          .first();

        const isVisible = await link.isVisible().catch(() => false);
        if (!isVisible) {
          console.log(`\n⚠️ Skipping "${linkText}" — not visible`);
          continue;
        }

        console.log(`\n🖱️  Clicking nav link: "${linkText}"`);
        await link.click();
        await page.waitForTimeout(1500); // wait for SPA to render
        await page.waitForLoadState('networkidle').catch(() => {});

        // Check if content actually changed
        const fingerprint = await getPageFingerprint(page);
        if (seenFingerprints.has(fingerprint)) {
          console.log(`⏭️  Skipping screenshot for "${linkText}" — same content as a previous page`);
          continue;
        }

        seenFingerprints.add(fingerprint);
        await snapshotCurrentPage(page, linkText);

      } catch (err) {
        console.warn(`\n⚠️ Could not click "${linkText}": ${err.message}`);
      }
    }

    // ── Step 4: Click a market card to discover the detail page ──
    console.log('\n\n📦 Checking market detail page...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    try {
      // Click the first market card visible on the page
      const firstCard = page.locator('[class*="market"], [class*="card"], article').first();
      const cardVisible = await firstCard.isVisible().catch(() => false);

      if (cardVisible) {
        const cardText = (await firstCard.textContent() || '').trim().slice(0, 50);
        console.log(`🖱️  Clicking first market card: "${cardText}"`);
        await firstCard.click();
        await page.waitForTimeout(2000);
        await page.waitForLoadState('networkidle').catch(() => {});

        const fingerprint = await getPageFingerprint(page);
        if (!seenFingerprints.has(fingerprint)) {
          seenFingerprints.add(fingerprint);
          await snapshotCurrentPage(page, 'market-detail-page');
        } else {
          console.log('⏭️  Market card click did not navigate to a new page');
        }
      }
    } catch (err) {
      console.warn('⚠️ Could not click market card:', err.message);
    }

    // ── Step 5: Also click any visible category/tab buttons ───────
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const tabTexts = await page.locator('[class*="tab"], [class*="category"], [class*="filter"]')
      .allTextContents();
    const cleanedTabs = [...new Set(tabTexts.map(t => t.trim()).filter(t => t.length > 1))];

    if (cleanedTabs.length > 0) {
      console.log(`\nFound ${cleanedTabs.length} category tabs: ${cleanedTabs.join(', ')}`);

      for (const tabText of cleanedTabs) {
        try {
          await page.goto(BASE_URL);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);

          const tab = page.locator('[class*="tab"], [class*="category"], [class*="filter"]')
            .filter({ hasText: tabText }).first();

          await tab.click();
          await page.waitForTimeout(1000);
          await page.waitForLoadState('networkidle').catch(() => {});

          // Skip if same content as something already seen
          const fingerprint = await getPageFingerprint(page);
          if (seenFingerprints.has(fingerprint)) {
            console.log(`⏭️  Skipping screenshot for tab "${tabText}" — same content as a previous page`);
            continue;
          }

          seenFingerprints.add(fingerprint);
          await snapshotCurrentPage(page, `category-${tabText}`);

        } catch (err) {
          console.warn(`⚠️ Could not click tab "${tabText}": ${err.message}`);
        }
      }
    }

    // ── Step 6: Click hamburger menu and screenshot what's inside ─
    console.log('\n\n☰ Checking hamburger menu...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    try {
      // Exact selector found via DevTools inspection:
      // The hamburger is an SVG inside a <span> inside .header-bitmart
      const hamburger = page.locator('div.header-bitmart > span').last();
      const hamburgerVisible = await hamburger.isVisible().catch(() => false);

      if (hamburgerVisible) {
        await hamburger.click();
        await page.waitForTimeout(800);

        // Verify the menu panel opened (contains "Menu" heading)
        const menuOpen = await page.getByText('Menu', { exact: true }).isVisible().catch(() => false);

        if (menuOpen) {
          console.log('✅ Hamburger menu opened');

          // Print menu items
          const menuItems = await page.locator('[class*="menu"] a, [class*="drawer"] a, [class*="sidebar"] a').allTextContents();
          console.log('Menu items:', menuItems);

          // Take screenshot of the open menu
          await snapshotCurrentPage(page, 'hamburger-menu-open');

          // Click Home inside the menu
          const homeLink = page.getByText('Home', { exact: true });
          if (await homeLink.isVisible().catch(() => false)) {
            await homeLink.click();
            await page.waitForTimeout(800);
            await snapshotCurrentPage(page, 'hamburger-menu-home-clicked');
          }

          // Reopen menu and click Portfolio
          await page.goto(BASE_URL);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500);
          await page.locator('header button, nav button').last().click();
          await page.waitForTimeout(800);

          const portfolioLink = page.getByText('Portfolio', { exact: true });
          if (await portfolioLink.isVisible().catch(() => false)) {
            await portfolioLink.click();
            await page.waitForTimeout(800);
            await snapshotCurrentPage(page, 'hamburger-menu-portfolio-clicked');
          }

        } else {
          console.log('⚠️ Hamburger clicked but no menu panel appeared');
        }
      } else {
        console.log('⚠️ Hamburger button not found');
      }
    } catch (err) {
      console.warn('⚠️ Could not interact with hamburger menu:', err.message);
    }

    // ── Step 7: Summary ───────────────────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log('✅ DISCOVERY COMPLETE');
    console.log('Screenshots saved in: ./screenshots/');
    console.log('\nNext step: open the screenshots folder and check what each page looks like.');
    console.log('Then update the locators in pages/HomePage.js and pages/MarketsPage.js.');
    console.log('='.repeat(60));

  } catch (err) {
    console.error('Fatal error during discovery:', err);
  } finally {
    await browser.close();
  }
})();
