import { neon } from "@neondatabase/serverless";
import {
  CREATE_ESCROW_CONTRACT_TABLE,
  CREATE_ESCROW_CONTRACT_IDX,
  CREATE_MILESTONES_TABLE,
  CREATE_MILESTONES_IDX,
} from "../lib/db.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set.");
const sql = neon(url);

// ponytail: run each statement separately — Neon rejects multiple statements in one call
await sql.query(CREATE_ESCROW_CONTRACT_TABLE);
await sql.query(CREATE_ESCROW_CONTRACT_IDX);
await sql.query(CREATE_MILESTONES_TABLE);
await sql.query(CREATE_MILESTONES_IDX);

console.log("✓ escrow_contracts table ready");
console.log("✓ milestones table ready");
