"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import type { EscrowWithMilestones } from "../../../../../lib/types";

function fmt(n: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(n);
}

export default function InvoicePage() {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();
  const [escrow, setEscrow] = useState<EscrowWithMilestones | null>(null);

  useEffect(() => {
    fetch(`/api/escrow/${id}`).then((r) => r.json()).then((d) => setEscrow(d as EscrowWithMilestones));
  }, [id]);

  if (!escrow) {
    return (
      <main className="flex flex-1 items-center justify-center bg-bg">
        <p className="text-sm text-text-muted">Loading…</p>
      </main>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
  const invoiceNum = `INV-${id.slice(0, 8).toUpperCase()}`;
  const userName =
    user
      ? ([user.firstName, user.lastName].filter(Boolean).join(" ") || user.emailAddresses[0]?.emailAddress) ?? ""
      : "";
  const userEmail = user?.emailAddresses[0]?.emailAddress ?? "";

  const delivered = escrow.milestones.filter((m) => m.status === "completed");
  const deliveredAmount = delivered.reduce((s, m) => s + (m.amount ?? 0), 0);
  const hasMilestoneAmounts = escrow.milestones.some((m) => (m.amount ?? 0) > 0);

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      {/* Toolbar — hidden in print */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3 print:hidden">
        <Link
          href={`/dashboard/escrow/${id}`}
          className="flex items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={12} />
          Back to escrow
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-lg bg-clause px-3 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Printer size={14} />
          Print / Save PDF
        </button>
      </div>

      {/* Invoice document — white card, always light, prints cleanly */}
      <div className="mx-auto max-w-2xl px-6 py-10 print:max-w-none print:px-0 print:py-0">
        <div className="rounded-xl border border-gray-200 bg-white p-10 shadow-sm print:rounded-none print:border-0 print:shadow-none">

          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-gray-200 pb-8">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FF4F1F]">
                  <span className="font-display text-xs italic text-white">H</span>
                </div>
                <span className="font-display text-sm italic text-gray-800">Hermes</span>
              </div>
              <p className="mt-5 text-3xl font-bold tracking-tight text-gray-900">INVOICE</p>
              <p className="mt-1 text-sm text-gray-500">{invoiceNum}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">{today}</p>
              <p className="mt-0.5 text-xs text-gray-400">Issue date</p>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-8 border-b border-gray-200 py-8">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">From</p>
              <p className="text-sm font-semibold text-gray-900">{userName || "Freelancer"}</p>
              {userEmail && <p className="mt-0.5 text-xs text-gray-500">{userEmail}</p>}
            </div>
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Bill to</p>
              <p className="text-sm font-semibold text-gray-900">{escrow.counterparty}</p>
              <p className="mt-0.5 text-xs text-gray-500">Re: {escrow.title}</p>
            </div>
          </div>

          {/* Line items */}
          <div className="border-b border-gray-200 py-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Deliverable
                  </th>
                  <th className="pb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                  <th className="pb-3 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {escrow.milestones.length > 0 ? (
                  escrow.milestones.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50">
                      <td className="py-3 pr-6">
                        <p className="text-sm text-gray-900">{m.title}</p>
                        {m.description && (
                          <p className="mt-0.5 text-xs text-gray-500">{m.description}</p>
                        )}
                        {m.dueDate && (
                          <p className="mt-0.5 text-xs text-gray-400">Due {m.dueDate}</p>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`text-xs font-semibold ${
                            m.status === "completed" ? "text-emerald-600" : "text-gray-400"
                          }`}
                        >
                          {m.status === "completed" ? "✓ Delivered" : "Pending"}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-sm text-gray-900">
                        {m.amount != null && m.amount > 0 ? fmt(m.amount, escrow.currency) : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-sm text-gray-500">{escrow.title}</td>
                    <td className="py-6 text-center text-xs text-gray-400">Full project</td>
                    <td className="py-6 text-right font-mono text-sm text-gray-900">
                      {fmt(escrow.totalAmount, escrow.currency)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="pt-6">
            <div className="ml-auto max-w-xs space-y-2">
              {hasMilestoneAmounts && deliveredAmount > 0 && deliveredAmount < escrow.totalAmount && (
                <>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivered to date</span>
                    <span className="font-mono text-emerald-600">{fmt(deliveredAmount, escrow.currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Remaining</span>
                    <span className="font-mono">{fmt(escrow.totalAmount - deliveredAmount, escrow.currency)}</span>
                  </div>
                </>
              )}
              <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
                <span className="text-base font-bold text-gray-900">Total due</span>
                <span className="font-mono text-2xl font-bold text-gray-900">
                  {fmt(escrow.totalAmount, escrow.currency)}
                </span>
              </div>
              <p className="text-right text-[10px] text-gray-400">{escrow.currency}</p>
            </div>
          </div>

          {escrow.notes && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Notes</p>
              <p className="mt-2 text-sm leading-6 text-gray-600">{escrow.notes}</p>
            </div>
          )}

          <p className="mt-10 text-center text-[10px] text-gray-300">
            Generated by Hermes · AI-powered contract platform · Not legal advice
          </p>
        </div>
      </div>
    </main>
  );
}
