// ➖ Remove this line
// import { test, expect } from '@playwright/test';
// ➕ Add this line
import { test, expect } from "@chromatic-com/playwright";

// Then use as normal 👇
test("Homepage", async ({ page }) => {
  await page.goto("https://mealexpress.com/");

  await expect(page).toHaveTitle("Mealdrop - find your meal");
  // ...
});