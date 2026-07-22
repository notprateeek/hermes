"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Plus, ChevronRight, ChevronDown, X, AlertCircle } from "lucide-react";
import type { EscrowSummary } from "../../../lib/db";
import type { AnalysisSummary } from "../../../lib/db";

const STATUS_UI = {
  pending:  { label: "Pending",  cls: "border-gold/30 bg-gold/10 text-gold" },
  active:   { label: "Active",   cls: "border-teal/30 bg-teal/10 text-teal" },
  released: { label: "Released", cls: "border-border bg-surface-raised text-text-muted" },
  disputed: { label: "Disputed", cls: "border-danger/30 bg-danger/5 text-danger" },
} as const;

const STATUS_LEFT_BORDER: Record<string, string> = {
  pending:  "#F59E0B",
  active:   "#3ECF8E",
  released: "#2A2E3A",
  disputed: "#EF4444",
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function EscrowPage() {
  const router = useRouter();
  const [escrows, setEscrows] = useState<EscrowSummary[]>([]);
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    title: "", counterparty: "", totalAmount: "", currency: "USD",
    analysisId: "", notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/escrow").then((r) => r.json()) as Promise<EscrowSummary[]>,
      fetch("/api/analyses").then((r) => r.json()) as Promise<AnalysisSummary[]>,
    ])
      .then(([e, a]) => {
        setEscrows(Array.isArray(e) ? e : []);
        setAnalyses(Array.isArray(a) ? a : []);
      })
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ title: "", counterparty: "", totalAmount: "", currency: "USD", analysisId: "", notes: "" });
    setFormError("");
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const res = await fetch("/api/escrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          counterparty: form.counterparty,
          totalAmount: parseFloat(form.totalAmount),
          currency: form.currency,
          analysisId: form.analysisId || undefined,
          notes: form.notes || undefined,
        }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed to create escrow");
      router.push(`/dashboard/escrow/${data.id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      {/* Page header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Escrow &amp; Milestones</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Hold funds at signing — release payment milestone by milestone
          </p>
        </div>
        <button
          onClick={() => { setShowForm((v) => !v); resetForm(); }}
          className="flex items-center gap-2 rounded-lg bg-clause px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? "Cancel" : "New Escrow"}
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Create form */}
        {showForm && (
          <div className="rounded-xl border border-border bg-surface p-6 animate-slide-up">
            <h3 className="mb-5 text-sm font-bold text-text-primary">New escrow contract</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              {formError && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
                  <AlertCircle size={13} className="shrink-0 text-danger" />
                  <span className="text-xs text-danger">{formError}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Contract title *
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Website Redesign 2026"
                    className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-clause focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Counterparty *
                  </label>
                  <input
                    required
                    value={form.counterparty}
                    onChange={(e) => setForm((f) => ({ ...f, counterparty: e.target.value }))}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-clause focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Total amount *
                  </label>
                  <div className="flex gap-2">
                    <input
                      required
                      type="number"
                      min="1"
                      step="0.01"
                      value={form.totalAmount}
                      onChange={(e) => setForm((f) => ({ ...f, totalAmount: e.target.value }))}
                      placeholder="5000"
                      className="min-w-0 flex-1 rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-clause focus:outline-none"
                    />
                    <div className="relative shrink-0">
                      <select
                        value={form.currency}
                        onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                        className="h-full appearance-none rounded-lg border border-border bg-surface-raised py-2 pl-3 pr-8 text-sm text-text-primary focus:border-clause focus:outline-none"
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>CAD</option>
                        <option>AUD</option>
                        <option>INR</option>
                      </select>
                      <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                    Link to analysis{" "}
                    <span className="font-normal normal-case tracking-normal text-text-muted">(optional)</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.analysisId}
                      onChange={(e) => setForm((f) => ({ ...f, analysisId: e.target.value }))}
                      className="w-full appearance-none rounded-lg border border-border bg-surface-raised py-2 pl-3 pr-8 text-sm text-text-primary focus:border-clause focus:outline-none"
                    >
                      <option value="">No analysis linked</option>
                      {analyses.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.agreementTitle || a.fileName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={11} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Notes{" "}
                  <span className="font-normal normal-case tracking-normal text-text-muted">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Payment terms, conditions, or any context for this contract…"
                  className="w-full resize-none rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-clause focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-clause px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? "Creating…" : (
                    <>Create Escrow Contract <ChevronRight size={13} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm text-text-muted">Loading contracts…</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && escrows.length === 0 && (
          <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-12 text-center dot-grid">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(245,158,11,0.06) 0%, transparent 70%)" }}
            />
            <div className="relative">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
                <Lock size={20} className="text-gold" />
              </div>
              <h3 className="text-base font-bold text-text-primary">No escrow contracts yet</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-text-muted">
                Create an escrow contract to hold payment, track deliverables, and release funds milestone by milestone — no chasing invoices.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="mx-auto mt-5 flex items-center gap-2 rounded-lg bg-clause px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Plus size={14} />
                Create your first escrow
              </button>
            </div>
          </div>
        )}

        {/* Cards grid */}
        {!loading && escrows.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {escrows.map((e) => {
              const ui = STATUS_UI[e.status as keyof typeof STATUS_UI] ?? STATUS_UI.pending;
              const hasMilestones = e.milestoneCount > 0;
              const pct = hasMilestones ? Math.round((e.completedCount / e.milestoneCount) * 100) : 0;
              const leftColor = STATUS_LEFT_BORDER[e.status] ?? STATUS_LEFT_BORDER.pending;

              return (
                <Link
                  key={e.id}
                  href={`/dashboard/escrow/${e.id}`}
                  className="group flex flex-col gap-3.5 overflow-hidden rounded-xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  style={{ borderLeft: `3px solid ${leftColor}` }}
                >
                  {/* Title row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-text-primary transition-colors group-hover:text-clause">
                        {e.title}
                      </p>
                      <p className="mt-0.5 text-xs text-text-muted">with {e.counterparty}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${ui.cls}`}>
                      {ui.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <p className="font-mono text-xl font-bold tabular-nums text-gold">
                    {fmt(e.totalAmount, e.currency)}
                    <span className="ml-1.5 text-xs font-normal text-text-muted">{e.currency}</span>
                  </p>

                  {/* Milestone progress */}
                  {hasMilestones ? (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-text-muted">
                          {e.completedCount}/{e.milestoneCount} milestones
                        </span>
                        <span className="font-semibold text-teal">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                        <div
                          className="h-full rounded-full bg-teal transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-text-muted">No milestones yet</p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <span className="text-[11px] text-text-muted">{fmtDate(e.createdAt)}</span>
                    <ChevronRight size={13} className="text-text-muted transition-colors group-hover:text-clause" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
