import { test, expect } from '@playwright/test';

test('Basic search', async ({ page }) => {
  await page.goto('http://localhost:5001');
  await page.getByRole('textbox', { name: 'Search...' }).click();
  await page.getByRole('textbox', { name: 'Search...' }).fill('nitric acid');
  await expect(page.locator('#root')).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 9
    - link "nitric acid"
    - text: "2"
    - link "nitric acid, fuming"
    - text: "1"
    - link "nitric acid trace metal grade"
    - button "Expand Search"
    `);
});