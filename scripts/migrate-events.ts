import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const sql = neon(url);

await sql.query(`
  CREATE TABLE IF NOT EXISTS escrow_events (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    escrow_id   TEXT NOT NULL REFERENCES escrow_contracts(id) ON DELETE CASCADE,
    actor       TEXT NOT NULL,
    event_type  TEXT NOT NULL,
    metadata    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await sql.query(`CREATE INDEX IF NOT EXISTS escrow_events_escrow_id_idx ON escrow_events (escrow_id, created_at DESC)`);

console.log("✓ escrow_events table ready");
