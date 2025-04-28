import { expect } from "@playwright/test";
import { test } from "./setup";

test("Filter by location", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
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
  await page.getByText("Science Hall 101").click();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Acetone"
    - text: C3H6O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Ethanol"
    - text: C2H6O
    - button "Edit":
      - img: 
    - text: "0"
    - button "Hydrochloric Acid"
    - text: HCl
    - button "Edit":
      - img: 
  `);
  await page.getByText("Science Hall 102").click();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Methanol"
    - text: CH4O
    - button "Edit":
      - img: 
    - text: "1"
    - button "Sodium Hydroxide"
    - text: NaOH
    - button "Edit":
      - img: 
    - text: "1"
    - button "Water"
    - text: H2O
    - button "Edit":
      - img: 
    - text: "0"
    - button "Acetone"
    - text: C3H6O
    - button "Edit":
      - img: 
  `);
  await page.getByText("Science Hall G01").click();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Potassium Nitrate"
    - text: KNO3
    - button "Edit":
      - img: 
  `);
  await page.getByText("Science Hall 103").click();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Ammonia"
    - text: NH3
    - button "Edit":
      - img: 
    - text: "1"
    - button "Sulfuric Acid"
    - text: H2SO4
    - button "Edit":
      - img: 
  `);
  await page.getByText("Science Hall 104").click();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Copper(II) Sulfate"
    - text: CuSO4
    - button "Edit":
      - img: 
  `);
  await page.getByTestId("room-filter").getByText("Any").click();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
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

test("Filter by manufacturer", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page
    .getByRole("checkbox", { name: "Avantor Performance Materials" })
    .check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
      - text: Quantity Chemical Chemical Formula 1
      - button "Sodium Hydroxide"
      - text: NaOH
      - button "Edit":
        - img: 
    `);
  await page
    .getByRole("checkbox", { name: "Avantor Performance Materials" })
    .uncheck();
  await page.getByRole("checkbox", { name: "BDB" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
      - text: Quantity Chemical Chemical Formula 1
      - button "Ammonia"
      - text: NH3
      - button "Edit":
        - img: 
    `);
  await page.getByRole("checkbox", { name: "BDB" }).uncheck();
  await page.getByRole("checkbox", { name: "Fisher Scientific" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Acetone"
    - text: C3H6O
    - button "Edit":
      - img: 
    - text: "0"
    - button "Hydrochloric Acid"
    - text: HCl
    - button "Edit":
      - img: 
  `);
  await page.getByRole("checkbox", { name: "Fisher Scientific" }).uncheck();
  await page.getByRole("checkbox", { name: "Honeywell" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
      - text: Quantity Chemical Chemical Formula 1
      - button "Copper(II) Sulfate"
      - text: CuSO4
      - button "Edit":
        - img: 
    `);
  await page.getByRole("checkbox", { name: "Honeywell" }).uncheck();
  await page.getByRole("checkbox", { name: "Merck" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
      - text: Quantity Chemical Chemical Formula 1
      - button "Sulfuric Acid"
      - text: H2SO4
      - button "Edit":
        - img: 
    `);
  await page.getByRole("checkbox", { name: "Merck" }).uncheck();
  await page.getByRole("checkbox", { name: "Sigma-Aldrich" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
      - text: Quantity Chemical Chemical Formula 1
      - button "Methanol"
      - text: CH4O
      - button "Edit":
        - img: 
      - text: "1"
      - button "Water"
      - text: H2O
      - button "Edit":
        - img: 
    `);
  await page.getByRole("checkbox", { name: "Sigma-Aldrich" }).uncheck();
  await page.getByRole("checkbox", { name: "VWR International" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
      - text: Quantity Chemical Chemical Formula 1
      - button "Ethanol"
      - text: C2H6O
      - button "Edit":
        - img: 
      - text: "1"
      - button "Potassium Nitrate"
      - text: KNO3
      - button "Edit":
        - img: 
    `);
  await page.getByRole("checkbox", { name: "VWR International" }).uncheck();

  await page
    .getByRole("checkbox", { name: "Avantor Performance Materials" })
    .check();
  await page.getByRole("checkbox", { name: "Fisher Scientific" }).check();
  await page.getByRole("checkbox", { name: "Merck" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
    - link "Download CSV"
    - text: Quantity Chemical Chemical Formula 1
    - button "Acetone"
    - text: C3H6O
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
    - text: "0"
    - button "Hydrochloric Acid"
    - text: HCl
    - button "Edit":
      - img: 
  `);

  await page
    .getByRole("checkbox", { name: "Avantor Performance Materials" })
    .uncheck();
  await page.getByRole("checkbox", { name: "BDB" }).check();
  await page.getByRole("checkbox", { name: "Fisher Scientific" }).uncheck();
  await page.getByRole("checkbox", { name: "Honeywell" }).check();
  await page.getByRole("checkbox", { name: "Merck" }).uncheck();
  await page.getByRole("checkbox", { name: "Sigma-Aldrich" }).check();
  await page.getByRole("checkbox", { name: "VWR International" }).check();
  await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(`
      - text: Quantity Chemical Chemical Formula 1
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
      - button "Water"
      - text: H2O
      - button "Edit":
        - img: 
    `);
});

test("Filter location list", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("textbox", { name: "Filter rooms" }).fill("102");
  await expect(page.getByTestId("room-filter")).toMatchAriaSnapshot(`
    - radio "Any"
    - text: Any
  `);
  await page.getByRole("textbox", { name: "Filter rooms" }).fill("103");
  await expect(page.getByTestId("room-filter")).toMatchAriaSnapshot(`
    - radio "Any"
    - text: Any
  `);
  await page.getByRole("textbox", { name: "Filter rooms" }).fill("G");
  await expect(page.getByTestId("room-filter")).toMatchAriaSnapshot(`
    - radio "Any"
    - text: Any
  `);
});
