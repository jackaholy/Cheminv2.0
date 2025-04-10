import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await expect(page.getByRole("navigation")).toMatchAriaSnapshot(
    `- link "Chemical Inventory"`
  );
  await expect(page.locator("#root")).toMatchAriaSnapshot(
    `- text: Quantity Chemical Chemical Symbol`
  );
  await expect(page.locator("#root")).toMatchAriaSnapshot(`
    - textbox "Search..."
    - button "search"
    `);
  await expect(page.locator("#root")).toMatchAriaSnapshot(
    `- text: Room Location`
  );
  await expect(page.locator("#root")).toMatchAriaSnapshot(
    `- text: Manufacturers`
  );
});
