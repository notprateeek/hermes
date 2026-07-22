"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Archive, Search } from "lucide-react";
import type { AnalysisSummary } from "../../../lib/db";

const verdictLabels: Record<string, string> = {
  safe_to_sign: "Safe to sign",
  negotiate_first: "Negotiate first",
  do_not_sign_without_counsel: "Do not sign",
};

const verdictClasses: Record<string, string> = {
  safe_to_sign: "border-teal/30 bg-teal/10 text-teal",
  negotiate_first: "border-amber/30 bg-amber/10 text-amber",
  do_not_sign_without_counsel: "border-danger/30 bg-danger/5 text-danger",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function VaultPage() {
  const [analyses, setAnalyses] = useState<AnalysisSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/analyses");
    if (res.ok) setAnalyses((await res.json()) as AnalysisSummary[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = query.trim()
    ? analyses.filter((a) =>
        (a.agreementTitle ?? "").toLowerCase().includes(query.toLowerCase()) ||
        a.fileName.toLowerCase().includes(query.toLowerCase())
      )
    : analyses;

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="border-b border-border bg-surface px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-text-primary">Contract Vault</h2>
            <p className="mt-0.5 text-xs text-text-muted">
              {loading ? "Loading…" : `${analyses.length} agreement${analyses.length !== 1 ? "s" : ""} analyzed`}
            </p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contracts…"
              className="rounded-lg border border-border bg-surface-raised py-1.5 pl-8 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-teal focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-5">
        {!loading && analyses.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-gold/10">
              <Archive size={18} className="text-gold" />
            </div>
            <p className="font-semibold text-text-primary">Contract Vault is empty</p>
            <p className="mt-1 text-sm text-text-muted">Run your first signing preflight to see results here.</p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block rounded-lg bg-clause px-4 py-2 text-sm font-semibold text-white hover:bg-clause/90"
            >
              Start analysis
            </Link>
          </div>
        ) : filtered.length === 0 && query ? (
          <p className="text-sm text-text-muted">No contracts match &ldquo;{query}&rdquo;</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((a) => (
              <Link
                key={a.id}
                href={`/dashboard?id=${a.id}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3.5 transition-colors hover:border-teal/30 hover:bg-surface-raised"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-text-primary">
                    {a.agreementTitle || a.fileName}
                  </p>
                  {a.agreementTitle && a.fileName !== a.agreementTitle && (
                    <p className="mt-0.5 truncate text-xs text-text-muted">{a.fileName}</p>
                  )}
                </div>
                {a.verdict && (
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${verdictClasses[a.verdict] ?? "border-border text-text-muted"}`}>
                    {verdictLabels[a.verdict] ?? a.verdict}
                  </span>
                )}
                {a.highRisks > 0 && (
                  <span className="shrink-0 rounded-full border border-danger/30 bg-danger/5 px-2 py-0.5 font-mono text-[10px] font-bold text-danger">
                    {a.highRisks} risk{a.highRisks !== 1 ? "s" : ""}
                  </span>
                )}
                <span className="shrink-0 text-xs text-text-muted">{formatDate(a.createdAt)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
