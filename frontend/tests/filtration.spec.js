import { test, expect } from '@playwright/test';

test('Filter by location', async ({ page }) => {
    await page.goto('http://localhost:5001/');
    await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(``);
    await page.getByText('Science Hall 101').click();
    await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(``);
    await page.getByText('Science Hall 102').click();
    await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(``);
    await page.getByText('Science Hall G01').click();
    await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(``);
    await page.getByText('Science Hall 103').click();
    await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(``);
    await page.getByText('Science Hall 104').click();
    await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(``);
    await page.getByText('Any').click();
    await expect(page.getByTestId("MainContent")).toMatchAriaSnapshot(``);
});