import { z } from "zod";
import { createTeamMailer, type MailerConfig } from "@/lib/submissions/email";
import type { SubmissionDeps } from "@/lib/submissions/process";
import { describeSpeakerValues, speakerSubject } from "./form";
import type { SpeakerRequest } from "./schema";

export function renderSpeakerEmail(req: SpeakerRequest): { subject: string; text: string } {
  return {
    subject: speakerSubject(req.mode, req.name),
    text: [...describeSpeakerValues(req), "", "أُرسل من نموذج المتحدثين في korakfupm.com"].join("\n"),
  };
}

/** Replies go to the speaker, else to a nominator who left a valid email. */
export function speakerReplyTo(req: SpeakerRequest): string | undefined {
  if (req.email) return req.email;
  if (req.mode === "nominate" && req.nominatorContact) {
    const contact = req.nominatorContact.trim();
    if (z.email().safeParse(contact).success) return contact;
  }
  return undefined;
}

export function createSpeakerEmailDeps(
  cfg: MailerConfig,
): Pick<SubmissionDeps<SpeakerRequest>, "notifyTeam"> {
  const send = createTeamMailer(cfg);
  return {
    notifyTeam: (req) => send({ replyTo: speakerReplyTo(req), ...renderSpeakerEmail(req) }),
  };
}
