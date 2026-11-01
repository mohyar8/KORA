import { neon } from "@neondatabase/serverless";
import type { SubmissionDeps } from "@/lib/submissions/process";
import type { SpeakerRequest } from "./schema";

/** Neon-backed storage for speaker submissions; see db/002_speaker_requests.sql. */
export function createSpeakerDbDeps(
  databaseUrl: string | undefined,
): Pick<SubmissionDeps<SpeakerRequest>, "save" | "countRecent" | "markNotified"> {
  const client = () => {
    if (!databaseUrl) throw new Error("DATABASE_URL missing");
    return neon(databaseUrl);
  };

  return {
    async save(req, ipHash) {
      const sql = client();
      const rows = await sql`
        insert into speaker_requests
          (mode, name, role, bio, email, phone, link, topic, track, formats,
           nominator_name, nominator_contact, ip_hash)
        values
          (${req.mode}, ${req.name}, ${req.role}, ${req.bio}, ${req.email ?? null},
           ${req.phone ?? null}, ${req.link ?? null}, ${req.topic ?? null}, ${req.track ?? null},
           ${req.formats}, ${req.nominatorName ?? null}, ${req.nominatorContact ?? null}, ${ipHash})
        returning id`;
      return String(rows[0].id);
    },

    async countRecent(ipHash, since) {
      const sql = client();
      const rows = await sql`
        select count(*)::int as n from speaker_requests
        where ip_hash = ${ipHash} and created_at >= ${since.toISOString()}`;
      return Number(rows[0].n);
    },

    async markNotified(id) {
      const sql = client();
      await sql`update speaker_requests set notified = true where id = ${id}`;
    },
  };
}
