import { neon } from "@neondatabase/serverless";
import type {
  AnalysisResponse, EscrowStatus, MilestoneStatus, EscrowWithMilestones, Milestone,
  ChangeOrder, ChangeOrderStatus, RateCardItem, EscrowEvent,
} from "./types";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  return neon(url);
}

// Non-throwing — event logging must never break core functionality
async function logEvent(
  escrowId: string,
  actor: string,
  eventType: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const sql = db();
    await sql`
      INSERT INTO escrow_events (escrow_id, actor, event_type, metadata)
      VALUES (${escrowId}, ${actor}, ${eventType}, ${JSON.stringify(metadata)})
    `;
  } catch { /* intentionally swallowed */ }
}

export async function listEvents(userId: string, escrowId: string): Promise<EscrowEvent[]> {
  const sql = db();
  // ownership: verify escrow belongs to user
  const own = await sql`SELECT id FROM escrow_contracts WHERE id = ${escrowId} AND user_id = ${userId}`;
  if (!own.length) return [];
  const rows = await sql`
    SELECT id, actor, event_type, metadata, created_at
    FROM escrow_events WHERE escrow_id = ${escrowId} ORDER BY created_at ASC
  `;
  return (rows as Array<{ id: string; actor: string; event_type: string; metadata: Record<string, unknown>; created_at: string }>).map((r) => ({
    id: r.id,
    actor: r.actor,
    eventType: r.event_type,
    metadata: r.metadata ?? {},
    createdAt: r.created_at,
  }));
}

