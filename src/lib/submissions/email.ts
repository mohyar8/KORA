import { Resend } from "resend";

export interface MailerConfig {
  apiKey?: string;
  from?: string;
  /** One or more team inboxes. */
  teamTo: string[];
}

/**
 * Sends a plain-text notification to the KORA team. Only the team is ever
 * emailed; sponsors and speakers never receive automatic messages.
 */
export function createTeamMailer(cfg: MailerConfig) {
  return async (message: { subject: string; text: string; replyTo?: string }) => {
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
