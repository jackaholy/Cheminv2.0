import { expect } from "@playwright/test";
import { test } from "./setup";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5001/");
});

test("Initial state", async ({ page }) => {
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - text: Quantity Chemical Chemical Formula 1
    - button "Acetone"
    - text: C3H6O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Ammonia"
    - text: NH3
    - button "Edit":
      - img: 
    - text: "1"
    - button "Copper(II) Sulfate"
    - text: CuSO4
    - button "Edit":
      - img: 
    - text: "1"
    - button "Ethanol"
    - text: C2H6O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Methanol"
    - text: CH4O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Potassium Nitrate"
    - text: KNO3
    - button "Edit":
      - img: 
    - text: "1"
    - button "Sodium Hydroxide"
    - text: NaOH
    - button "Edit":
      - img: 
    - text: "1"
    - button "Sulfuric Acid"
    - text: H2SO4
    - button "Edit":
      - img: 
    - text: "1"
    - button "Water"
    - text: H2O
    - button "Edit":
      - img: 
    - text: "0"
    - button "Hydrochloric Acid"
    - text: HCl
    - button "Edit":
      - img: 
    - text: "0"
    - button "Silver Nitrate"
    - text: AgNO3
    - button "Edit":
      - img: 
  `);
});

test("Search by name", async ({ page }) => {
  await page.getByRole("textbox", { name: "Search..." }).fill("Acetone");
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - text: Quantity Chemical Chemical Formula 1
    - button "Acetone"
    - text: C3H6O
    - button "Edit":
      - img: 
    - button "Expand Search"
  `);
});

test("Search by symbol", async ({ page }) => {
  await page.getByRole("textbox", { name: "Search..." }).fill("NaOH");
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Sodium Hydroxide"
    - text: NaOH
    - button "Edit":
      - img: 
    - button "Expand Search"
  `);
});

test("Search by synonym", async ({ page }) => {
  await page
    .getByRole("textbox", { name: "Search..." })
    .fill("Dihydrogen oxide");
  await page.getByRole("button", { name: "Expand Search" }).click();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Water"
    - text: H2O
    - button "Edit":
      - img: 
    - button "Expand Search"
  `);
});
