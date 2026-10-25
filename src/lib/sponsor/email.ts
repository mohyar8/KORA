import { Resend } from "resend";
import { CONTACT_EMAIL } from "@/lib/constants";
import { describeSponsorValues } from "./format";
import type { SponsorRequest } from "./schema";
import type { SponsorDeps } from "./process";

export function renderTeamEmail(req: SponsorRequest): { subject: string; text: string } {
  return {
    subject: `طلب شراكة جديد — ${req.company}`,
    text: [...describeSponsorValues(req), "", "أُرسل من نموذج الشراكات في korakfupm.com"].join("\n"),
  };
}

export function renderConfirmationEmail(req: SponsorRequest): { subject: string; text: string } {
  const greeting = req.contactName ?? `فريق ${req.company}`;
  return {
    subject: "استلمنا طلب شراكتك مع كورة",
    text: [
      `مرحبًا ${greeting}،`,
      "",
      "شكرًا لاهتمامكم بالشراكة مع «كورة – الصناعة خلف اللعبة». استلمنا طلبكم وسيتواصل معكم فريق الشراكات قريبًا.",
      "",
      `للتواصل المباشر: ${CONTACT_EMAIL}`,
      "",
      "فريق كورة",
    ].join("\n"),
  };
}

export function createEmailDeps(cfg: {
  apiKey?: string;
  from?: string;
  teamTo: string;
}): Pick<SponsorDeps, "notifyTeam" | "confirmToSender"> {
  const send = async (message: { to: string; subject: string; text: string; replyTo?: string }) => {
    if (!cfg.apiKey || !cfg.from) throw new Error("email not configured");
    const { error } = await new Resend(cfg.apiKey).emails.send({ from: cfg.from, ...message });
    if (error) throw new Error(`resend: ${error.message}`);
  };

  return {
    notifyTeam: (req) => send({ to: cfg.teamTo, replyTo: req.email, ...renderTeamEmail(req) }),
    confirmToSender: (req) => send({ to: req.email, ...renderConfirmationEmail(req) }),
  };
}
