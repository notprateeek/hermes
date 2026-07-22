"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Lock, CheckCircle2, AlertTriangle, Clock, Circle } from "lucide-react";
import type { ShareEscrow } from "../../../lib/db";

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso.includes("T") ? iso : iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SharePage() {
  const params = useParams();
  const token = params.token as string;

  const [escrow, setEscrow] = useState<ShareEscrow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return; }
        const data = (await r.json()) as ShareEscrow;
        setEscrow(data);
        setConfirmed(data.counterpartyConfirmed);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function handleConfirm() {
    setConfirming(true);
    try {
      await fetch(`/api/share/${token}`, { method: "POST" });
      setConfirmed(true);
      setEscrow((prev) => prev ? { ...prev, counterpartyConfirmed: true } : prev);
    } finally {
      setConfirming(false);
    }
  }

  const completedCount = escrow?.milestones.filter((m) => m.status === "completed").length ?? 0;
  const totalCount = escrow?.milestones.length ?? 0;
  const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
  const releasedAmount = (escrow?.milestones ?? [])
    .filter((m) => m.status === "completed")
    .reduce((s, m) => s + (m.amount ?? 0), 0);
  const hasDollarAmounts = (escrow?.milestones ?? []).some((m) => (m.amount ?? 0) > 0);

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-clause">
            <span className="font-display text-[10px] italic text-white">H</span>
          </div>
          <span className="font-display text-sm italic text-text-primary">Hermes</span>
          <span className="ml-2 text-xs text-text-muted">· Project Portal</span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 py-10">
        {loading && <p className="text-sm text-text-muted">Loading…</p>}

        {notFound && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
            <AlertTriangle size={24} className="mx-auto mb-3 text-danger" />
            <p className="font-semibold text-text-primary">Link invalid or expired</p>
            <p className="mt-2 text-sm text-text-muted">
              This project portal link is no longer active.
            </p>
          </div>
        )}

        {escrow && !notFound && (
          <div className="space-y-4">
            {/* Contract header */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
                  <Lock size={16} className="text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-bold text-text-primary">{escrow.title}</h1>
                  <p className="mt-0.5 text-sm text-text-muted">with {escrow.counterparty}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-xl font-bold tabular-nums text-gold">
                    {fmt(escrow.totalAmount, escrow.currency)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {escrow.status === "released" ? "Released" : escrow.status === "active" ? "In escrow" : "Pending"}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress (shown when active or released with milestones) */}
            {totalCount > 0 && (escrow.status === "active" || escrow.status === "released") && (
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
                {hasDollarAmounts && (
                  <div className="mt-3 flex gap-5">
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
                  </div>
                )}
              </div>
            )}

            {/* Milestone list */}
            {totalCount > 0 && (
              <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-3.5">
                  <h2 className="text-sm font-bold text-text-primary">Milestones</h2>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {completedCount} of {totalCount} complete
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {escrow.milestones.map((m, i) => {
                    const done = m.status === "completed";
                    return (
                      <li key={i} className="flex items-start gap-3 px-5 py-4">
                        {done ? (
                          <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal" />
                        ) : (
                          <Circle size={16} className="mt-0.5 shrink-0 text-border" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-medium ${done ? "text-text-muted line-through" : "text-text-primary"}`}>
                            {m.title}
                          </p>
                          {done && m.completedAt && (
                            <p className="mt-0.5 text-xs text-teal">
                              Completed {fmtDate(m.completedAt)}
                            </p>
                          )}
                        </div>
                        {m.amount != null && m.amount > 0 && (
                          <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px] tabular-nums ${
                            done ? "border-teal/30 bg-teal/10 text-teal" : "border-gold/30 bg-gold/10 text-gold"
                          }`}>
                            {fmt(m.amount, escrow.currency)}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Confirmation / status */}
            {escrow.status === "pending" ? (
              confirmed ? (
                <div className="flex items-center gap-3 rounded-xl border border-teal/30 bg-teal/5 p-5">
                  <CheckCircle2 size={18} className="shrink-0 text-teal" />
                  <div>
                    <p className="font-semibold text-teal">Agreement confirmed</p>
                    <p className="mt-0.5 text-sm text-text-muted">
                      You&apos;ve confirmed this escrow agreement. The creator has been notified.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-surface p-5">
                  <p className="mb-2 text-sm font-semibold text-text-primary">
                    Awaiting your confirmation
                  </p>
                  <p className="mb-4 text-sm leading-6 text-text-muted">
                    By confirming, you agree to the payment terms and deliverables above.
                    Funds will be held in escrow and released as milestones are completed.
                  </p>
                  <button
                    onClick={handleConfirm}
                    disabled={confirming}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    {confirming ? "Confirming…" : "Confirm these escrow terms"}
                  </button>
                </div>
              )
            ) : escrow.status === "active" ? (
              <div className="flex items-center gap-3 rounded-xl border border-teal/30 bg-teal/5 px-5 py-4">
                <Clock size={16} className="shrink-0 text-teal" />
                <p className="text-sm font-medium text-teal">
                  Escrow active — payment held until milestones complete
                </p>
              </div>
            ) : escrow.status === "released" ? (
              <div className="flex items-center gap-3 rounded-xl border border-teal/30 bg-teal/5 px-5 py-4">
                <CheckCircle2 size={16} className="shrink-0 text-teal" />
                <p className="text-sm font-semibold text-teal">
                  Payment released · Project complete
                </p>
              </div>
            ) : null}

            <p className="text-center text-xs text-text-muted">
              Shared via Hermes · AI contract platform · Not legal advice
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
