"use client";

import { useState, useEffect, useCallback } from "react";
import { BarChart3 } from "lucide-react";
import type { AnalyticsData } from "../../../lib/db";

function fmtVal(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  active: "Active",
  released: "Released",
  disputed: "Disputed",
};

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-text-muted",
  active: "bg-clause",
  released: "bg-teal",
  disputed: "bg-danger",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/analytics");
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <main className="min-h-0 flex-1 overflow-auto bg-bg">
        <div className="p-6"><p className="text-sm text-text-muted">Loading…</p></div>
      </main>
    );
  }

  if (!data || data.overview.totalContracts === 0) {
    return (
      <main className="min-h-0 flex-1 overflow-auto bg-bg">
        <div className="space-y-5 p-6">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Business Analytics</h1>
            <p className="mt-0.5 text-sm text-text-muted">Revenue, contract performance, and client insights</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-clause/25 bg-clause/10">
              <BarChart3 size={18} className="text-clause" />
            </div>
            <p className="font-semibold text-text-primary">No data yet</p>
            <p className="mt-1 text-sm text-text-muted">Analytics will appear once you have escrow contracts.</p>
          </div>
        </div>
      </main>
    );
  }

  const { overview, byStatus, monthlyRevenue, topClients } = data;
  const maxMonthly = Math.max(...monthlyRevenue.map((m) => m.amount), 1);

  const tiles = [
    { label: "Total released", value: fmtVal(overview.totalReleased), sub: "all time" },
    { label: "Active escrow value", value: fmtVal(overview.activeValue), sub: "in progress" },
    { label: "Avg contract value", value: fmtVal(overview.avgContractValue), sub: "across all" },
    { label: "Total clients", value: String(overview.totalClients), sub: `${overview.totalContracts} contracts` },
  ];

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="space-y-5 p-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Business Analytics</h1>
          <p className="mt-0.5 text-sm text-text-muted">Revenue, contract performance, and client insights</p>
        </div>

        {/* KPI tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-xl border border-border bg-surface p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">{t.label}</p>
              <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-text-primary">{t.value}</p>
              <p className="mt-0.5 text-xs text-text-muted">{t.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Monthly revenue bar chart */}
          {monthlyRevenue.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-border bg-surface lg:col-span-2">
              <div className="border-b border-border px-5 py-3.5">
                <h2 className="text-sm font-bold text-text-primary">Monthly released revenue</h2>
              </div>
              <div className="p-5">
                <div className="flex h-40 items-end gap-2">
                  {monthlyRevenue.map((m) => {
                    const heightPct = (m.amount / maxMonthly) * 100;
                    return (
                      <div key={m.month} className="group flex flex-1 flex-col items-center gap-1">
                        <span className="hidden text-[9px] tabular-nums text-text-muted group-hover:block">
                          {fmtVal(m.amount)}
                        </span>
                        <div
                          className="w-full rounded-t-sm bg-teal/60 transition-all group-hover:bg-teal"
                          style={{ height: `${Math.max(heightPct, 2)}%` }}
                        />
                        <span className="text-[9px] text-text-muted">{m.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* By status */}
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-bold text-text-primary">Contracts by status</h2>
            </div>
            <ul className="divide-y divide-border">
              {byStatus.map((s) => (
                <li key={s.status} className="flex items-center gap-3 px-5 py-3">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_COLOR[s.status] ?? "bg-text-muted"}`} />
                  <span className="flex-1 text-sm text-text-primary">{STATUS_LABEL[s.status] ?? s.status}</span>
                  <span className="font-mono tabular-nums text-sm text-text-muted">{s.count}</span>
                  <span className="font-mono tabular-nums text-xs text-text-muted">{fmtVal(s.totalValue)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top clients */}
        {topClients.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-bold text-text-primary">Top clients by value</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-text-muted">Client</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-text-muted">Contracts</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-text-muted">Total</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-text-muted">Released</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {topClients.map((c) => (
                    <tr key={c.counterparty} className="transition-colors hover:bg-surface-raised">
                      <td className="px-5 py-4 font-medium text-text-primary">{c.counterparty}</td>
                      <td className="px-4 py-4 text-right font-mono tabular-nums text-text-muted">{c.contracts}</td>
                      <td className="px-4 py-4 text-right font-mono tabular-nums text-text-primary">{fmtVal(c.totalValue)}</td>
                      <td className="px-5 py-4 text-right font-mono tabular-nums text-teal">{fmtVal(c.releasedValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
