/**
 * constants.js
 * Single source of truth for all expected values on cms.plaee.cloud.
 * Update here when the site changes — tests pick up the new values automatically.
 */

// Allow overriding the base URL via environment variable (e.g. for staging)
// Usage: BASE_URL=https://staging.plaee.cloud npm test
const BASE_URL = process.env.BASE_URL || 'https://cms.plaee.cloud';

const PAGE_TITLE = 'BitMart | Prediction Market';

const NAV_CATEGORIES = [
  { name: 'All',           url: '/' },
  { name: 'FIFA World Cup', url: '/category/world-cup' },
  { name: 'Crypto',        url: '/category/crypto' },
  { name: 'Sports',        url: '/category/sports' },
  { name: 'Politics',      url: '/category/politics' },
  { name: 'Culture',       url: '/category/culture' },
  { name: 'Economics',     url: '/category/economics' },
  { name: 'Companies',     url: '/category/companies' },
];

const SPORTS_TABS    = ['Live', 'Games', 'Props', 'Futures', 'Events'];
const SPORTS_SIDEBAR = ['Soccer', 'Tennis', 'Hockey', 'Football', 'Golf', 'MMA', 'MLB'];
const CRYPTO_FILTERS = ['BTC', 'ETH', 'SOL', 'XRP', 'DOGE'];

const HAMBURGER_MENU_ITEMS = ['Home', 'Portfolio'];

const EXPECTED_FAQ_QUESTION = 'What is the Prediction Market?';

// Max acceptable page load time in milliseconds
const PERFORMANCE_BUDGET_MS = 20000;

// Minimum number of market cards expected on any category page
const MIN_MARKET_CARDS = 1;

module.exports = {
  BASE_URL,
  PAGE_TITLE,
  NAV_CATEGORIES,
  SPORTS_TABS,
  SPORTS_SIDEBAR,
  CRYPTO_FILTERS,
  HAMBURGER_MENU_ITEMS,
  EXPECTED_FAQ_QUESTION,
  PERFORMANCE_BUDGET_MS,
  MIN_MARKET_CARDS,
};
