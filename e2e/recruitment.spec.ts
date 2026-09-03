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

test("loads the revised sections and coming-soon state", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toContainText("لا تكتفِ بمشاهدة اللعبة");
  await expect(page.locator(".hero-wordmark")).toHaveAttribute("src", /KORA_only/);
  await expect(page.locator(".hero-watermark")).toHaveAttribute("src", /logo_14_transparent_HQ/);
  await expect(page.getByText("26", { exact: true })).toHaveCount(0);
  await expect(page.getByText("سيتم التقديم عبر نموذج Microsoft الرسمي باستخدام الحساب الجامعي.")).toHaveCount(0);
  await expect(page.locator(".hero")).toHaveCSS("background-color", "rgb(17, 24, 47)");
  await expect(page.locator(".social-section")).toHaveCount(0);
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#benefits")).toBeVisible();
  await expect(page.locator("#teams")).toBeVisible();
  await expect(page.getByRole("link", { name: "ابدأ طلبك" })).toHaveCount(0);
  await expect(page.getByText("يفتح التقديم قريبًا").first()).toBeVisible();
});

test("places social icons in the header and event facts directly after the hero", async ({ page }) => {
  await expect(page.locator(".hero + .facts-section")).toHaveCount(1);
  const header = page.getByRole("banner");
  const socialLinks = header.locator(".header-social-links");
  await expect(socialLinks).toBeVisible();
  await expect(socialLinks.locator("a")).toHaveCount(3);
  await expect(header.locator("#mobile-navigation .social-links")).toHaveCount(0);

  const links = [
    ["Instagram", "https://www.instagram.com/kora_kfupm"],
    ["X", "https://x.com/KORA_KFUPM"],
    ["TikTok", "https://www.tiktok.com/@kfupm_kora"],
  ] as const;

  for (const [name, href] of links) {
    const link = header.getByRole("link", { name });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }
});

test("teams anchor reaches leadership and teams", async ({ page }) => {
  await page.getByRole("link", { name: "اكتشف فرق العمل" }).click();
  await expect(page).toHaveURL(/#teams$/);
  await expect(page.locator("#teams")).toBeInViewport();
  await expect(page.getByRole("heading", { name: "قيادة كورة" })).toBeVisible();
  await expect(page.getByText("عمر الحربي")).toBeVisible();
  await expect(page.getByText("خالد الجهني")).toBeVisible();
});

test("keeps header social icons visible and separated across target widths", async ({ page }) => {
  for (const width of [320, 375, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    const header = page.getByRole("banner");
    const socialLinks = header.locator(".header-social-links");
    await expect(socialLinks).toBeVisible();

    for (const link of await socialLinks.locator("a").all()) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(40);
      expect(box!.height).toBeGreaterThanOrEqual(40);
    }

    const layout = await page.evaluate((viewportWidth) => {
      const bounds = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const { left, right, top, bottom } = element.getBoundingClientRect();
        return { left, right, top, bottom };
      };
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        logo: bounds(".brand-wordmark"),
        socials: bounds(".header-social-links"),
        control: bounds(viewportWidth < 900 ? ".menu-button" : ".desktop-nav"),
      };
    }, width);

    const overlaps = (
      first: NonNullable<typeof layout.logo>,
      second: NonNullable<typeof layout.logo>,
    ) => first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.logo).not.toBeNull();
    expect(layout.socials).not.toBeNull();
    expect(layout.control).not.toBeNull();
    expect(overlaps(layout.logo!, layout.socials!)).toBe(false);
    expect(overlaps(layout.socials!, layout.control!)).toBe(false);
    expect(layout.logo!.left).toBeGreaterThanOrEqual(layout.socials!.right);
    expect(layout.socials!.left).toBeGreaterThanOrEqual(layout.control!.right);
  }
});

test("mobile menu and organizational accordions support keyboard interaction", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const menuButton = page.getByRole("button", { name: "فتح القائمة" });
  await menuButton.focus();
  await page.keyboard.press("Enter");
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".header-social-links")).toBeVisible();
  await expect(page.locator("#mobile-navigation .social-links")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(menuButton).toHaveAttribute("aria-expanded", "false");
  await expect(menuButton).toBeFocused();

  await page.locator("#teams").scrollIntoViewIfNeeded();
  const department = page.getByRole("button", { name: /إدارة تصميم المتحف/ });
  await department.focus();
  await page.keyboard.press("Enter");
  await expect(department).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("مهند الرحيلي")).toBeVisible();

  const members = page.getByRole("button", { name: /الأعضاء \(3\)/ });
  await members.focus();
  await page.keyboard.press("Enter");
  await expect(members).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("محمد بكر")).toBeVisible();
});

test("reduced motion disables meaningful animation duration", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/");
  const durationMs = await page.locator(".hero-copy").evaluate((element) => {
    const value = getComputedStyle(element).animationDuration;
    return value.endsWith("ms") ? Number.parseFloat(value) : Number.parseFloat(value) * 1000;
  });
  expect(durationMs).toBeLessThanOrEqual(0.01);
  await context.close();
});
