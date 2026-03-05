import { expect, test } from "@playwright/test";

test.describe("Frontend Meta Prompts", () => {
  test("renders the home page", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Frontend Meta Prompts")).toBeVisible();
    await expect(page.getByText("Generated prompt will appear here.")).toBeVisible();
    await expect(page.getByText("No saved sessions yet.")).toBeVisible();
  });

  test("runs main user workflow", async ({ page }) => {
    await page.goto("/");

    const generateButton = page.getByRole("button", { name: "Generate Prompt" });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    await expect(page.getByText("Prompt Output")).toBeVisible();
    await expect(page.getByText("ROLE:")).toBeVisible();
    await expect(page.getByText(/Session created:/)).toBeVisible();

    const scoreInput = page.getByLabel("Score (0..10)");
    await scoreInput.fill("9");
    await page.getByLabel("Notes").fill("Great problem decomposition and trade-offs");
    await page.getByRole("button", { name: "Save score" }).click();

    await expect(page.getByText("Score: 9")).toBeVisible();

    await page.getByRole("button", { name: "Clear sessions" }).click();
    await expect(page.getByText("No saved sessions yet.")).toBeVisible();
  });
});
