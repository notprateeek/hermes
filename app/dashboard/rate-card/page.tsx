"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Tag, AlertCircle } from "lucide-react";
import type { RateCardItem } from "../../../lib/types";

const DEFAULT_ITEMS = [
  { category: "Development", label: "Frontend (per hour)", value: "$120/hr", notes: "React, TypeScript" },
  { category: "Development", label: "Backend (per hour)", value: "$130/hr", notes: "Node.js, APIs" },
  { category: "Design", label: "UI/UX Design (per hour)", value: "$100/hr", notes: null },
  { category: "Design", label: "Brand Identity", value: "$2,500 flat", notes: "Logo, palette, type" },
  { category: "Consulting", label: "Strategy Call (per hour)", value: "$200/hr", notes: null },
  { category: "Consulting", label: "Technical Audit", value: "$800 flat", notes: "Up to 5 days" },
];

function grouped(items: RateCardItem[]) {
  return items.reduce<Record<string, RateCardItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});
}

export default function RateCardPage() {
  const [items, setItems] = useState<RateCardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "", label: "", value: "", notes: "" });
  const [error, setError] = useState("");
  const [loadingDefaults, setLoadingDefaults] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/rate-card");
    if (res.ok) setItems((await res.json()) as RateCardItem[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/rate-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sortOrder: items.length }),
      });
      const data = (await res.json()) as RateCardItem & { error?: string };
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      setItems((prev) => [...prev, data]);
      setForm({ category: "", label: "", value: "", notes: "" });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add item.");
    }
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/rate-card/${id}`, { method: "DELETE" });
  }

  async function loadDefaults() {
    setLoadingDefaults(true);
    try {
      const added: RateCardItem[] = [];
      for (const d of DEFAULT_ITEMS) {
        const res = await fetch("/api/rate-card", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...d, sortOrder: items.length + added.length }),
        });
        if (res.ok) added.push((await res.json()) as RateCardItem);
      }
      setItems((prev) => [...prev, ...added]);
    } finally {
      setLoadingDefaults(false);
    }
  }

  const groups = grouped(items);

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="space-y-5 p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Rate Card</h1>
            <p className="mt-0.5 text-sm text-text-muted">
              Your standard services and pricing — reference when building contracts
            </p>
          </div>
          <div className="flex items-center gap-3">
            {items.length === 0 && !loading && (
              <button
                onClick={loadDefaults}
                disabled={loadingDefaults}
                className="rounded-lg border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
              >
                {loadingDefaults ? "Loading…" : "Load defaults"}
              </button>
            )}
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90"
            >
              <Plus size={13} />
              Add item
            </button>
          </div>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="rounded-xl border border-border bg-surface p-5">
            <form onSubmit={handleAdd} className="space-y-3">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2">
                  <AlertCircle size={12} className="shrink-0 text-danger" />
                  <span className="text-xs text-danger">{error}</span>
                </div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  required
                  autoFocus
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  placeholder="Category (e.g. Development) *"
                  className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                />
                <input
                  required
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="Label (e.g. Frontend per hour) *"
                  className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                />
                <input
                  required
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder="Rate / price (e.g. $120/hr or $2,500 flat) *"
                  className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                />
                <input
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="Notes (optional)"
                  className="rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(""); }}
                  className="text-sm text-text-muted transition-colors hover:text-text-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && <p className="text-sm text-text-muted">Loading…</p>}

        {!loading && items.length === 0 && !showForm && (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
              <Tag size={18} className="text-gold" />
            </div>
            <p className="font-semibold text-text-primary">No rate card items yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Add your services and pricing, or load defaults to get started.
            </p>
          </div>
        )}

        {/* Items grouped by category */}
        {Object.entries(groups).map(([category, categoryItems]) => (
          <div key={category} className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-bold text-text-primary">{category}</h2>
            </div>
            <ul className="divide-y divide-border">
              {categoryItems.map((item) => (
                <li key={item.id} className="group flex items-start gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary">{item.label}</p>
                    {item.notes && (
                      <p className="mt-0.5 text-xs text-text-muted">{item.notes}</p>
                    )}
                  </div>
                  <span className="shrink-0 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-gold">
                    {item.value}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-0.5 shrink-0 text-text-muted opacity-0 transition-all group-hover:opacity-100 hover:text-danger"
                    aria-label="Remove item"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
