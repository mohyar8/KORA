import { createTeamMailer, type MailerConfig } from "@/lib/submissions/email";
import { describeSponsorValues } from "./format";
import type { SponsorRequest } from "./schema";
import type { SponsorDeps } from "./process";

export function renderTeamEmail(req: SponsorRequest): { subject: string; text: string } {
  return {
    subject: `طلب شراكة جديد — ${req.company}`,
    text: [...describeSponsorValues(req), "", "أُرسل من نموذج الشراكات في korakfupm.com"].join("\n"),
  };
}

export function createEmailDeps(cfg: MailerConfig): Pick<SponsorDeps, "notifyTeam"> {
  const send = createTeamMailer(cfg);
  return {
    notifyTeam: (req) => send({ replyTo: req.email, ...renderTeamEmail(req) }),
  };
}
