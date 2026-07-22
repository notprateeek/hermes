"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import type { ShareChangeOrder } from "../../../../lib/db";

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}

export default function ChangeOrderSharePage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<ShareChangeOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    fetch(`/api/share/change-order/${token}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return; }
        setData((await r.json()) as ShareChangeOrder);
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function respond(response: "accepted" | "rejected") {
    setResponding(true);
    try {
      const r = await fetch(`/api/share/change-order/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      if (r.ok) {
        setData((prev) => prev ? { ...prev, status: response } : prev);
      }
    } finally {
      setResponding(false);
    }
  }

  const isPositive = (data?.amountDelta ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-clause">
            <span className="font-display text-[10px] italic text-white">H</span>
          </div>
          <span className="font-display text-sm italic text-text-primary">Hermes</span>
          <span className="ml-2 text-xs text-text-muted">· Change Order</span>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-6 py-10">
        {loading && <p className="text-sm text-text-muted">Loading…</p>}

        {notFound && (
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-8 text-center">
            <AlertTriangle size={24} className="mx-auto mb-3 text-danger" />
            <p className="font-semibold text-text-primary">Link invalid or expired</p>
            <p className="mt-2 text-sm text-text-muted">This change order link is no longer active.</p>
          </div>
        )}

        {data && !notFound && (
          <div className="space-y-4">
            {/* Project context */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Project</p>
              <p className="mt-1 text-base font-bold text-text-primary">{data.escrowTitle}</p>
              <p className="mt-0.5 text-sm text-text-muted">with {data.escrowCounterparty}</p>
              <p className="mt-2 font-mono text-sm tabular-nums text-text-muted">
                Original contract: {fmt(data.escrowTotal, data.currency)}
              </p>
            </div>

            {/* Change order details */}
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Change Order</p>
              <h1 className="mt-1 text-base font-bold text-text-primary">{data.title}</h1>
              {data.description && (
                <p className="mt-2 text-sm leading-6 text-text-muted">{data.description}</p>
              )}
              <div className={`mt-4 flex items-center gap-2 rounded-lg border px-4 py-3 ${
                isPositive
                  ? "border-clause/30 bg-clause/5"
                  : "border-teal/30 bg-teal/5"
              }`}>
                {isPositive
                  ? <TrendingUp size={18} className="shrink-0 text-clause" />
                  : <TrendingDown size={18} className="shrink-0 text-teal" />
                }
                <div>
                  <p className={`font-mono text-xl font-bold tabular-nums ${isPositive ? "text-clause" : "text-teal"}`}>
                    {isPositive ? "+" : "-"}{fmt(data.amountDelta, data.currency)}
                  </p>
                  <p className="text-xs text-text-muted">
                    {isPositive ? "Additional payment requested" : "Reduction to contract value"}
                  </p>
                </div>
              </div>
            </div>

            {/* Response area */}
            {data.status === "proposed" ? (
              <div className="rounded-xl border border-border bg-surface p-5">
                <p className="mb-1 text-sm font-semibold text-text-primary">Your response</p>
                <p className="mb-4 text-sm leading-6 text-text-muted">
                  Review the change order above and accept or decline.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => respond("accepted")}
                    disabled={responding}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal py-3 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <CheckCircle2 size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => respond("rejected")}
                    disabled={responding}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-danger/40 bg-danger/10 py-3 font-semibold text-danger transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    Decline
                  </button>
                </div>
              </div>
            ) : data.status === "accepted" ? (
              <div className="flex items-center gap-3 rounded-xl border border-teal/30 bg-teal/5 p-5">
                <CheckCircle2 size={18} className="shrink-0 text-teal" />
                <div>
                  <p className="font-semibold text-teal">Change order accepted</p>
                  <p className="mt-0.5 text-sm text-text-muted">This change has been approved and the contract value updated.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-danger/30 bg-danger/5 p-5">
                <XCircle size={18} className="shrink-0 text-danger" />
                <div>
                  <p className="font-semibold text-danger">Change order declined</p>
                  <p className="mt-0.5 text-sm text-text-muted">This change request was not accepted.</p>
                </div>
              </div>
            )}

            <p className="text-center text-xs text-text-muted">
              Shared via Hermes · AI contract platform · Not legal advice
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
