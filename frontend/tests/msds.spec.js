import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:5001/#");
  await page.getByRole("link", { name: "Missing MSDS" }).click();
  await page
    .getByRole("row", { name: "Water Sigma-Aldrich W001 Done" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("row")).toHaveCount(10);

  await page
    .getByRole("row", { name: "5001 Hydrochloric Acid Fisher" })
    .getByRole("button")
    .click();
  await expect(page.getByRole("row")).toHaveCount(9);

  await page
    .getByRole("row", { name: "3001 Ethanol VWR" })
    .getByRole("button")
    .click();
  await page.getByRole("button", { name: "Undo" }).click();

  await page.reload();

  await page.getByRole("button", { name: "Water" }).click();
  await page.getByRole("button", { name: "" }).click();

  await expect(
    page.getByRole("checkbox", { name: "Safety data sheet added" })
  ).toBeChecked();
  await page.getByRole("button", { name: "Close" }).nth(3).click();
  await page.getByText("Close").click();
  await page.getByRole("button", { name: "Hydrochloric Acid" }).click();
  await page.getByRole("button", { name: "Show Dead Bottles (1)" }).click();
  await page.getByRole("button", { name: "" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Safety data sheet added" })
  ).toBeChecked();
  await page.getByRole("button", { name: "Close" }).nth(3).click();
  await page.getByText("Close").click();
  await page.getByRole("button", { name: "Ethanol", exact: true }).click();
  await page.getByRole("button", { name: "" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Safety data sheet added" })
  ).not.toBeChecked();
  await page.getByRole("button", { name: "Close" }).nth(3).click();
  await page.getByText("Close").click();
  await page.getByRole("button", { name: "Acetone", exact: true }).click();
  await page.getByRole("button", { name: "" }).click();
  await expect(
    page.getByRole("checkbox", { name: "Safety data sheet added" })
  ).toBeChecked();
});
