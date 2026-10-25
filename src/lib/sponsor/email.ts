import { Resend } from "resend";
import { describeSponsorValues } from "./format";
import type { SponsorRequest } from "./schema";
import type { SponsorDeps } from "./process";

export function renderTeamEmail(req: SponsorRequest): { subject: string; text: string } {
  return {
    subject: `طلب شراكة جديد — ${req.company}`,
    text: [...describeSponsorValues(req), "", "أُرسل من نموذج الشراكات في korakfupm.com"].join("\n"),
  };
}

export function createEmailDeps(cfg: {
  apiKey?: string;
  from?: string;
  /** One or more team inboxes. */
  teamTo: string[];
}): Pick<SponsorDeps, "notifyTeam"> {
  // Only the KORA team is emailed; sponsors never receive automatic messages.
  const send = async (message: { to: string[]; subject: string; text: string; replyTo?: string }) => {
    if (!cfg.apiKey || !cfg.from || message.to.length === 0) throw new Error("email not configured");
    const { error } = await new Resend(cfg.apiKey).emails.send({ from: cfg.from, ...message });
    if (error) throw new Error(`resend: ${error.message}`);
  };

  return {
    notifyTeam: (req) => send({ to: cfg.teamTo, replyTo: req.email, ...renderTeamEmail(req) }),
  };
}
