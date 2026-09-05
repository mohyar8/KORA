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

test("places the social squares below the primary CTA with safe links", async ({ page }) => {
  await expect(page.locator(".hero + .facts-section")).toHaveCount(1);
  const header = page.getByRole("banner");
  const primaryGroup = page.locator(".hero-primary-group");
  const socialLinks = page.locator(".hero-social-links");
  await expect(socialLinks).toBeVisible();
  await expect(socialLinks.locator("a")).toHaveCount(3);
  await expect(header.locator(".social-links")).toHaveCount(0);
  await expect(primaryGroup.locator(".application-action")).toHaveCount(1);
  await expect(primaryGroup.locator(".hero-social-block")).toHaveCount(1);
  await expect(page.locator(".hero-editorial .social-links")).toHaveCount(0);
  await expect(page.locator(".hero").getByText(/آخر موعد للتقديم/)).toHaveCount(0);
  await expect(page.locator(".hero-social-label")).toHaveText("تابعنا");

  const links = [
    ["تابع كورة على إنستغرام", "https://www.instagram.com/kora_kfupm"],
    ["تابع كورة على منصة X", "https://x.com/KORA_KFUPM"],
    ["تابع كورة على تيك توك", "https://www.tiktok.com/@kfupm_kora"],
  ] as const;

  for (const [name, href] of links) {
    const link = page.getByRole("link", { name });
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

test("keeps the mobile-first hero and event cards responsive across target widths", async ({ page }) => {
  for (const width of [320, 360, 375, 390, 412, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });

    const socialLinks = page.locator(".hero-social-links");
    await expect(socialLinks).toBeVisible();

    for (const link of await socialLinks.locator("a").all()) {
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThanOrEqual(40);
      expect(box!.height).toBeGreaterThanOrEqual(40);
    }

    const layout = await page.evaluate(() => {
      const bounds = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const { left, right, top, bottom } = element.getBoundingClientRect();
        return { left, right, top, bottom };
      };
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        header: bounds(".site-header"),
        hero: bounds(".hero"),
        headline: bounds(".hero h1"),
        primaryAction: bounds(".hero-primary-group .application-action"),
        socialBlock: bounds(".hero-social-block"),
        secondaryAction: bounds(".hero-secondary-action"),
        socials: bounds(".hero-social-links"),
        wordmark: bounds(".hero-wordmark"),
        tagline: bounds(".hero-signature > p"),
        watermark: bounds(".hero-watermark"),
        heroClipsContent: document.querySelector(".hero")!.scrollHeight > document.querySelector(".hero")!.clientHeight,
        trackColumns: getComputedStyle(document.querySelector(".event-tracks-grid")!).gridTemplateColumns.split(" ").length,
      };
    });

    const overlaps = (
      first: NonNullable<typeof layout.socials>,
      second: NonNullable<typeof layout.socials>,
    ) => first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
    expect(layout.header).not.toBeNull();
    expect(layout.hero).not.toBeNull();
    expect(layout.headline).not.toBeNull();
    expect(layout.hero!.top).toBeGreaterThanOrEqual(layout.header!.bottom - 1);
    expect(layout.headline!.top).toBeGreaterThanOrEqual(layout.hero!.top);
    expect(layout.primaryAction).not.toBeNull();
    expect(layout.socialBlock).not.toBeNull();
    expect(layout.socialBlock!.top).toBeGreaterThanOrEqual(layout.primaryAction!.bottom);
    expect(layout.secondaryAction).not.toBeNull();
    expect(overlaps(layout.socialBlock!, layout.secondaryAction!)).toBe(false);
    expect(layout.socials).not.toBeNull();
    expect(layout.wordmark).not.toBeNull();
    expect(layout.tagline).not.toBeNull();
    expect(layout.heroClipsContent).toBe(false);
    if (width < 900) {
      expect(Math.abs(layout.wordmark!.left - layout.tagline!.left)).toBeLessThanOrEqual(1);
      expect(layout.watermark!.right - layout.watermark!.left).toBeGreaterThanOrEqual(420);
    }
    expect(layout.trackColumns).toBe(width >= 1024 ? 3 : width >= 600 ? 2 : 1);
  }
});

test("renders the expanded About copy and all six event tracks in order", async ({ page }) => {
  const about = page.locator("#about");
  await expect(about.getByRole("heading", { name: "عن كورة" })).toBeVisible();
  await expect(about.locator(".about-content p")).toHaveCount(2);
  await expect(about).toContainText("«كورة – الصناعة خلف اللعبة»");
  await expect(about).toContainText("منصة إعلامية ومعرفية مستدامة");
  await expect(about).toContainText("ولا تنتهي رسالة «كورة» بانتهاء أيام الحدث");
  await expect(page.locator("#about + #event-tracks")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "مسارات الحدث وأركانه" })).toBeVisible();
  await expect(page.locator(".event-track-card")).toHaveCount(6);
  await expect(page.locator(".event-track-card h3")).toHaveText([
    "المتحف التاريخي",
    "الإعلام",
    "الاقتصاد والاستثمار",
    "ريادة الأعمال",
    "الركن الترفيهي",
    "المسرح الرئيسي",
  ]);
});

test("mobile menu and organizational accordions support keyboard interaction", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  const menuButton = page.getByRole("button", { name: "فتح القائمة" });
  await menuButton.focus();
  await page.keyboard.press("Enter");
  await expect(menuButton).toHaveAttribute("aria-expanded", "true");
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
