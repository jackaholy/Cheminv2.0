import { test as base } from "@playwright/test";

base.beforeEach(async ({ request }) => {
  await request.post("http://localhost:5001/test/reset");
});

export const test = base;
