import { expect } from "@playwright/test";
import { test } from "./setup";

test("Test manufacturer filtration", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("button", { name: "Manage Database" }).click();
  await page.getByRole("link", { name: "Manufacturer List" }).click();
  await page
    .getByRole("searchbox", { name: "Search by manufacturer name" })
    .click();
  await page
    .getByRole("searchbox", { name: "Search by manufacturer name" })
    .fill("TCI");
  await expect(page.getByRole("dialog")).toMatchAriaSnapshot(`
    - dialog:
      - text: Manufacturers
      - button "Close"
      - searchbox "Search by manufacturer name"
      - button "Search"
      - table:
        - rowgroup:
          - row "Manufacturer Name Edit":
            - cell
            - cell "Manufacturer Name"
            - cell "Edit"
        - rowgroup:
          - row "TCI America Edit":
            - cell:
              - checkbox
            - cell "TCI America"
            - cell "Edit":
              - button "Edit"
      - button "Add Manufacturer"
      - button "Remove Manufacturer"
      - button "Close"
  `);
});
test("Test manufacturer deletion", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("button", { name: "Manage Database" }).click();
  await page.getByRole("link", { name: "Manufacturer List" }).click();
  await page
    .getByRole("row", { name: "Honeywell Edit" })
    .getByRole("checkbox")
    .check();
  await page
    .getByRole("row", { name: "BDB Edit" })
    .getByRole("checkbox")
    .check();
  await page.getByRole("button", { name: "Remove Manufacturer" }).click();
  await page.getByRole("button", { name: "Yes" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Manufacturers deleted successfully"
  );
  await expect(
    page.getByRole("dialog").filter({ hasText: "ManufacturersManufacturers" })
  ).toMatchAriaSnapshot(`
    - dialog:
      - text: Manufacturers
      - button "Close"
      - alert: Manufacturers deleted successfully
      - searchbox "Search by manufacturer name"
      - button "Search"
      - table:
        - rowgroup:
          - row "Manufacturer Name Edit":
            - cell
            - cell "Manufacturer Name"
            - cell "Edit"
        - rowgroup:
          - row "Avantor Performance Materials Edit":
            - cell:
              - checkbox
            - cell "Avantor Performance Materials"
            - cell "Edit":
              - button "Edit"
          - row "Fisher Scientific Edit":
            - cell:
              - checkbox
            - cell "Fisher Scientific"
            - cell "Edit":
              - button "Edit"
          - row "Merck Edit":
            - cell:
              - checkbox
            - cell "Merck"
            - cell "Edit":
              - button "Edit"
          - row "Sigma-Aldrich Edit":
            - cell:
              - checkbox
            - cell "Sigma-Aldrich"
            - cell "Edit":
              - button "Edit"
          - row "TCI America Edit":
            - cell:
              - checkbox
            - cell "TCI America"
            - cell "Edit":
              - button "Edit"
          - row "VWR International Edit":
            - cell:
              - checkbox
            - cell "VWR International"
            - cell "Edit":
              - button "Edit"
      - button "Add Manufacturer"
      - button "Remove Manufacturer"
      - button "Close"
  `);
});
test("Test manufacturer addition", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("button", { name: "Manage Database" }).click();
  await page.getByRole("link", { name: "Manufacturer List" }).click();
  await page.getByRole("button", { name: "Add Manufacturer" }).click();
  await page.getByRole("textbox", { name: "Name..." }).click();
  await page.getByRole("textbox", { name: "Name..." }).fill("Idunno Chemco");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("dialog").filter({ hasText: "ManufacturersManufacturer" })
  ).toMatchAriaSnapshot(`
    - dialog:
      - text: Manufacturers
      - button "Close"
      - alert: Manufacturer added successfully
      - searchbox "Search by manufacturer name"
      - button "Search"
      - table:
        - rowgroup:
          - row "Manufacturer Name Edit":
            - cell
            - cell "Manufacturer Name"
            - cell "Edit"
        - rowgroup:
          - row "Avantor Performance Materials Edit":
            - cell:
              - checkbox
            - cell "Avantor Performance Materials"
            - cell "Edit":
              - button "Edit"
          - row "Fisher Scientific Edit":
            - cell:
              - checkbox
            - cell "Fisher Scientific"
            - cell "Edit":
              - button "Edit"
          - row "Idunno Chemco Edit":
            - cell:
              - checkbox
            - cell "Idunno Chemco"
            - cell "Edit":
              - button "Edit"
          - row "Merck Edit":
            - cell:
              - checkbox
            - cell "Merck"
            - cell "Edit":
              - button "Edit"
          - row "Sigma-Aldrich Edit":
            - cell:
              - checkbox
            - cell "Sigma-Aldrich"
            - cell "Edit":
              - button "Edit"
          - row "TCI America Edit":
            - cell:
              - checkbox
            - cell "TCI America"
            - cell "Edit":
              - button "Edit"
          - row "VWR International Edit":
            - cell:
              - checkbox
            - cell "VWR International"
            - cell "Edit":
              - button "Edit"
      - button "Add Manufacturer"
      - button "Remove Manufacturer"
      - button "Close"
  `);
});
test("Test manufacturer editing", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("button", { name: "Manage Database" }).click();
  await page.getByRole("link", { name: "Manufacturer List" }).click();
  await page
    .getByRole("row", { name: "Fisher Scientific Edit" })
    .getByRole("button")
    .click();
  await page
    .getByRole("textbox", { name: "Name..." })
    .fill("Fishing Scientific");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(
    page.getByRole("dialog").filter({ hasText: "ManufacturersManufacturer" })
  ).toMatchAriaSnapshot(`
    - dialog:
      - text: Manufacturers
      - button "Close"
      - alert: Manufacturer updated successfully
      - searchbox "Search by manufacturer name"
      - button "Search"
      - table:
        - rowgroup:
          - row "Manufacturer Name Edit":
            - cell
            - cell "Manufacturer Name"
            - cell "Edit"
        - rowgroup:
          - row "Avantor Performance Materials Edit":
            - cell:
              - checkbox
            - cell "Avantor Performance Materials"
            - cell "Edit":
              - button "Edit"
          - row "BDB Edit":
            - cell:
              - checkbox
            - cell "BDB"
            - cell "Edit":
              - button "Edit"
          - row "Fishing Scientific Edit":
            - cell:
              - checkbox
            - cell "Fishing Scientific"
            - cell "Edit":
              - button "Edit"
          - row "Honeywell Edit":
            - cell:
              - checkbox
            - cell "Honeywell"
            - cell "Edit":
              - button "Edit"
          - row "Merck Edit":
            - cell:
              - checkbox
            - cell "Merck"
            - cell "Edit":
              - button "Edit"
          - row "Sigma-Aldrich Edit":
            - cell:
              - checkbox
            - cell "Sigma-Aldrich"
            - cell "Edit":
              - button "Edit"
          - row "TCI America Edit":
            - cell:
              - checkbox
            - cell "TCI America"
            - cell "Edit":
              - button "Edit"
          - row "VWR International Edit":
            - cell:
              - checkbox
            - cell "VWR International"
            - cell "Edit":
              - button "Edit"
      - button "Add Manufacturer"
      - button "Remove Manufacturer"
      - button "Close"
  `);
});
