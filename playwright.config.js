// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  // Directory where your test files live
  testDir: './tests',

  // Run tests in parallel — 4 workers cuts total time by ~4x
  workers: '50%', // use half your CPU cores, leaving the rest for normal use

  // Retry a failed test once before marking it as failed
  retries: 1,

  // How long a single test can run before timing out (30 seconds)
  timeout: 30000,

  // Shared settings for ALL tests
  use: {
    // The website we're testing
    baseURL: 'https://cms.plaee.cloud',

    // Always take a screenshot when a test FAILS
    screenshot: 'only-on-failure',

    // Record a video when a test FAILS (great for debugging)
    video: 'retain-on-failure',

    // Show browser actions in slow motion (useful while debugging)
    // Remove this line when running for real
    // slowMo: 500,

    // Wait up to 10s for elements to appear before failing
    actionTimeout: 10000,

    // Open a real visible browser window (set to true to run hidden/faster)
    headless: true,
  },

  // Save screenshots and videos here
  outputDir: './test-results',

  // Generate a nice HTML report you can open in a browser
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],

  // Test in Chrome only (you can add more browsers later)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
