import { test, expect } from "@playwright/test";

test("Test missing msds", async ({ page }) => {
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

test("Test set msds link", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  await page.getByRole("button", { name: "Manage Database" }).click();
  page.on("dialog", async (dialog) => {
    await dialog.accept(
      "https://www.carroll.edu/academics/program-finder/computer-science-information-systems"
    );
  });
  const requestPromise = page.waitForRequest("**/api/set_msds_url");
  await page.getByRole("link", { name: "Set MSDS URL" }).click();
  const request = await requestPromise;
  await page.reload();

  await page.getByRole("link", { name: "Safety Datasheets" }).click();
  expect(page.url()).toBe(
    "https://www.carroll.edu/academics/program-finder/computer-science-information-systems"
  );
});
