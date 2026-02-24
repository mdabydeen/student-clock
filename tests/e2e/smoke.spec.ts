import { expect, test, type Page } from "@playwright/test";

async function startSession(page: Page) {
  await page.getByLabel("Course name").fill("BIO 201");
  await page.getByLabel("Exam title").fill("Midterm Exam");
  await page.getByLabel("Duration (minutes)").fill("60");
  await page.getByRole("button", { name: "Start exam" }).click();
}

test("teacher can run the core exam session flow", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Exam Setup" })).toBeVisible();
  await startSession(page);

  await expect(page.getByText("BIO 201")).toBeVisible();
  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();

  await page.getByRole("button", { name: "Show details" }).click();
  await expect(page.getByRole("heading", { name: "Rules & Notes" })).toBeVisible();

  await page.getByRole("button", { name: "Lock presentation" }).click();
  await expect(page.getByText("Presentation locked. Active controls are hidden.")).toBeVisible();

  await page.getByRole("button", { name: "Unlock" }).click();
  await page.getByRole("button", { name: "Confirm unlock" }).click();
  await expect(page.getByRole("button", { name: "Lock presentation" })).toBeVisible();

  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByRole("heading", { name: "Exam Setup" })).toBeVisible();
});

test("cancel reset keeps the active session", async ({ page }) => {
  await page.goto("/");
  await startSession(page);

  page.on("dialog", async (dialog) => {
    await dialog.dismiss();
  });
  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByRole("button", { name: "Pause" })).toBeVisible();
  await expect(page.getByText("BIO 201")).toBeVisible();
});
