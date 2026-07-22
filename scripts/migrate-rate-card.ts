import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const sql = neon(url);

await sql.query(`
  CREATE TABLE IF NOT EXISTS rate_card_items (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     TEXT NOT NULL,
    category    TEXT NOT NULL,
    label       TEXT NOT NULL,
    value       TEXT NOT NULL,
    notes       TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await sql.query(`CREATE INDEX IF NOT EXISTS rate_card_user_id_idx ON rate_card_items (user_id, sort_order)`);

console.log("✓ rate_card_items table ready");
