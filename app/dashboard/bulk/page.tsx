"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { AgreementAnalysis, AnalysisResponse, SigningVerdict } from "../../../lib/types";

type BulkItem = {
  id: string;
  file: File;
  status: "pending" | "analyzing" | "done" | "error";
  analysis: AgreementAnalysis | null;
  savedId: string | null;
  error: string;
};

const verdictLabels: Record<SigningVerdict, string> = {
  safe_to_sign: "Safe to sign",
  negotiate_first: "Negotiate first",
  do_not_sign_without_counsel: "Do not sign without counsel",
};
const verdictClasses: Record<SigningVerdict, string> = {
  safe_to_sign: "border-teal/30 bg-teal/10 text-teal",
  negotiate_first: "border-amber/30 bg-amber/10 text-amber",
  do_not_sign_without_counsel: "border-danger/30 bg-danger/5 text-danger",
};

const statusLabel: Record<BulkItem["status"], string> = {
  pending: "Pending",
  analyzing: "Analyzing…",
  done: "Done",
  error: "Error",
};

export default function BulkPage() {
  const [items, setItems] = useState<BulkItem[]>([]);
  const [running, setRunning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const allowed = Array.from(files).filter((f) => {
      const n = f.name.toLowerCase();
      return n.endsWith(".pdf") || n.endsWith(".docx") || n.endsWith(".txt");
    });
    setItems((prev) => [
      ...prev,
      ...allowed.map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        status: "pending" as const,
        analysis: null,
        savedId: null,
        error: "",
      })),
    ]);
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateItem(id: string, patch: Partial<BulkItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  async function runAll() {
    setRunning(true);
    const pending = items.filter((i) => i.status === "pending" || i.status === "error");
    for (const item of pending) {
      updateItem(item.id, { status: "analyzing", error: "" });
      try {
        const form = new FormData();
        form.append("file", item.file);
        const res = await fetch("/api/analyze", { method: "POST", body: form });
        const data = (await res.json()) as AnalysisResponse & { id?: string; error?: string };
        if (!res.ok || data.error) throw new Error(data.error || "Analysis failed.");
        updateItem(item.id, { status: "done", analysis: data.analysis, savedId: data.id ?? null });
      } catch (e) {
        updateItem(item.id, { status: "error", error: e instanceof Error ? e.message : "Failed." });
      }
    }
    setRunning(false);
  }

  const done = items.filter((i) => i.status === "done").length;
  const errors = items.filter((i) => i.status === "error").length;
  const hasPending = items.some((i) => i.status === "pending" || i.status === "error");

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="border-b border-border bg-surface px-5 py-4">
        <h2 className="text-base font-bold text-text-primary">Bulk upload</h2>
        <p className="mt-0.5 text-xs text-text-muted">Add up to 10 agreements — Hermes analyzes them sequentially</p>
      </div>

      <div className="p-5">
        {/* Drop zone */}
        <label
          htmlFor="bulk-input"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-clause"
        >
          <span className="text-sm font-medium text-text-primary">Click to add PDFs, DOCX, or TXT files</span>
          <span className="text-xs text-text-muted">Multiple files allowed · max 10</span>
        </label>
        <input
          id="bulk-input"
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,.pdf,.docx,text/plain,.txt"
          className="sr-only"
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />

        {items.length > 0 && (
          <>
            {/* Progress summary */}
            <div className="mt-4 flex items-center gap-3 text-xs text-text-muted">
              <span>{items.length} file{items.length !== 1 ? "s" : ""}</span>
              {done > 0 && <span className="text-teal">{done} done</span>}
              {errors > 0 && <span className="text-danger">{errors} failed</span>}
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setItems([])}
                  disabled={running}
                  className="rounded border border-border px-2 py-1 text-text-muted transition-colors hover:border-danger hover:text-danger disabled:opacity-40"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={() => void runAll()}
                  disabled={running || !hasPending}
                  className="rounded-lg bg-clause px-4 py-1.5 font-semibold text-white transition-colors hover:bg-clause/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {running ? "Analyzing…" : hasPending ? "Analyze all" : "All done"}
                </button>
              </div>
            </div>

            {/* File list */}
            <div className="mt-3 rounded-lg border border-border bg-surface overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-raised text-xs uppercase text-text-muted">
                  <tr>
                    <th className="px-4 py-2">File</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Verdict</th>
                    <th className="px-4 py-2">Risks</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => {
                    const highRisks = item.analysis?.risks.filter((r) => r.riskLevel === "high").length ?? 0;
                    const verdict = item.analysis?.signingDecision?.verdict;
                    return (
                      <tr key={item.id} className="align-middle">
                        <td className="px-4 py-3 font-medium text-text-primary">{item.file.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-semibold ${
                              item.status === "done"
                                ? "text-teal"
                                : item.status === "error"
                                ? "text-danger"
                                : item.status === "analyzing"
                                ? "text-amber"
                                : "text-text-muted"
                            }`}
                          >
                            {statusLabel[item.status]}
                          </span>
                          {item.error ? <p className="mt-0.5 text-xs text-danger">{item.error}</p> : null}
                        </td>
                        <td className="px-4 py-3">
                          {verdict ? (
                            <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${verdictClasses[verdict]}`}>
                              {verdictLabels[verdict]}
                            </span>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {item.status === "done" ? (
                            highRisks > 0 ? (
                              <span className="inline-flex rounded-md border border-danger/30 bg-danger/5 px-2 py-0.5 text-xs font-semibold text-danger">
                                {highRisks} high
                              </span>
                            ) : (
                              <span className="text-xs text-teal">None</span>
                            )
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {item.savedId ? (
                              <Link
                                href={`/dashboard?id=${item.savedId}`}
                                className="text-xs font-medium text-clause hover:underline"
                              >
                                View
                              </Link>
                            ) : null}
                            {!running && (
                              <button
                                type="button"
                                onClick={() => remove(item.id)}
                                className="text-xs text-text-muted hover:text-danger"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
