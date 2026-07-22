"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CalendarClock, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import type { DeadlineItem } from "../../../lib/db";

function fmtAmt(amount: number | null, currency: string) {
  if (amount == null) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function urgencyBadge(days: number) {
  if (days < 0)
    return <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-semibold text-danger">{Math.abs(days)}d overdue</span>;
  if (days === 0)
    return <span className="rounded-full bg-danger/15 px-2 py-0.5 text-[10px] font-semibold text-danger">Due today</span>;
  if (days <= 7)
    return <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold text-gold">{days}d left</span>;
  return <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-semibold text-text-muted">{days}d left</span>;
}

function DeadlineRow({ item, onComplete }: { item: DeadlineItem; onComplete: (id: string) => void }) {
  const [completing, setCompleting] = useState(false);

  async function complete() {
    setCompleting(true);
    await fetch(`/api/milestones/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    onComplete(item.id);
  }

  const amt = fmtAmt(item.amount, item.currency);

  return (
    <li className="flex items-start gap-4 px-5 py-4">
      <div className="mt-0.5 shrink-0 text-text-muted">
        {item.daysUntilDue < 0 ? (
          <AlertTriangle size={14} className="text-danger" />
        ) : item.daysUntilDue <= 7 ? (
          <Clock size={14} className="text-gold" />
        ) : (
          <CalendarClock size={14} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-text-primary">{item.title}</p>
          {urgencyBadge(item.daysUntilDue)}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-text-muted">
          <Link href={`/dashboard/escrow/${item.escrowId}`} className="hover:text-clause hover:underline">
            {item.escrowTitle}
          </Link>
          <span>·</span>
          <span>{item.counterparty}</span>
          {amt && <><span>·</span><span className="font-mono tabular-nums">{amt}</span></>}
        </div>
      </div>
      <button
        onClick={complete}
        disabled={completing}
        title="Mark complete"
        className="mt-0.5 shrink-0 rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold text-text-muted transition-colors hover:border-teal hover:text-teal disabled:opacity-50"
      >
        {completing ? "…" : <CheckCircle2 size={13} />}
      </button>
    </li>
  );
}

export default function DeadlinesPage() {
  const [items, setItems] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/deadlines");
    if (res.ok) setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleComplete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const overdue = items.filter((i) => i.daysUntilDue < 0);
  const soon = items.filter((i) => i.daysUntilDue >= 0 && i.daysUntilDue <= 7);
  const upcoming = items.filter((i) => i.daysUntilDue > 7);

  function Section({ label, list }: { label: string; list: DeadlineItem[] }) {
    if (!list.length) return null;
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">{label}</p>
        </div>
        <ul className="divide-y divide-border">
          {list.map((item) => (
            <DeadlineRow key={item.id} item={item} onComplete={handleComplete} />
          ))}
        </ul>
      </div>
    );
  }

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="space-y-5 p-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Deadline Intelligence</h1>
          <p className="mt-0.5 text-sm text-text-muted">Upcoming milestone due dates across all active contracts</p>
        </div>

        {loading && <p className="text-sm text-text-muted">Loading…</p>}

        {!loading && items.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-clause/25 bg-clause/10">
              <CalendarClock size={18} className="text-clause" />
            </div>
            <p className="font-semibold text-text-primary">No upcoming deadlines</p>
            <p className="mt-1 text-sm text-text-muted">
              Milestones with due dates on active contracts will appear here.
            </p>
          </div>
        )}

        <Section label="Overdue" list={overdue} />
        <Section label="Due within 7 days" list={soon} />
        <Section label="Upcoming" list={upcoming} />
      </div>
    </main>
  );
}
