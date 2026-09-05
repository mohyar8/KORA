import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../App";
import { ApplicationAction } from "../components/ApplicationAction/ApplicationAction";
import { siteConfig } from "../config/site";
import { eventTracks } from "../data/eventTracks";
import { departments, overallLeadership } from "../data/organization";
import { teamGroups } from "../data/teams";

async function openAllOrganizationContent(user: ReturnType<typeof userEvent.setup>) {
  for (const department of departments) {
    await user.click(screen.getByRole("button", { name: new RegExp(department.name) }));
  }
  for (const trigger of screen.getAllByRole("button", { name: /الأعضاء/ })) {
    await user.click(trigger);
  }
}

describe("صفحة انضمام كورة", () => {
  it("renders the enlarged official header logo and hero heading", () => {
    render(<App />);

    const header = screen.getByRole("banner");
    const headerLogo = within(header).getByRole("img", { name: "شعار كورة" });
    expect(headerLogo).toHaveAttribute("src", expect.stringContaining("logo_0_transparent_HQ.svg"));
    expect(screen.getByRole("heading", { level: 1, name: /لا تكتفِ بمشاهدة اللعبة/ })).toBeInTheDocument();
  });

  it("uses the official hero wordmark and football watermark", () => {
    const { container } = render(<App />);

    expect(screen.getByRole("img", { name: "شعار كورة باللغة الإنجليزية" })).toHaveAttribute(
      "src",
      expect.stringContaining("KORA_only.svg"),
    );
    expect(container.querySelector(".hero-watermark")).toHaveAttribute(
      "src",
      expect.stringContaining("logo_14_transparent_HQ.svg"),
    );
  });

  it("removes the old hero elements", () => {
    const { container } = render(<App />);

    expect(screen.queryByText("26")).not.toBeInTheDocument();
    expect(screen.queryByText("سيتم التقديم عبر نموذج Microsoft الرسمي باستخدام الحساب الجامعي.")).not.toBeInTheDocument();
    expect(container.querySelector(".hero-accent")).not.toBeInTheDocument();
    expect(container.querySelector(".hero-index")).not.toBeInTheDocument();
  });

  it("does not render a standalone social section or duplicate social links in the header", () => {
    const { container } = render(<App />);

    expect(container.querySelector(".social-section")).not.toBeInTheDocument();
    expect(screen.getByRole("banner").querySelector(".social-links")).not.toBeInTheDocument();
  });

  it("places the accessible social buttons directly below the primary hero action", () => {
    render(<App />);

    const hero = screen.getByRole("region", { name: /لا تكتفِ بمشاهدة اللعبة/ });
    const primaryGroup = hero.querySelector<HTMLElement>(".hero-primary-group");
    expect(primaryGroup).not.toBeNull();
    expect(within(primaryGroup!).getByText("يفتح التقديم قريبًا")).toBeInTheDocument();
    expect(within(primaryGroup!).getByText("تابعنا")).toBeInTheDocument();
    expect(hero.querySelector(".hero-editorial .social-links")).not.toBeInTheDocument();
    expect(within(hero).queryByText(/آخر موعد للتقديم/)).not.toBeInTheDocument();

    const expectedLinks = [
      ["تابع كورة على إنستغرام", siteConfig.socialLinks.instagram],
      ["تابع كورة على منصة X", siteConfig.socialLinks.x],
      ["تابع كورة على تيك توك", siteConfig.socialLinks.tiktok],
    ] as const;

    for (const [name, href] of expectedLinks) {
      const link = within(hero).getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders the canonical About copy in two paragraphs over the supplied pattern", () => {
    const { container } = render(<App />);

    const aboutImages = Array.from(container.querySelectorAll("#about img"));
    expect(aboutImages.some((image) => image.getAttribute("src")?.includes("logo 20"))).toBe(false);
    const about = container.querySelector<HTMLElement>("#about");
    expect(about?.style.getPropertyValue("--about-pattern-image")).toContain(
      "Pattern_2_transparent_HQ.svg",
    );
    expect(within(about!).getByRole("heading", { name: "عن كورة" })).toBeInTheDocument();
    expect(about?.querySelectorAll(".about-content p")).toHaveLength(2);
    expect(within(about!).getByText("«كورة – الصناعة خلف اللعبة»")).toBeInTheDocument();
    expect(about).toHaveTextContent("منصة إعلامية ومعرفية مستدامة");
    expect(about).toHaveTextContent("ولا تنتهي رسالة «كورة» بانتهاء أيام الحدث");
  });

  it("renders all six event tracks from typed data immediately after About", () => {
    const { container } = render(<App />);
    const about = container.querySelector<HTMLElement>("#about");
    const tracksSection = container.querySelector<HTMLElement>("#event-tracks");

    expect(about?.nextElementSibling).toBe(tracksSection);
    expect(tracksSection?.querySelectorAll(".event-track-card")).toHaveLength(6);
    expect(within(tracksSection!).getByRole("heading", { name: "مسارات الحدث وأركانه" })).toBeInTheDocument();

    for (const track of eventTracks) {
      const cardTitle = within(tracksSection!).getByRole("heading", { name: track.title });
      const card = cardTitle.closest("article");
      expect(card).toHaveTextContent(track.number);
      expect(card).toHaveTextContent(track.description);
    }
  });

  it("renders overall leadership and every department manager", () => {
    render(<App />);

    for (const person of overallLeadership) {
      const personName = screen.getByText(person.name);
      expect(personName).toBeInTheDocument();
      expect(personName.previousElementSibling).toHaveTextContent(person.role);
    }

    for (const department of departments) {
      const trigger = screen.getByRole("button", { name: new RegExp(department.name) });
      expect(trigger).toHaveTextContent(department.manager.name);
      expect(trigger).toHaveTextContent(department.manager.role);
    }
  });

  it("renders every team, leader, and member exactly once in the correct department", async () => {
    const user = userEvent.setup();
    render(<App />);
    await openAllOrganizationContent(user);

    const expectedTeamNames = teamGroups.flatMap((group) => group.teams.map((team) => team.name));
    for (const teamName of expectedTeamNames) {
      expect(screen.getAllByText(new RegExp(teamName.replace(/^فريق /, ""))).length).toBeGreaterThan(0);
    }

    for (const department of departments) {
      const trigger = screen.getByRole("button", { name: new RegExp(department.name) });
      const departmentSection = trigger.closest("section");
      expect(departmentSection).not.toBeNull();

      for (const subteam of department.subteams) {
        expect(within(departmentSection!).getByText(subteam.leader.name)).toBeInTheDocument();
        for (const member of subteam.members ?? []) {
          expect(within(departmentSection!).getByText(member)).toBeInTheDocument();
          expect(screen.getAllByText(member)).toHaveLength(1);
        }
      }

      for (const member of department.members ?? []) {
        expect(within(departmentSection!).getByText(member)).toBeInTheDocument();
        expect(screen.getAllByText(member)).toHaveLength(1);
      }
    }
  });

  it("updates department and member accordion ARIA state", async () => {
    const user = userEvent.setup();
    render(<App />);

    const department = screen.getByRole("button", { name: /إدارة تصميم المتحف/ });
    expect(department).toHaveAttribute("aria-expanded", "false");
    await user.click(department);
    expect(department).toHaveAttribute("aria-expanded", "true");

    const members = screen.getAllByRole("button", { name: /الأعضاء/ })[0];
    expect(members).toHaveAttribute("aria-expanded", "false");
    await user.click(members);
    expect(members).toHaveAttribute("aria-expanded", "true");
  });

  it("does not expose the form while coming soon", () => {
    render(<App />);

    expect(screen.queryByRole("link", { name: "ابدأ طلبك" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /يفتح التقديم قريبًا/ })).not.toBeInTheDocument();
    expect(screen.getAllByText("يفتح التقديم قريبًا").length).toBeGreaterThan(0);
  });

  it("uses the exact configured form link only when open", () => {
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

  it("uses the configured email", () => {
    render(<App />);

    expect(screen.getByRole("link", { name: siteConfig.contactEmail })).toHaveAttribute(
      "href",
      `mailto:${siteConfig.contactEmail}`,
    );
  });
});
