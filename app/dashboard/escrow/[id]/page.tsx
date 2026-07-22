"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Lock, CheckCircle2, AlertTriangle, Plus,
  Trash2, Workflow, Clock, AlertCircle, Copy, FileText,
} from "lucide-react";
import type { EscrowWithMilestones, Milestone, EscrowStatus, MilestoneStatus, ChangeOrder, ChangeOrderStatus, EscrowEvent } from "../../../../lib/types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EscrowStatus }) {
  const map: Record<EscrowStatus, string> = {
    pending:  "border-gold/30 bg-gold/10 text-gold",
    active:   "border-teal/30 bg-teal/10 text-teal",
    released: "border-border bg-surface-raised text-text-muted",
    disputed: "border-danger/30 bg-danger/5 text-danger",
  };
  const labels: Record<EscrowStatus, string> = {
    pending: "Pending", active: "Active", released: "Released", disputed: "Disputed",
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${map[status]}`}>
      {labels[status]}
    </span>
  );
}

function ConfirmCheckbox({
  checked,
  label,
  sublabel,
  onChange,
}: {
  checked: boolean;
  label: string;
  sublabel: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 py-3">
      <button
        onClick={() => onChange(!checked)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
          checked ? "border-teal bg-teal" : "border-border hover:border-teal"
        }`}
        aria-label={checked ? "Uncheck" : "Check"}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div>
        <p className={`text-sm font-medium ${checked ? "text-teal" : "text-text-primary"}`}>{label}</p>
        <p className="text-xs text-text-muted">{sublabel}</p>
      </div>
    </div>
  );
}

