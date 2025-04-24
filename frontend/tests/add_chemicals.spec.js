import { expect } from "@playwright/test";
import { test } from "./setup";
test("Adding a chemical by product number", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("link", { name: "Add Chemical" }).click();
  await expect(page.getByTestId("MainContent")).toContainText("1AcetoneC3H6O");
  await page.getByRole("combobox").click();
  await page.getByRole("combobox").fill("A123");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("spinbutton").click();
  await page.getByRole("spinbutton").fill("8956");
  await page.getByRole("combobox").first().selectOption("2");
  await page.getByRole("button", { name: "Save Chemical" }).click();
  await page.goto("http://localhost:5001/");
  await expect(page.getByTestId("MainContent")).toContainText("2AcetoneC3H6O");
  await page.getByRole("button", { name: "Acetone" }).click();
  await expect(page.locator('tr:has-text("8956")')).toMatchAriaSnapshot(`
    - row /\\d+ A123 Science Hall \\d+ Cabinet B Fisher Scientific  /:
      - rowheader /\\d+/
      - cell "A123"
      - cell /Science Hall \\d+/
      - cell "Cabinet B"
      - cell "Fisher Scientific"
      - cell " ":
        - button ""
        - button ""
  `);
});

test("Adding a chemical by chemical name", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await expect(page.getByTestId("MainContent")).toContainText(
    "1Copper(II) SulfateCuSO4"
  );
  await page.getByRole("link", { name: "Add Chemical" }).click();
  await page.getByRole("combobox").click();
  await page.getByRole("combobox").fill("NOTAPRODUCTNUMBER");
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("combobox").click();
  await page.getByRole("combobox").fill("Copper(II) Sulfate");
  await page.getByRole("button", { name: "Next" }).click();
  await page.locator(".css-19bb58m").click();
  await page.getByRole("option", { name: "Merck" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("spinbutton").click();
  await page.getByRole("spinbutton").fill("8742");
  await page.getByText("Safety data sheet added").click();
  await page.getByRole("button", { name: "Save Chemical" }).click();
  await page.goto("http://localhost:5001/");
  await expect(page.getByTestId("MainContent")).toContainText(
    "2Copper(II) SulfateCuSO4"
  );

  await page.getByRole("button", { name: "Copper(II) Sulfate" }).click();
  await expect(page.locator('tr:has-text("8742")')).toMatchAriaSnapshot(`
    - row /\\d+ NOTAPRODUCTNUMBER Science Hall \\d+ Shelf A Merck  /:
      - rowheader /\\d+/
      - cell "NOTAPRODUCTNUMBER"
      - cell /Science Hall \\d+/
      - cell "Shelf A"
      - cell "Merck"
      - cell " ":
        - button ""
        - button ""
  `);
});

test("Adding a brand-new chemical", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("link", { name: "Add Chemical" }).click();
  await page.getByRole("combobox").click();
  await page.getByRole("combobox").fill("404");
  await page.getByRole("combobox").press("Enter");
  await page.getByRole("combobox").click();
  await page.getByRole("combobox").fill("Madeupamine");
  await page.getByRole("combobox").press("Enter");
  await page.locator('input[type="text"]').nth(2).click();
  await page.locator('input[type="text"]').nth(2).fill("MAD3UP");
  await page.locator("select").selectOption("3");
  await page.locator(".css-19bb58m").click();
  await page.getByRole("dialog").locator("path").first().click();
  await page.locator(".css-19bb58m").click();
  await page.locator("#react-select-2-input").fill("Highly Toxic Chemical Co");
  await page
    .getByRole("option", { name: 'Create "Highly Toxic Chemical' })
    .click();
  await page.getByRole("textbox", { name: "N0155" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("spinbutton").click();
  await page.getByRole("spinbutton").fill("4522");
  await page.getByRole("checkbox", { name: "Safety data sheet added" }).check();
  await page.getByRole("combobox").first().selectOption("5");
  await page.getByRole("button", { name: "Save Chemical" }).click();
  await page.goto("http://localhost:5001/");
  await page.getByRole("button", { name: "Madeupamine" }).click();
  await expect(page.getByRole("dialog")).toMatchAriaSnapshot(`
        - paragraph: "Storage Class: Toxic"
        - paragraph: "Chemical Formula: MAD3UP"
        - paragraph
        - table:
          - rowgroup:
            - 'row "Sticker # Product # Location Sub-Location Manufacturer Edit"':
              - 'cell "Sticker #"'
              - 'cell "Product #"'
              - cell "Location"
              - cell "Sub-Location"
              - cell "Manufacturer"
              - cell "Edit"
          - rowgroup:
            - row /\\d+ \\d+ Science Hall \\d+ Prep Table Highly Toxic Chemical Co  /:
              - rowheader /\\d+/
              - cell /\\d+/
              - cell /Science Hall \\d+/
              - cell "Prep Table"
              - cell "Highly Toxic Chemical Co"
              - cell " ":
                - button ""
                - button ""
        `);
});
