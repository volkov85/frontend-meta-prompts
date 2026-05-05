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

    await page.getByRole("button", { name: "View prompt" }).click();
    const dialog = page.getByRole("dialog", { name: "Session prompt" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("ROLE:")).toBeVisible();
    await expect(dialog.getByText("Session context")).toBeVisible();
    await dialog.getByRole("button", { name: "Close" }).click();
    await expect(dialog).not.toBeVisible();

    // §3.1#1 — Clear sessions now requires confirmation.
    await page.getByRole("button", { name: "Clear sessions" }).click();
    const confirmDialog = page.getByRole("dialog", { name: "Clear all sessions?" });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Cancel" }).click();
    await expect(confirmDialog).not.toBeVisible();
    await expect(page.getByText("No saved sessions yet.")).not.toBeVisible();

    await page.getByRole("button", { name: "Clear sessions" }).click();
    await page
      .getByRole("dialog", { name: "Clear all sessions?" })
      .getByRole("button", { name: "Yes, clear all" })
      .click();
    await expect(page.getByText("No saved sessions yet.")).toBeVisible();
  });

  test("exposes social meta tags and PWA manifest", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.ok()).toBeTruthy();

    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /Structured interview prep prompt engine/i,
    );
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute("content", "#7c3aed");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
      "content",
      /Frontend Meta Prompts/i,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /og-image\.png$/,
    );
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute(
      "href",
      /manifest\.webmanifest$/,
    );
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute(
      "href",
      /favicon\.svg$/,
    );

    const manifestHref = await page.locator('link[rel="manifest"]').getAttribute("href");
    expect(manifestHref).toBeTruthy();
    const manifestResponse = await page.request.get(new URL(manifestHref!, page.url()).toString());
    expect(manifestResponse.ok()).toBeTruthy();
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe("Frontend Meta Prompts");
    expect(manifest.start_url).toBeTruthy();
    expect(manifest.display).toBe("standalone");
    const maskable = (
      manifest.icons as Array<{ sizes: string; purpose: string; src: string }>
    ).find((icon) => icon.sizes === "512x512" && icon.purpose === "maskable");
    expect(maskable).toBeDefined();
    expect(maskable?.src).toMatch(/\.png$/);
  });

  test("persists setup state across reloads", async ({ page }) => {
    await page.goto("/");

    const stackInput = page.getByLabel("Stack (comma separated)");
    await expect(stackInput).toBeEnabled();
    await stackInput.fill("Solid, Qwik, Astro");
    await page.getByLabel("Focus boost (comma separated)").fill("signals, server-only");
    await page.getByLabel("Timebox (minutes)").fill("17");

    await page.reload();

    await expect(page.getByLabel("Stack (comma separated)")).toHaveValue("Solid, Qwik, Astro");
    await expect(page.getByLabel("Focus boost (comma separated)")).toHaveValue(
      "signals, server-only",
    );
    await expect(page.getByLabel("Timebox (minutes)")).toHaveValue("17");
  });

  test("hydrates setup from a shared URL", async ({ page }) => {
    await page.goto(
      "/?template=react-hooks-internals&level=middle&stack=Solid%2C%20Qwik&focus=signals%2C%20ssr&extra=fintech%20checkout&simulation=1&timebox=42&lang=en",
    );

    await expect(page.getByLabel("Stack (comma separated)")).toHaveValue("Solid, Qwik");
    await expect(page.getByLabel("Focus boost (comma separated)")).toHaveValue("signals, ssr");
    await expect(page.getByLabel("Extra context")).toHaveValue("fintech checkout");
    await expect(page.getByLabel("Timebox (minutes)")).toHaveValue("42");
    await expect.poll(() => new URL(page.url()).search).toBe("");
  });
});
