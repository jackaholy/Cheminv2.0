import { expect } from "@playwright/test";
import { test } from "./setup";
import { readFile } from "fs/promises";
import { tmpdir } from "os";
test("Export CSV", async ({ page }) => {
  await page.goto("http://localhost:5001/");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Download CSV" }).click();
  const download = await downloadPromise;
  await download.saveAs(tmpdir() + "/" + download.suggestedFilename());
  const file = await readFile(tmpdir() + "/" + download.suggestedFilename(), {
    encoding: "utf-8",
  });
  console.log(file.toString());
  expect(file.toString()).toContain(
    "Sticker Number,Chemical,Location,Sub-Location,MSDS,Comment,Storage Class,Alphabetized by,Chemical Formula & Common Name,Last Updated,Who Updated,Quantity,Minimum Needed,Manufacturer,Product Number,CAS Number,Barcode,Dead?"
  );
});
