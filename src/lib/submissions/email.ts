import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface MailerConfig {
  /** One or more team inboxes. */
  teamTo: string[];
  /** Gmail sender: used when both are set (KFUPM accepts Gmail, not korakfupm.com). */
  gmailUser?: string;
  gmailAppPassword?: string;
  /** Resend fallback. */
  apiKey?: string;
  from?: string;
}

type TeamMessage = { subject: string; text: string; replyTo?: string };

/**
 * Sends a plain-text notification to the KORA team. Only the team is ever
 * emailed; sponsors and speakers never receive automatic messages.
 */
export function createTeamMailer(cfg: MailerConfig): (message: TeamMessage) => Promise<void> {
  const gmailUser = cfg.gmailUser?.trim();
  const gmailPassword = cfg.gmailAppPassword?.replace(/\s+/g, "");

  if (gmailUser && gmailPassword) {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: gmailUser, pass: gmailPassword },
    });
    return async (message) => {
      if (cfg.teamTo.length === 0) throw new Error("email not configured");
      await transport.sendMail({
        from: { name: "تنبيهات كورة", address: gmailUser },
        to: cfg.teamTo,
        ...message,
      });
    };
  }

  return async (message) => {
    if (!cfg.apiKey || !cfg.from || cfg.teamTo.length === 0) {
      throw new Error("email not configured");
    }
    const { error } = await new Resend(cfg.apiKey).emails.send({
      from: cfg.from,
      to: cfg.teamTo,
      ...message,
    });
    if (error) throw new Error(`resend: ${error.message}`);
  };
}
