import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import { ApplicationAction } from "../components/ApplicationAction/ApplicationAction";
import { siteConfig } from "../config/site";
import { teamGroups } from "../data/teams";

describe("KORA recruitment page", () => {
  it("renders the header and hero heading", () => {
    render(<App />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /لا تكتفِ بمشاهدة اللعبة/ }),
    ).toBeInTheDocument();
  });

  it("renders every expected team and group in the mobile accordion", () => {
    render(<App />);

    for (const group of teamGroups) {
      expect(screen.getByRole("heading", { name: group.name })).toBeInTheDocument();
      for (const team of group.teams) {
        expect(screen.getByRole("button", { name: new RegExp(team.name) })).toBeInTheDocument();
      }
    }
  });

  it("keeps team ids and names unique", () => {
    const teams = teamGroups.flatMap((group) => group.teams);
    expect(new Set(teams.map((team) => team.id)).size).toBe(teams.length);
    expect(new Set(teams.map((team) => team.name)).size).toBe(teams.length);
  });

  it("does not expose the form while coming soon", () => {
    render(<App />);

    expect(screen.queryByRole("link", { name: "ابدأ طلبك" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /يفتح التقديم قريبًا/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("يفتح التقديم قريبًا").length).toBeGreaterThan(0);
  });

  it("uses the exact configured form link when open", () => {
    render(<ApplicationAction status="open" />);

    const link = screen.getByRole("link", { name: "ابدأ طلبك" });
    expect(link).toHaveAttribute("href", siteConfig.microsoftFormUrl);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders no active form link when closed", () => {
    render(<ApplicationAction status="closed" />);

    expect(screen.getByText("انتهى التقديم")).toHaveAttribute("role", "status");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("updates accordion aria state", async () => {
    const user = userEvent.setup();
    render(<App />);

    const trigger = screen.getByRole("button", { name: /تصميم المعرض/ });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(teamGroups[0].teams[0].description)).toBeVisible();
  });

  it("uses the configured contact and social links", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: siteConfig.contactEmail })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.contactEmail}`,
    );
    expect(screen.getByRole("link", { name: "حساب كورة على إنستغرام" })).toHaveAttribute(
      "href",
      siteConfig.socialLinks.instagram,
    );
    expect(screen.getByRole("link", { name: "حساب كورة على منصة X" })).toHaveAttribute(
      "href",
      siteConfig.socialLinks.x,
    );
    expect(screen.getByRole("link", { name: "حساب كورة على تيك توك" })).toHaveAttribute(
      "href",
      siteConfig.socialLinks.tiktok,
    );
  });
});
