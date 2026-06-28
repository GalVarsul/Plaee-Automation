// @ts-check
// Playwright config used only for Chromatic visual testing.
// Functional vs. visual separation is now handled at the import level:
// purely functional specs (e.g. 06-health-checks, 02-navigation) import
// '@playwright/test' so they produce no auto-snapshot, while visual specs
// import '@chromatic-com/playwright'. No testIgnore needed here.

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  workers: '50%',
  retries: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.BASE_URL || 'https://cms.plaee.cloud',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    headless: true,
  },
  outputDir: './test-results',
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['list'],
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
