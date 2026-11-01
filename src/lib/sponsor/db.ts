import { neon } from "@neondatabase/serverless";
import type { SponsorDeps } from "./process";

/** Neon-backed storage for sponsor requests; see db/001_sponsor_requests.sql. */
export function createDbDeps(
  databaseUrl: string | undefined,
): Pick<SponsorDeps, "save" | "countRecent" | "markNotified"> {
  const client = () => {
    if (!databaseUrl) throw new Error("DATABASE_URL missing");
    return neon(databaseUrl);
  };

  return {
    async save(req, ipHash) {
      const sql = client();
      const rows = await sql`
        insert into sponsor_requests
          (company, email, contact_name, role, phone, sector, interests, track, message, ip_hash)
        values
          (${req.company}, ${req.email}, ${req.contactName ?? null}, ${req.role ?? null},
           ${req.phone ?? null}, ${req.sector ?? null}, ${req.interests}, ${req.track ?? null},
           ${req.message ?? null}, ${ipHash})
        returning id`;
      return String(rows[0].id);
    },

    async countRecent(ipHash, since) {
      const sql = client();
      const rows = await sql`
        select count(*)::int as n from sponsor_requests
        where ip_hash = ${ipHash} and created_at >= ${since.toISOString()}`;
      return Number(rows[0].n);
    },

    async markNotified(id) {
      const sql = client();
      await sql`update sponsor_requests set notified = true where id = ${id}`;
    },
  };
}
