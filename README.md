# Plaee Automation Test Suite

Playwright automation for [cms.plaee.cloud](https://cms.plaee.cloud)

---

## Setup (do this once)

```bash
cd plaee-automation
npm install
npx playwright install
```

---

## How to run

### Step 1 — Discover the site first (IMPORTANT)
```bash
node discover.js
```
This opens the site, prints all buttons/links/inputs, and saves screenshots.
Use this to verify and update locators in the `pages/` files.

### Step 2 — Run all tests
```bash
npm test
```

### Run with browser visible (recommended while learning)
```bash
npm run test:headed
```

### Run with a visual UI dashboard
```bash
npm run test:ui
```

### Open the HTML report after tests
```bash
npm run report
```

---

## Project structure

```
plaee-automation/
├── playwright.config.js     ← Main configuration
├── discover.js              ← Run this first to map the site
├── pages/
│   ├── BasePage.js          ← Shared actions (screenshot, wait, etc.)
│   ├── HomePage.js          ← Homepage-specific locators & actions
│   └── MarketsPage.js       ← Markets-specific locators & actions
├── tests/
│   ├── 01-homepage.spec.js  ← Homepage tests
│   ├── 02-navigation.spec.js ← Navigation & link tests
│   └── 03-markets.spec.js   ← Market listing & detail tests
└── screenshots/             ← Auto-generated screenshots
```

---

## How to update locators

If a test fails because an element isn't found:

1. Open Chrome → go to the page
2. Press **F12** to open DevTools
3. Click the **cursor icon** (top-left of DevTools)
4. Click the element on the page
5. Look for `id=`, `class=`, or `name=` in the highlighted HTML
6. Update the locator in the relevant `pages/` file

---

## How often should this run?

| Scenario | Recommendation |
|---|---|
| Job interview demo | Run manually on-demand |
| Real project (CI/CD) | Run after every deployment |
| Real project (scheduled) | Run daily as a smoke test |

For a real project you'd plug this into GitHub Actions, GitLab CI, or Jenkins.
