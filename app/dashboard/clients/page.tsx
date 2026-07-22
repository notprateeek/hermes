"use client";

import { useState, useEffect, useCallback } from "react";
import { Users } from "lucide-react";
import type { ClientSummary } from "../../../lib/db";

function fmtVal(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n.toFixed(0)}`;
}

const HEALTH: Record<ClientSummary["health"], { label: string; dot: string; text: string }> = {
  green:   { label: "Healthy",  dot: "bg-teal",   text: "text-teal" },
  amber:   { label: "Attention", dot: "bg-gold",   text: "text-gold" },
  red:     { label: "Disputed", dot: "bg-danger",  text: "text-danger" },
  neutral: { label: "New",      dot: "bg-text-muted", text: "text-text-muted" },
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/clients");
    if (res.ok) setClients(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="space-y-5 p-6">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Client Intelligence</h1>
          <p className="mt-0.5 text-sm text-text-muted">Aggregated health and history for every counterparty</p>
        </div>

        {loading && <p className="text-sm text-text-muted">Loading…</p>}

        {!loading && clients.length === 0 && (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-clause/25 bg-clause/10">
              <Users size={18} className="text-clause" />
            </div>
            <p className="font-semibold text-text-primary">No clients yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Once you create escrow contracts, counterparties will appear here.
            </p>
          </div>
        )}

        {clients.length > 0 && (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-text-muted">Client</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-text-muted">Health</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-text-muted">Contracts</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-text-muted">Total value</th>
                    <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-text-muted">Released</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest text-text-muted">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {clients.map((c) => {
                    const h = HEALTH[c.health];
                    const pct = c.totalValue > 0 ? Math.round((c.releasedValue / c.totalValue) * 100) : 0;
                    return (
                      <tr key={c.counterparty} className="transition-colors hover:bg-surface-raised">
                        <td className="px-5 py-4">
                          <p className="font-medium text-text-primary">{c.counterparty}</p>
                          {c.disputedContracts > 0 && (
                            <p className="mt-0.5 text-xs text-danger">{c.disputedContracts} disputed</p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`flex items-center gap-1.5 text-xs font-medium ${h.text}`}>
                            <span className={`h-2 w-2 rounded-full ${h.dot}`} />
                            {h.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-text-primary">{c.totalContracts}</td>
                        <td className="px-4 py-4 text-right font-mono tabular-nums text-text-primary">{fmtVal(c.totalValue)}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="font-mono tabular-nums text-teal">{fmtVal(c.releasedValue)}</span>
                          <span className="ml-1 text-[10px] text-text-muted">{pct}%</span>
                        </td>
                        <td className="px-5 py-4 text-right font-mono tabular-nums text-text-muted">{c.activeContracts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Legend */}
        {clients.length > 0 && (
          <div className="flex flex-wrap gap-4 text-xs text-text-muted">
            {Object.entries(HEALTH).map(([key, val]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${val.dot}`} />
                {val.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