function StatusWorkflow({
  status,
  counterparty,
  creatorConfirmed,
  counterpartyConfirmed,
  shareToken,
  onUpdateStatus,
  onConfirm,
}: {
  status: EscrowStatus;
  counterparty: string;
  creatorConfirmed: boolean;
  counterpartyConfirmed: boolean;
  shareToken: string | null;
  onUpdateStatus: (s: EscrowStatus, msg: string) => Promise<void>;
  onConfirm: (party: "creator" | "counterparty", confirmed: boolean) => Promise<void>;
}) {
  const STEPS = [
    { label: "Pending",  sub: "Awaiting activation" },
    { label: "Active",   sub: "Funds in escrow" },
    { label: "Released", sub: "Payment complete" },
  ];

  const [copied, setCopied] = useState(false);

  function copyShareLink() {
    if (!shareToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/share/${shareToken}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const stepIndex = status === "released" ? 2 : status === "active" ? 1 : 0;
  const isDisputed = status === "disputed";
  const bothConfirmed = creatorConfirmed && counterpartyConfirmed;

  const awaitingLabel = !creatorConfirmed && !counterpartyConfirmed
    ? "Awaiting both confirmations"
    : !creatorConfirmed
    ? "Awaiting your confirmation"
    : `Awaiting ${counterparty}'s confirmation`;

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      {/* Pipeline */}
      <div className="mb-5 flex items-start justify-center">
        {STEPS.map((step, i) => {
          const isPast = i < stepIndex;
          const isCurrent = i === stepIndex && !isDisputed;
          return (
            <div key={step.label} className="flex items-start">
              <div className="flex flex-col items-center" style={{ minWidth: 88 }}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                  isPast || isCurrent ? "border-teal bg-teal/10" : "border-border"
                }`}>
                  {isPast ? (
                    <CheckCircle2 size={16} className="text-teal" />
                  ) : isCurrent ? (
                    <span className="h-2.5 w-2.5 rounded-full bg-teal" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-border" />
                  )}
                </div>
                <p className={`mt-1.5 text-center text-xs font-semibold ${
                  isPast || isCurrent ? "text-text-primary" : "text-text-muted"
                }`}>
                  {step.label}
                </p>
                <p className="mt-0.5 text-center text-[10px] leading-tight text-text-muted">{step.sub}</p>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex items-center" style={{ width: 36, marginTop: 17 }}>
                  <div className={`h-px w-full ${isPast ? "bg-teal" : "bg-border"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dispute banner */}
      {isDisputed && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-4 py-2.5">
          <AlertTriangle size={14} className="shrink-0 text-danger" />
          <p className="text-sm font-semibold text-danger">Dispute active — contract paused pending resolution</p>
        </div>
      )}

      {/* ── Pending: two-party confirmation ── */}
      {status === "pending" && (
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-surface-raised px-4 py-1">
            <p className="mb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Both parties must confirm before activation
            </p>
            <ConfirmCheckbox
              checked={creatorConfirmed}
              label="You have reviewed and agreed"
              sublabel="Confirm you accept the escrow terms and payment conditions"
              onChange={(v) => onConfirm("creator", v)}
            />
            <div className="border-t border-border" />
            {counterpartyConfirmed && shareToken ? (
              // Locked: confirmed via share link — don't allow manual override
              <div className="flex items-start gap-3 py-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 border-teal bg-teal">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-teal">{counterparty} has reviewed and agreed</p>
                  <p className="text-xs text-text-muted">Confirmed via share link — cannot be undone</p>
                </div>
              </div>
            ) : (
              <ConfirmCheckbox
                checked={counterpartyConfirmed}
                label={`${counterparty} has reviewed and agreed`}
                sublabel="Mark when the other party confirms in writing or by signing"
                onChange={(v) => onConfirm("counterparty", v)}
              />
            )}
          </div>

          {bothConfirmed ? (
            <button
              onClick={() => onUpdateStatus("active", `Both parties have confirmed. Activate escrow and hold ${counterparty}'s funds?`)}
              className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              <CheckCircle2 size={14} />
              Activate Escrow
            </button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/5 px-4 py-2.5">
              <Clock size={14} className="shrink-0 text-gold" />
              <span className="text-sm font-medium text-gold">{awaitingLabel}</span>
            </div>
          )}

          {shareToken && (
            <button
              onClick={copyShareLink}
              className="flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
            >
              {copied ? (
                <CheckCircle2 size={11} className="text-teal" />
              ) : (
                <Copy size={11} />
              )}
              {copied ? "Link copied!" : "Copy confirmation link for counterparty"}
            </button>
          )}
        </div>
      )}

      {/* ── Active ── */}
      {status === "active" && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onUpdateStatus("released", "Release all held funds? This confirms work is complete and payment is released. This cannot be undone.")}
            className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            <CheckCircle2 size={14} />
            Release All Funds
          </button>
          <button
            onClick={() => onUpdateStatus("disputed", "Mark this contract as disputed? All milestone activity will be paused.")}
            className="flex items-center gap-2 rounded-lg border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10"
          >
            <AlertTriangle size={14} />
            Raise Dispute
          </button>
        </div>
      )}

      {/* ── Disputed ── */}
      {status === "disputed" && (
        <button
          onClick={() => onUpdateStatus("active", "Resolve this dispute and return the contract to active status?")}
          className="flex items-center gap-2 rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          <CheckCircle2 size={14} />
          Resolve Dispute
        </button>
      )}

      {/* ── Released ── */}
      {status === "released" && (
        <div className="flex items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-4 py-2">
          <CheckCircle2 size={14} className="text-teal" />
          <span className="text-sm font-semibold text-teal">Payment released · Contract complete</span>
        </div>
      )}
    </div>
  );
}

function MilestoneRow({
  m, currency, onToggle, onDelete,
}: {
  m: Milestone; currency: string; onToggle: () => void; onDelete: () => void;
}) {
  const done = m.status === "completed";
  return (
    <li className="group flex items-start gap-3.5 px-5 py-4">
      <button
        onClick={onToggle}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all ${
          done ? "border-teal bg-teal" : "border-border hover:border-teal"
        }`}
        aria-label={done ? "Mark incomplete" : "Mark complete"}
      >
        {done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${done ? "text-text-muted line-through" : "text-text-primary"}`}>
          {m.title}
        </p>
        {m.description && (
          <p className="mt-0.5 text-xs leading-5 text-text-muted">{m.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {m.amount != null && m.amount > 0 && (
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums ${
              done ? "border-teal/30 bg-teal/10 text-teal" : "border-gold/30 bg-gold/10 text-gold"
            }`}>
              {fmt(m.amount, currency)}
            </span>
          )}
          {m.dueDate && (
            <span className="text-[10px] text-text-muted">Due {fmtDate(m.dueDate)}</span>
          )}
          {done && m.completedAt && (
            <span className="text-[10px] text-teal">Completed {fmtDate(m.completedAt)}</span>
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        className="mt-0.5 shrink-0 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:text-danger"
        aria-label="Remove milestone"
      >
        <Trash2 size={13} />
      </button>
    </li>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EscrowDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [escrow, setEscrow] = useState<EscrowWithMilestones | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [milestoneError, setMilestoneError] = useState("");
  const [addForm, setAddForm] = useState({ title: "", description: "", amount: "", dueDate: "" });

  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([]);
  const [showCOForm, setShowCOForm] = useState(false);
  const [coForm, setCoForm] = useState({ title: "", description: "", amountDelta: "" });
  const [coError, setCoError] = useState("");
  const [copiedCO, setCopiedCO] = useState<string | null>(null);
  const [events, setEvents] = useState<EscrowEvent[]>([]);

  const load = useCallback(async () => {
    const [escrowRes, coRes, eventsRes] = await Promise.all([
      fetch(`/api/escrow/${id}`),
      fetch(`/api/escrow/${id}/change-orders`),
      fetch(`/api/escrow/${id}/events`),
    ]);
    if (escrowRes.status === 404) { router.replace("/dashboard/escrow"); return; }
    if (escrowRes.ok) setEscrow((await escrowRes.json()) as EscrowWithMilestones);
    if (coRes.ok) setChangeOrders((await coRes.json()) as ChangeOrder[]);
    if (eventsRes.ok) setEvents((await eventsRes.json()) as EscrowEvent[]);
    setLoading(false);
  }, [id, router]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(status: EscrowStatus, msg: string) {
    if (!window.confirm(msg)) return;
    const res = await fetch(`/api/escrow/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      window.alert(data.error ?? "Could not update status.");
      return;
    }
    await load();
  }

  async function handleConfirm(party: "creator" | "counterparty", confirmed: boolean) {
    // Optimistic update
    setEscrow((prev) =>
      prev
        ? {
            ...prev,
            creatorConfirmed: party === "creator" ? confirmed : prev.creatorConfirmed,
            counterpartyConfirmed: party === "counterparty" ? confirmed : prev.counterpartyConfirmed,
          }
        : prev
    );
    await fetch(`/api/escrow/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: { party, confirmed } }),
    });
  }

  async function toggleMilestone(m: Milestone) {
    const next: MilestoneStatus = m.status === "completed" ? "pending" : "completed";
    setEscrow((prev) =>
      prev
        ? {
            ...prev,
            milestones: prev.milestones.map((ms) =>
              ms.id === m.id
                ? { ...ms, status: next, completedAt: next === "completed" ? new Date().toISOString() : null }
                : ms
            ),
          }
        : prev
    );
    await fetch(`/api/milestones/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
  }

  async function removeMilestone(milestoneId: string) {
    if (!window.confirm("Remove this milestone?")) return;
    setEscrow((prev) =>
      prev ? { ...prev, milestones: prev.milestones.filter((m) => m.id !== milestoneId) } : prev
    );
    await fetch(`/api/milestones/${milestoneId}`, { method: "DELETE" });
  }

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    setMilestoneError("");
    try {
      const res = await fetch(`/api/escrow/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addForm.title,
          description: addForm.description || undefined,
          amount: addForm.amount ? parseFloat(addForm.amount) : undefined,
          dueDate: addForm.dueDate || undefined,
          sortOrder: escrow?.milestones.length ?? 0,
        }),
      });
      const data = (await res.json()) as Milestone & { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Server error ${res.status}`);
      setEscrow((prev) => prev ? { ...prev, milestones: [...prev.milestones, data] } : prev);
      setAddForm({ title: "", description: "", amount: "", dueDate: "" });
      setShowAddForm(false);
    } catch (err) {
      setMilestoneError(err instanceof Error ? err.message : "Failed to add milestone.");
    }
  }

  async function importFromAnalysis() {
    setImporting(true);
    try {
      const res = await fetch(`/api/escrow/${id}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import" }),
      });
      if (res.ok) await load();
    } finally {
      setImporting(false);
    }
  }

  async function handleAddChangeOrder(e: React.FormEvent) {
    e.preventDefault();
    setCoError("");
    const delta = parseFloat(coForm.amountDelta);
    if (isNaN(delta)) { setCoError("Enter a valid amount."); return; }
    try {
      const res = await fetch(`/api/escrow/${id}/change-orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: coForm.title, description: coForm.description || undefined, amountDelta: delta }),
      });
      const data = (await res.json()) as ChangeOrder & { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setChangeOrders((prev) => [...prev, data]);
      setCoForm({ title: "", description: "", amountDelta: "" });
      setShowCOForm(false);
    } catch (err) {
      setCoError(err instanceof Error ? err.message : "Failed to create change order.");
    }
  }

  function copyCoLink(co: ChangeOrder) {
    if (!co.shareToken) return;
    navigator.clipboard.writeText(`${window.location.origin}/share/change-order/${co.shareToken}`);
    setCopiedCO(co.id);
    setTimeout(() => setCopiedCO(null), 2000);
  }

  if (loading) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-bg">
        <p className="text-sm text-text-muted">Loading…</p>
      </main>
    );
  }
  if (!escrow) return null;

  const milestones = escrow.milestones;
  const completedCount = milestones.filter((m) => m.status === "completed").length;
  const totalCount = milestones.length;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const hasDollarAmounts = milestones.some((m) => (m.amount ?? 0) > 0);
  const releasedAmount = milestones
    .filter((m) => m.status === "completed")
    .reduce((s, m) => s + (m.amount ?? 0), 0);
  const allocatedAmount = milestones.reduce((s, m) => s + (m.amount ?? 0), 0);

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      {/* Back nav */}
      <div className="border-b border-border bg-surface px-6 py-3">
        <Link
          href="/dashboard/escrow"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={12} />
          Escrow &amp; Milestones
        </Link>
      </div>

      <div className="space-y-5 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start gap-4 rounded-xl border border-border bg-surface p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
            <Lock size={18} className="text-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg font-bold text-text-primary">{escrow.title}</h1>
              <StatusBadge status={escrow.status} />
            </div>
            <p className="mt-0.5 text-sm text-text-muted">with {escrow.counterparty}</p>
            {escrow.notes && (
              <p className="mt-2 text-xs leading-5 text-text-muted">{escrow.notes}</p>
            )}
            {escrow.analysisId && (
              <Link
                href={`/dashboard?id=${escrow.analysisId}`}
                className="mt-2 inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-clause"
              >
                View linked contract analysis →
              </Link>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-2xl font-bold tabular-nums text-gold">
              {fmt(escrow.totalAmount, escrow.currency)}
            </p>
            <p className="text-xs text-text-muted">{escrow.currency} total</p>
            <Link
              href={`/dashboard/escrow/${id}/invoice`}
              className="mt-2 inline-flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-clause"
            >
              <FileText size={10} />
              Invoice
            </Link>
          </div>
        </div>

        {/* Status workflow (includes two-party confirmation when pending) */}
        <StatusWorkflow
          status={escrow.status}
          counterparty={escrow.counterparty}
          creatorConfirmed={escrow.creatorConfirmed}
          counterpartyConfirmed={escrow.counterpartyConfirmed}
          shareToken={escrow.shareToken}
          onUpdateStatus={updateStatus}
          onConfirm={handleConfirm}
        />

        {/* Progress summary */}
        {totalCount > 0 && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                {hasDollarAmounts ? "Payment progress" : "Milestone progress"}
              </h2>
              <span className="text-sm font-bold text-teal">{progressPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
              <div
                className="h-full rounded-full bg-teal transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="mt-3.5 flex flex-wrap gap-5">
              {hasDollarAmounts ? (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted">Released</p>
                    <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-teal">
                      {fmt(releasedAmount, escrow.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted">Remaining</p>
                    <p className="mt-0.5 font-mono text-sm font-bold tabular-nums text-text-primary">
                      {fmt(escrow.totalAmount - releasedAmount, escrow.currency)}
                    </p>
                  </div>
                  {allocatedAmount !== escrow.totalAmount && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-text-muted">Allocated</p>
                      <p className={`mt-0.5 font-mono text-sm font-bold tabular-nums ${
                        allocatedAmount > escrow.totalAmount ? "text-danger" : "text-amber"
                      }`}>
                        {fmt(allocatedAmount, escrow.currency)}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted">Complete</p>
                    <p className="mt-0.5 text-sm font-bold text-teal">
                      {completedCount} milestone{completedCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-text-muted">Remaining</p>
                    <p className="mt-0.5 text-sm font-bold text-text-primary">
                      {totalCount - completedCount} milestone{(totalCount - completedCount) !== 1 ? "s" : ""}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Import from analysis */}
        {escrow.analysisId && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/25 bg-gold/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <Workflow size={15} className="shrink-0 text-gold" />
              <div>
                <p className="text-sm font-semibold text-text-primary">Import deliverables from contract</p>
                <p className="text-xs text-text-muted">
                  Pull commitments from your analyzed agreement as milestones
                  {totalCount > 0 ? " — will add to existing" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={importFromAnalysis}
              disabled={importing}
              className="shrink-0 rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
            >
              {importing ? "Importing…" : "Import deliverables"}
            </button>
          </div>
        )}

        {/* Milestones card */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-text-primary">Milestones</h2>
              <p className="mt-0.5 text-xs text-text-muted">
                {totalCount === 0
                  ? "No milestones yet — add deliverables below"
                  : `${completedCount} of ${totalCount} complete`}
              </p>
            </div>
          </div>

          {milestones.length > 0 && (
            <ul className="divide-y divide-border">
              {milestones.map((m) => (
                <MilestoneRow
                  key={m.id}
                  m={m}
                  currency={escrow.currency}
                  onToggle={() => toggleMilestone(m)}
                  onDelete={() => removeMilestone(m.id)}
                />
              ))}
            </ul>
          )}

          {/* Add milestone */}
          <div className="border-t border-border p-5">
            {showAddForm ? (
              <form onSubmit={handleAddMilestone} className="space-y-3 animate-slide-up">
                {milestoneError && (
                  <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
                    <AlertCircle size={12} className="shrink-0 text-danger" />
                    <span className="text-xs text-danger">{milestoneError}</span>
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <input
                      required
                      autoFocus
                      value={addForm.title}
                      onChange={(e) => setAddForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Milestone title *"
                      className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <textarea
                      rows={2}
                      value={addForm.description}
                      onChange={(e) => setAddForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Acceptance criteria or description (optional)"
                      className="w-full resize-none rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={addForm.amount}
                      onChange={(e) => setAddForm((f) => ({ ...f, amount: e.target.value }))}
                      placeholder={`Amount to release (${escrow.currency}, optional)`}
                      className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={addForm.dueDate}
                      onChange={(e) => setAddForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                  >
                    Add Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddForm(false); setMilestoneError(""); setAddForm({ title: "", description: "", amount: "", dueDate: "" }); }}
                    className="text-sm text-text-muted transition-colors hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-teal"
              >
                <Plus size={14} className="rounded border border-border" />
                Add milestone
              </button>
            )}
          </div>
        </div>
        {/* Change Orders */}
        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-text-primary">Change Orders</h2>
              <p className="mt-0.5 text-xs text-text-muted">
                {changeOrders.length === 0
                  ? "No change orders yet"
                  : `${changeOrders.filter((c) => c.status === "accepted").length} of ${changeOrders.length} accepted`}
              </p>
            </div>
          </div>

          {changeOrders.length > 0 && (
            <ul className="divide-y divide-border">
              {changeOrders.map((co) => {
                const statusMap: Record<ChangeOrderStatus, string> = {
                  proposed: "border-gold/30 bg-gold/10 text-gold",
                  accepted: "border-teal/30 bg-teal/10 text-teal",
                  rejected: "border-danger/30 bg-danger/10 text-danger",
                };
                const isPos = co.amountDelta >= 0;
                return (
                  <li key={co.id} className="flex items-start gap-3 px-5 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-text-primary">{co.title}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusMap[co.status]}`}>
                          {co.status}
                        </span>
                      </div>
                      {co.description && (
                        <p className="mt-0.5 text-xs text-text-muted">{co.description}</p>
                      )}
                      <p className={`mt-1 font-mono text-sm font-bold tabular-nums ${isPos ? "text-clause" : "text-teal"}`}>
                        {isPos ? "+" : "-"}{fmt(Math.abs(co.amountDelta), escrow.currency)}
                      </p>
                    </div>
                    {co.status === "proposed" && co.shareToken && (
                      <button
                        onClick={() => copyCoLink(co)}
                        className="flex shrink-0 items-center gap-1 text-xs text-text-muted transition-colors hover:text-text-primary"
                        title="Copy approval link"
                      >
                        {copiedCO === co.id ? (
                          <CheckCircle2 size={11} className="text-teal" />
                        ) : (
                          <Copy size={11} />
                        )}
                        {copiedCO === co.id ? "Copied!" : "Copy link"}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="border-t border-border p-5">
            {showCOForm ? (
              <form onSubmit={handleAddChangeOrder} className="space-y-3 animate-slide-up">
                {coError && (
                  <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
                    <AlertCircle size={12} className="shrink-0 text-danger" />
                    <span className="text-xs text-danger">{coError}</span>
                  </div>
                )}
                <input
                  required
                  autoFocus
                  value={coForm.title}
                  onChange={(e) => setCoForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Change order title *"
                  className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                />
                <textarea
                  rows={2}
                  value={coForm.description}
                  onChange={(e) => setCoForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="w-full resize-none rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                />
                <input
                  required
                  type="number"
                  step="0.01"
                  value={coForm.amountDelta}
                  onChange={(e) => setCoForm((f) => ({ ...f, amountDelta: e.target.value }))}
                  placeholder={`Amount change (${escrow.currency}) — use negative for reductions`}
                  className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                  >
                    Propose Change
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCOForm(false); setCoError(""); setCoForm({ title: "", description: "", amountDelta: "" }); }}
                    className="text-sm text-text-muted transition-colors hover:text-text-primary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowCOForm(true)}
                className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-teal"
              >
                <Plus size={14} className="rounded border border-border" />
                Propose change order
              </button>
            )}
          </div>
        </div>

        {/* Activity log */}
        {events.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-bold text-text-primary">Activity log</h2>
            </div>
            <ul className="divide-y divide-border">
              {events.map((ev) => (
                <li key={ev.id} className="flex items-start gap-3 px-5 py-3">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-clause" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary">{ev.eventType.replace(/_/g, " ")}</p>
                    {Object.keys(ev.metadata).length > 0 && (
                      <p className="mt-0.5 text-xs text-text-muted">
                        {Object.entries(ev.metadata).map(([k, v]) => `${k}: ${v}`).join(" · ")}
                      </p>
                    )}
                  </div>
                  <time className="shrink-0 text-xs text-text-muted tabular-nums">
                    {new Date(ev.createdAt).toLocaleString()}
                  </time>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
