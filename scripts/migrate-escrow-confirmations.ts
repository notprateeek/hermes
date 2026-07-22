import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const sql = neon(url);

await sql.query(`ALTER TABLE escrow_contracts ADD COLUMN IF NOT EXISTS creator_confirmed BOOLEAN NOT NULL DEFAULT false`);
await sql.query(`ALTER TABLE escrow_contracts ADD COLUMN IF NOT EXISTS counterparty_confirmed BOOLEAN NOT NULL DEFAULT false`);

console.log("✓ creator_confirmed column ready");
console.log("✓ counterparty_confirmed column ready");
