import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const sql = neon(url);

await sql.query(
  `ALTER TABLE escrow_contracts ADD COLUMN IF NOT EXISTS share_token TEXT DEFAULT gen_random_uuid()::text`
);
await sql.query(
  `CREATE UNIQUE INDEX IF NOT EXISTS escrow_share_token_idx ON escrow_contracts (share_token) WHERE share_token IS NOT NULL`
);

console.log("✓ share_token column ready");
