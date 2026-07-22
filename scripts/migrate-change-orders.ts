import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const sql = neon(url);

await sql.query(`
  CREATE TABLE IF NOT EXISTS change_orders (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    escrow_id    TEXT NOT NULL REFERENCES escrow_contracts(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    description  TEXT,
    amount_delta NUMERIC NOT NULL DEFAULT 0,
    status       TEXT NOT NULL DEFAULT 'proposed',
    share_token  TEXT UNIQUE DEFAULT gen_random_uuid()::text,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`);
await sql.query(`CREATE INDEX IF NOT EXISTS change_orders_escrow_id_idx ON change_orders (escrow_id, created_at DESC)`);

console.log("✓ change_orders table ready");
