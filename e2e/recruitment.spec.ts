import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test("loads core sections and coming-soon state", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toContainText("لا تكتفِ بمشاهدة اللعبة");
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#benefits")).toBeVisible();
  await expect(page.locator("#teams")).toBeVisible();
  await expect(page.getByRole("link", { name: "ابدأ طلبك" })).toHaveCount(0);
  await expect(page.getByText("يفتح التقديم قريبًا").first()).toBeVisible();
});

test("teams anchor reaches the correct section", async ({ page }) => {
  await page.getByRole("link", { name: "اكتشف فرق العمل" }).click();
  await expect(page).toHaveURL(/#teams$/);
  await expect(page.locator("#teams")).toBeInViewport();
});

test("social and email destinations are correct", async ({ page }) => {
  await expect(page.getByRole("link", { name: "حساب كورة على إنستغرام" })).toHaveAttribute("href", "https://www.instagram.com/kora_kfupm");
  await expect(page.getByRole("link", { name: "حساب كورة على منصة X" })).toHaveAttribute("href", "https://x.com/KORA_KFUPM");
  await expect(page.getByRole("link", { name: "حساب كورة على تيك توك" })).toHaveAttribute("href", "https://www.tiktok.com/@kfupm_kora");
  await expect(page.getByRole("link", { name: "kora.kfupm@gmail.com" })).toHaveAttribute("href", "mailto:kora.kfupm@gmail.com");
});

test("has no horizontal overflow on a 320px viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});

test("mobile menu and accordion support keyboard interaction", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const menuButton = page.getByRole("button", { name: "فتح القائمة" });
  await menuButton.focus();
  await page.keyboard.press("Enter");
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton).toBeFocused();

  await page.locator("#teams").scrollIntoViewIfNeeded();
  const accordion = page.getByRole("button", { name: /تصميم المعرض/ });
  await accordion.focus();
  await page.keyboard.press("Enter");
  await expect(accordion).toHaveAttribute("aria-expanded", "true");
});