export const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS analyses (
    id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id     TEXT NOT NULL,
    file_name   TEXT NOT NULL,
    file_type   TEXT NOT NULL,
    page_count  INTEGER NOT NULL DEFAULT 0,
    extracted_text TEXT NOT NULL,
    analysis    JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS analyses_user_id_idx ON analyses (user_id, created_at DESC);
`;

export async function saveAnalysis(
  userId: string,
  result: AnalysisResponse
): Promise<string> {
  const sql = db();
  const rows = await sql`
    INSERT INTO analyses (user_id, file_name, file_type, page_count, extracted_text, analysis)
    VALUES (${userId}, ${result.metadata.fileName}, ${result.metadata.fileType},
            ${result.metadata.pageCount}, ${result.extractedText}, ${JSON.stringify(result.analysis)})
    RETURNING id
  `;
  return (rows[0] as { id: string }).id;
}

export async function getAnalysis(
  userId: string,
  id: string
): Promise<(AnalysisResponse & { id: string }) | null> {
  const sql = db();
  const rows = await sql`
    SELECT id, file_name, file_type, page_count, extracted_text, analysis
    FROM analyses WHERE id = ${id} AND user_id = ${userId}
  `;
  if (!rows.length) return null;
  const r = rows[0] as {
    id: string; file_name: string; file_type: string;
    page_count: number; extracted_text: string; analysis: unknown;
  };
  return {
    id: r.id,
    extractedText: r.extracted_text,
    metadata: { fileName: r.file_name, fileType: r.file_type, pageCount: r.page_count },
    analysis: r.analysis as AnalysisResponse["analysis"],
  };
}

export type AnalysisSummary = {
  id: string;
  fileName: string;
  createdAt: string;
  agreementTitle: string;
  verdict: string;
  highRisks: number;
};

export async function listAnalyses(userId: string): Promise<AnalysisSummary[]> {
  const sql = db();
  const rows = await sql`
    SELECT id, file_name, created_at,
      COALESCE(analysis->>'agreementTitle', '') as agreement_title,
      COALESCE(analysis->'signingDecision'->>'verdict', '') as verdict,
      COALESCE(jsonb_array_length(
        (SELECT jsonb_agg(r) FROM jsonb_array_elements(COALESCE(analysis->'risks', '[]'::jsonb)) r WHERE r->>'riskLevel' = 'high')
      ), 0) as high_risks
    FROM analyses WHERE user_id = ${userId}
    ORDER BY created_at DESC LIMIT 50
  `;
  return (rows as Array<{ id: string; file_name: string; created_at: string; agreement_title: string; verdict: string; high_risks: number }>).map((r) => ({
    id: r.id,
    fileName: r.file_name,
    createdAt: r.created_at,
    agreementTitle: r.agreement_title,
    verdict: r.verdict,
    highRisks: Number(r.high_risks),
  }));
}

// ── Escrow & Milestones ──────────────────────────────────────────────────────

// ponytail: split into separate strings — Neon tagged template rejects multiple statements in one call
export const CREATE_ESCROW_CONTRACT_TABLE = `
  CREATE TABLE IF NOT EXISTS escrow_contracts (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id      TEXT NOT NULL,
    analysis_id  TEXT,
    title        TEXT NOT NULL,
    counterparty TEXT NOT NULL,
    total_amount NUMERIC NOT NULL,
    currency     TEXT NOT NULL DEFAULT 'USD',
    status       TEXT NOT NULL DEFAULT 'pending',
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
export const CREATE_ESCROW_CONTRACT_IDX = `CREATE INDEX IF NOT EXISTS escrow_user_id_idx ON escrow_contracts (user_id, created_at DESC)`;

export const CREATE_MILESTONES_TABLE = `
  CREATE TABLE IF NOT EXISTS milestones (
    id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    escrow_id    TEXT NOT NULL REFERENCES escrow_contracts(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    description  TEXT,
    amount       NUMERIC,
    due_date     TEXT,
    status       TEXT NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;
export const CREATE_MILESTONES_IDX = `CREATE INDEX IF NOT EXISTS milestones_escrow_id_idx ON milestones (escrow_id, sort_order)`;

export type EscrowSummary = {
  id: string;
  title: string;
  counterparty: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  analysisId: string | null;
  milestoneCount: number;
  completedCount: number;
};

export async function listEscrows(userId: string): Promise<EscrowSummary[]> {
  const sql = db();
  const rows = await sql`
    SELECT
      e.id, e.title, e.counterparty, e.total_amount, e.currency,
      e.status, e.created_at, e.analysis_id,
      COUNT(m.id)::int                                           AS milestone_count,
      COUNT(m.id) FILTER (WHERE m.status = 'completed')::int    AS completed_count
    FROM escrow_contracts e
    LEFT JOIN milestones m ON m.escrow_id = e.id
    WHERE e.user_id = ${userId}
    GROUP BY e.id
    ORDER BY e.created_at DESC
    LIMIT 50
  `;
  return (rows as Array<{
    id: string; title: string; counterparty: string; total_amount: string;
    currency: string; status: string; created_at: string; analysis_id: string | null;
    milestone_count: number; completed_count: number;
  }>).map((r) => ({
    id: r.id,
    title: r.title,
    counterparty: r.counterparty,
    totalAmount: parseFloat(r.total_amount),
    currency: r.currency,
    status: r.status,
    createdAt: r.created_at,
    analysisId: r.analysis_id,
    milestoneCount: Number(r.milestone_count),
    completedCount: Number(r.completed_count),
  }));
}

export async function createEscrow(
  userId: string,
  data: {
    title: string;
    counterparty: string;
    totalAmount: number;
    currency: string;
    notes?: string;
    analysisId?: string;
  }
): Promise<string> {
  const sql = db();
  const rows = await sql`
    INSERT INTO escrow_contracts (user_id, analysis_id, title, counterparty, total_amount, currency, notes)
    VALUES (
      ${userId}, ${data.analysisId ?? null}, ${data.title}, ${data.counterparty},
      ${data.totalAmount}, ${data.currency}, ${data.notes ?? null}
    )
    RETURNING id
  `;
  return (rows[0] as { id: string }).id;
}

export async function getEscrow(
  userId: string,
  id: string
): Promise<EscrowWithMilestones | null> {
  const sql = db();
  const rows = await sql`
    SELECT id, user_id, analysis_id, title, counterparty, total_amount, currency,
           status, notes, creator_confirmed, counterparty_confirmed, share_token, created_at, updated_at
    FROM escrow_contracts WHERE id = ${id} AND user_id = ${userId}
  `;
  if (!rows.length) return null;
  const e = rows[0] as {
    id: string; user_id: string; analysis_id: string | null;
    title: string; counterparty: string; total_amount: string;
    currency: string; status: string; notes: string | null;
    creator_confirmed: boolean; counterparty_confirmed: boolean;
    share_token: string | null;
    created_at: string; updated_at: string;
  };

  const mRows = await sql`
    SELECT id, escrow_id, title, description, amount, due_date,
           status, completed_at, sort_order, created_at
    FROM milestones WHERE escrow_id = ${id} ORDER BY sort_order, created_at
  `;

  return {
    id: e.id,
    userId: e.user_id,
    analysisId: e.analysis_id,
    title: e.title,
    counterparty: e.counterparty,
    totalAmount: parseFloat(e.total_amount),
    currency: e.currency,
    status: e.status as EscrowStatus,
    notes: e.notes,
    creatorConfirmed: e.creator_confirmed,
    counterpartyConfirmed: e.counterparty_confirmed,
    shareToken: e.share_token,
    createdAt: e.created_at,
    updatedAt: e.updated_at,
    milestones: (mRows as Array<{
      id: string; escrow_id: string; title: string; description: string | null;
      amount: string | null; due_date: string | null; status: string;
      completed_at: string | null; sort_order: number; created_at: string;
    }>).map((m) => ({
      id: m.id,
      escrowId: m.escrow_id,
      title: m.title,
      description: m.description,
      amount: m.amount != null ? parseFloat(m.amount) : null,
      dueDate: m.due_date,
      status: m.status as MilestoneStatus,
      completedAt: m.completed_at,
      sortOrder: m.sort_order,
      createdAt: m.created_at,
    })),
  };
}

// ── Public share-link functions ───────────────────────────────────────────────

export type ShareEscrow = {
  title: string;
  counterparty: string;
  totalAmount: number;
  currency: string;
  counterpartyConfirmed: boolean;
  status: string;
  milestones: Array<{ title: string; amount: number | null; status: string; completedAt: string | null }>;
};

export async function getEscrowByToken(token: string): Promise<ShareEscrow | null> {
  const sql = db();
  const rows = await sql`
    SELECT id, title, counterparty, total_amount, currency, status, counterparty_confirmed
    FROM escrow_contracts WHERE share_token = ${token}
  `;
  if (!rows.length) return null;
  const e = rows[0] as {
    id: string; title: string; counterparty: string; total_amount: string;
    currency: string; status: string; counterparty_confirmed: boolean;
  };

  const mRows = await sql`
    SELECT title, amount, status, completed_at FROM milestones WHERE escrow_id = ${e.id} ORDER BY sort_order, created_at
  `;

  return {
    title: e.title,
    counterparty: e.counterparty,
    totalAmount: parseFloat(e.total_amount),
    currency: e.currency,
    counterpartyConfirmed: e.counterparty_confirmed,
    status: e.status,
    milestones: (mRows as Array<{ title: string; amount: string | null; status: string; completed_at: string | null }>).map((m) => ({
      title: m.title,
      amount: m.amount != null ? parseFloat(m.amount) : null,
      status: m.status,
      completedAt: m.completed_at,
    })),
  };
}

export async function confirmByToken(token: string): Promise<"confirmed" | "already_confirmed" | "not_found"> {
  const sql = db();
  // Check if token exists regardless of status
  const exists = await sql`SELECT id, counterparty_confirmed, status FROM escrow_contracts WHERE share_token = ${token}`;
  if (!exists.length) return "not_found";
  const row = exists[0] as { id: string; counterparty_confirmed: boolean; status: string };
  if (row.counterparty_confirmed) return "already_confirmed";
  await sql`
    UPDATE escrow_contracts SET counterparty_confirmed = true, updated_at = NOW()
    WHERE share_token = ${token}
  `;
  await logEvent(row.id, "counterparty", "counterparty_confirmed");
  return "confirmed";
}

const ALLOWED_TRANSITIONS: Record<EscrowStatus, EscrowStatus[]> = {
  pending:  ["active"],
  active:   ["released", "disputed"],
  disputed: ["active", "released"],
  released: [],
};

export function isAllowedTransition(from: EscrowStatus, to: EscrowStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function updateEscrowStatus(
  userId: string,
  id: string,
  status: EscrowStatus
): Promise<{ ok: boolean; error?: string }> {
  const sql = db();
  // Read current status and enforce state machine
  const current = await sql`SELECT status FROM escrow_contracts WHERE id = ${id} AND user_id = ${userId}`;
  if (!current.length) return { ok: false, error: "Not found" };
  const from = (current[0] as { status: EscrowStatus }).status;
  if (!isAllowedTransition(from, status)) {
    return { ok: false, error: `Cannot transition from ${from} to ${status}` };
  }
  await sql`UPDATE escrow_contracts SET status = ${status}, updated_at = NOW() WHERE id = ${id} AND user_id = ${userId}`;
  await logEvent(id, userId, "status_changed", { from, to: status });
  return { ok: true };
}

export async function updateEscrowTotalAmount(userId: string, id: string, delta: number): Promise<void> {
  const sql = db();
  await sql`
    UPDATE escrow_contracts SET total_amount = total_amount + ${delta}, updated_at = NOW()
    WHERE id = ${id} AND user_id = ${userId}
  `;
}

export async function addMilestone(
  escrowId: string,
  data: {
    title: string;
    description?: string | null;
    amount?: number | null;
    dueDate?: string | null;
    sortOrder?: number;
  }
): Promise<Milestone> {
  const sql = db();
  const rows = await sql`
    INSERT INTO milestones (escrow_id, title, description, amount, due_date, sort_order)
    VALUES (
      ${escrowId}, ${data.title}, ${data.description ?? null},
      ${data.amount ?? null}, ${data.dueDate ?? null}, ${data.sortOrder ?? 0}
    )
    RETURNING id, escrow_id, title, description, amount, due_date,
              status, completed_at, sort_order, created_at
  `;
  const m = rows[0] as {
    id: string; escrow_id: string; title: string; description: string | null;
    amount: string | null; due_date: string | null; status: string;
    completed_at: string | null; sort_order: number; created_at: string;
  };
  return {
    id: m.id,
    escrowId: m.escrow_id,
    title: m.title,
    description: m.description,
    amount: m.amount != null ? parseFloat(m.amount) : null,
    dueDate: m.due_date,
    status: m.status as MilestoneStatus,
    completedAt: m.completed_at,
    sortOrder: m.sort_order,
    createdAt: m.created_at,
  };
}

export async function updateMilestoneStatus(
  userId: string,
  id: string,
  status: MilestoneStatus
): Promise<void> {
  const sql = db();
  // Get escrow_id and milestone title for event logging before update
  const ctx = await sql`
    SELECT m.title, m.escrow_id FROM milestones m
    JOIN escrow_contracts e ON m.escrow_id = e.id
    WHERE m.id = ${id} AND e.user_id = ${userId}
  `;
  if (status === "completed") {
    await sql`
      UPDATE milestones SET status = ${status}, completed_at = NOW()
      FROM escrow_contracts e
      WHERE milestones.id = ${id} AND milestones.escrow_id = e.id AND e.user_id = ${userId}
    `;
  } else {
    await sql`
      UPDATE milestones SET status = ${status}, completed_at = NULL
      FROM escrow_contracts e
      WHERE milestones.id = ${id} AND milestones.escrow_id = e.id AND e.user_id = ${userId}
    `;
  }
  if (ctx.length) {
    const { escrow_id, title } = ctx[0] as { escrow_id: string; title: string };
    const eventType = status === "completed" ? "milestone_completed" : "milestone_reopened";
    await logEvent(escrow_id, userId, eventType, { milestoneTitle: title });
  }
}

export async function deleteMilestone(userId: string, id: string): Promise<void> {
  const sql = db();
  await sql`
    DELETE FROM milestones
    USING escrow_contracts e
    WHERE milestones.id = ${id} AND milestones.escrow_id = e.id AND e.user_id = ${userId}
  `;
}

export async function updateEscrowConfirmation(
  userId: string,
  id: string,
  party: "creator" | "counterparty",
  confirmed: boolean
): Promise<void> {
  const sql = db();
  // ponytail: two branches instead of dynamic column name — can't interpolate identifiers safely
  if (party === "creator") {
    await sql`UPDATE escrow_contracts SET creator_confirmed = ${confirmed}, updated_at = NOW() WHERE id = ${id} AND user_id = ${userId}`;
  } else {
    await sql`UPDATE escrow_contracts SET counterparty_confirmed = ${confirmed}, updated_at = NOW() WHERE id = ${id} AND user_id = ${userId}`;
  }
  const eventType = party === "creator"
    ? (confirmed ? "creator_confirmed" : "creator_unconfirmed")
    : (confirmed ? "counterparty_confirmed" : "counterparty_unconfirmed");
  await logEvent(id, userId, eventType);
}

// ── Change Orders ─────────────────────────────────────────────────────────────

function mapChangeOrder(r: {
  id: string; escrow_id: string; title: string; description: string | null;
  amount_delta: string; status: string; share_token: string | null;
  created_at: string; updated_at: string;
}): ChangeOrder {
  return {
    id: r.id,
    escrowId: r.escrow_id,
    title: r.title,
    description: r.description,
    amountDelta: parseFloat(r.amount_delta),
    status: r.status as ChangeOrderStatus,
    shareToken: r.share_token,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listChangeOrders(userId: string, escrowId: string): Promise<ChangeOrder[]> {
  const sql = db();
  const rows = await sql`
    SELECT co.id, co.escrow_id, co.title, co.description, co.amount_delta,
           co.status, co.share_token, co.created_at, co.updated_at
    FROM change_orders co
    JOIN escrow_contracts e ON co.escrow_id = e.id
    WHERE co.escrow_id = ${escrowId} AND e.user_id = ${userId}
    ORDER BY co.created_at DESC
  `;
  return (rows as Parameters<typeof mapChangeOrder>[0][]).map(mapChangeOrder);
}

export async function createChangeOrder(
  userId: string,
  escrowId: string,
  data: { title: string; description?: string | null; amountDelta: number }
): Promise<ChangeOrder> {
  const sql = db();
  // verify ownership
  const own = await sql`SELECT id FROM escrow_contracts WHERE id = ${escrowId} AND user_id = ${userId}`;
  if (!own.length) throw new Error("Escrow not found");

  const rows = await sql`
    INSERT INTO change_orders (escrow_id, title, description, amount_delta)
    VALUES (${escrowId}, ${data.title}, ${data.description ?? null}, ${data.amountDelta})
    RETURNING id, escrow_id, title, description, amount_delta, status, share_token, created_at, updated_at
  `;
  const co = mapChangeOrder(rows[0] as Parameters<typeof mapChangeOrder>[0]);
  await logEvent(escrowId, userId, "change_order_proposed", { title: data.title, amountDelta: data.amountDelta });
  return co;
}

export type ShareChangeOrder = {
  id: string;
  title: string;
  description: string | null;
  amountDelta: number;
  status: string;
  escrowTitle: string;
  escrowCounterparty: string;
  escrowTotal: number;
  currency: string;
};

export async function getChangeOrderByToken(token: string): Promise<ShareChangeOrder | null> {
  const sql = db();
  const rows = await sql`
    SELECT co.id, co.title, co.description, co.amount_delta, co.status,
           e.title AS escrow_title, e.counterparty, e.total_amount, e.currency
    FROM change_orders co
    JOIN escrow_contracts e ON co.escrow_id = e.id
    WHERE co.share_token = ${token}
  `;
  if (!rows.length) return null;
  const r = rows[0] as {
    id: string; title: string; description: string | null; amount_delta: string;
    status: string; escrow_title: string; counterparty: string; total_amount: string; currency: string;
  };
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    amountDelta: parseFloat(r.amount_delta),
    status: r.status,
    escrowTitle: r.escrow_title,
    escrowCounterparty: r.counterparty,
    escrowTotal: parseFloat(r.total_amount),
    currency: r.currency,
  };
}

export async function respondToChangeOrder(
  token: string,
  status: "accepted" | "rejected"
): Promise<"ok" | "already_responded" | "not_found"> {
  const sql = db();
  const exists = await sql`SELECT id, status, escrow_id, amount_delta FROM change_orders WHERE share_token = ${token}`;
  if (!exists.length) return "not_found";
  const co = exists[0] as { id: string; status: string; escrow_id: string; amount_delta: string };
  if (co.status !== "proposed") return "already_responded";
  await sql`UPDATE change_orders SET status = ${status}, updated_at = NOW() WHERE share_token = ${token}`;
  if (status === "accepted") {
    await sql`UPDATE escrow_contracts SET total_amount = total_amount + ${parseFloat(co.amount_delta)}, updated_at = NOW() WHERE id = ${co.escrow_id}`;
  }
  const eventType = status === "accepted" ? "change_order_accepted" : "change_order_rejected";
  await logEvent(co.escrow_id, "counterparty", eventType, { changeOrderId: co.id, amountDelta: parseFloat(co.amount_delta) });
  return "ok";
}

// ── Rate Card ─────────────────────────────────────────────────────────────────

function mapRateCardItem(r: {
  id: string; user_id: string; category: string; label: string; value: string;
  notes: string | null; sort_order: number; created_at: string;
}): RateCardItem {
  return {
    id: r.id,
    userId: r.user_id,
    category: r.category,
    label: r.label,
    value: r.value,
    notes: r.notes,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
  };
}

export async function listRateCardItems(userId: string): Promise<RateCardItem[]> {
  const sql = db();
  const rows = await sql`
    SELECT id, user_id, category, label, value, notes, sort_order, created_at
    FROM rate_card_items WHERE user_id = ${userId} ORDER BY sort_order, created_at
  `;
  return (rows as Parameters<typeof mapRateCardItem>[0][]).map(mapRateCardItem);
}

export async function createRateCardItem(
  userId: string,
  data: { category: string; label: string; value: string; notes?: string | null; sortOrder?: number }
): Promise<RateCardItem> {
  const sql = db();
  const rows = await sql`
    INSERT INTO rate_card_items (user_id, category, label, value, notes, sort_order)
    VALUES (${userId}, ${data.category}, ${data.label}, ${data.value}, ${data.notes ?? null}, ${data.sortOrder ?? 0})
    RETURNING id, user_id, category, label, value, notes, sort_order, created_at
  `;
  return mapRateCardItem(rows[0] as Parameters<typeof mapRateCardItem>[0]);
}

export async function deleteRateCardItem(userId: string, id: string): Promise<void> {
  const sql = db();
  await sql`DELETE FROM rate_card_items WHERE id = ${id} AND user_id = ${userId}`;
}

// ── Intelligence queries ───────────────────────────────────────────────────────

export type DeadlineItem = {
  id: string;
  title: string;
  description: string | null;
  amount: number | null;
  dueDate: string;
  status: MilestoneStatus;
  escrowId: string;
  escrowTitle: string;
  counterparty: string;
  currency: string;
  escrowStatus: string;
  daysUntilDue: number;
};

export async function queryDeadlines(userId: string): Promise<DeadlineItem[]> {
  const sql = db();
  const rows = await sql`
    SELECT m.id, m.title, m.description, m.amount, m.due_date, m.status,
           e.id AS escrow_id, e.title AS escrow_title, e.counterparty, e.currency, e.status AS escrow_status,
           (m.due_date::date - CURRENT_DATE) AS days_until_due
    FROM milestones m
    JOIN escrow_contracts e ON m.escrow_id = e.id
    WHERE e.user_id = ${userId}
      AND m.due_date IS NOT NULL
      AND m.status != 'completed'
      AND e.status IN ('pending', 'active')
    ORDER BY m.due_date ASC
  `;
  return (rows as Array<{
    id: string; title: string; description: string | null; amount: string | null;
    due_date: string; status: string; escrow_id: string; escrow_title: string;
    counterparty: string; currency: string; escrow_status: string; days_until_due: number;
  }>).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    amount: r.amount != null ? parseFloat(r.amount) : null,
    dueDate: r.due_date,
    status: r.status as MilestoneStatus,
    escrowId: r.escrow_id,
    escrowTitle: r.escrow_title,
    counterparty: r.counterparty,
    currency: r.currency,
    escrowStatus: r.escrow_status,
    daysUntilDue: Number(r.days_until_due),
  }));
}

export type ClientSummary = {
  counterparty: string;
  totalContracts: number;
  activeContracts: number;
  completedContracts: number;
  disputedContracts: number;
  totalValue: number;
  releasedValue: number;
  firstContract: string;
  lastContract: string;
  health: "green" | "amber" | "red" | "neutral";
};

export async function queryClients(userId: string): Promise<ClientSummary[]> {
  const sql = db();
  const rows = await sql`
    SELECT
      counterparty,
      COUNT(*)::int                                                       AS total_contracts,
      COUNT(*) FILTER (WHERE status IN ('active', 'pending'))::int       AS active_contracts,
      COUNT(*) FILTER (WHERE status = 'released')::int                   AS completed_contracts,
      COUNT(*) FILTER (WHERE status = 'disputed')::int                   AS disputed_contracts,
      SUM(total_amount)                                                   AS total_value,
      COALESCE(SUM(total_amount) FILTER (WHERE status = 'released'), 0)  AS released_value,
      MIN(created_at)                                                     AS first_contract,
      MAX(created_at)                                                     AS last_contract
    FROM escrow_contracts
    WHERE user_id = ${userId}
    GROUP BY counterparty
    ORDER BY total_value DESC
  `;
  return (rows as Array<{
    counterparty: string; total_contracts: number; active_contracts: number;
    completed_contracts: number; disputed_contracts: number;
    total_value: string; released_value: string;
    first_contract: string; last_contract: string;
  }>).map((r) => {
    const disputed = Number(r.disputed_contracts);
    const completed = Number(r.completed_contracts);
    const health: ClientSummary["health"] =
      disputed > 0 ? "red" :
      completed > 0 ? "green" :
      "neutral";
    return {
      counterparty: r.counterparty,
      totalContracts: Number(r.total_contracts),
      activeContracts: Number(r.active_contracts),
      completedContracts: completed,
      disputedContracts: disputed,
      totalValue: parseFloat(r.total_value),
      releasedValue: parseFloat(r.released_value),
      firstContract: r.first_contract,
      lastContract: r.last_contract,
      health,
    };
  });
}

export type AnalyticsData = {
  overview: {
    totalReleased: number;
    activeValue: number;
    avgContractValue: number;
    totalContracts: number;
    totalClients: number;
  };
  byStatus: Array<{ status: string; count: number; totalValue: number }>;
  monthlyRevenue: Array<{ month: string; label: string; amount: number }>;
  topClients: Array<{ counterparty: string; contracts: number; totalValue: number; releasedValue: number }>;
};

export async function queryAnalytics(userId: string): Promise<AnalyticsData> {
  const sql = db();

  const [overviewRows, byStatusRows, monthlyRows, topClientsRows] = await Promise.all([
    sql`
      SELECT
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'released'), 0)        AS total_released,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'active'), 0)          AS active_value,
        COALESCE(AVG(total_amount), 0)                                            AS avg_contract_value,
        COUNT(*)::int                                                             AS total_contracts,
        COUNT(DISTINCT counterparty)::int                                         AS total_clients
      FROM escrow_contracts WHERE user_id = ${userId}
    `,
    sql`
      SELECT status, COUNT(*)::int AS count, COALESCE(SUM(total_amount), 0) AS total_value
      FROM escrow_contracts WHERE user_id = ${userId}
      GROUP BY status ORDER BY count DESC
    `,
    sql`
      SELECT TO_CHAR(updated_at, 'YYYY-MM') AS month,
             TO_CHAR(updated_at, 'Mon YY')  AS label,
             SUM(total_amount)              AS amount
      FROM escrow_contracts
      WHERE user_id = ${userId} AND status = 'released'
      GROUP BY TO_CHAR(updated_at, 'YYYY-MM'), TO_CHAR(updated_at, 'Mon YY')
      ORDER BY month DESC LIMIT 12
    `,
    sql`
      SELECT counterparty,
             COUNT(*)::int                                                      AS contracts,
             SUM(total_amount)                                                  AS total_value,
             COALESCE(SUM(total_amount) FILTER (WHERE status = 'released'), 0) AS released_value
      FROM escrow_contracts WHERE user_id = ${userId}
      GROUP BY counterparty ORDER BY total_value DESC LIMIT 5
    `,
  ]);

  const o = overviewRows[0] as {
    total_released: string; active_value: string;
    avg_contract_value: string; total_contracts: number; total_clients: number;
  };

  return {
    overview: {
      totalReleased: parseFloat(o.total_released),
      activeValue: parseFloat(o.active_value),
      avgContractValue: parseFloat(o.avg_contract_value),
      totalContracts: Number(o.total_contracts),
      totalClients: Number(o.total_clients),
    },
    byStatus: (byStatusRows as Array<{ status: string; count: number; total_value: string }>).map((r) => ({
      status: r.status,
      count: Number(r.count),
      totalValue: parseFloat(r.total_value),
    })),
    monthlyRevenue: (monthlyRows as Array<{ month: string; label: string; amount: string }>).map((r) => ({
      month: r.month,
      label: r.label,
      amount: parseFloat(r.amount),
    })).reverse(),
    topClients: (topClientsRows as Array<{ counterparty: string; contracts: number; total_value: string; released_value: string }>).map((r) => ({
      counterparty: r.counterparty,
      contracts: Number(r.contracts),
      totalValue: parseFloat(r.total_value),
      releasedValue: parseFloat(r.released_value),
    })),
  };
}

