"use client";

import { useState } from "react";
import type { AgreementAnalysis, AnalysisResponse, RiskLevel, SigningVerdict } from "../../../lib/types";

type SlotState = {
  text: string;
  file: File | null;
  analysis: AgreementAnalysis | null;
  metadata: AnalysisResponse["metadata"] | null;
  busy: boolean;
  error: string;
};

const emptySlot = (): SlotState => ({ text: "", file: null, analysis: null, metadata: null, busy: false, error: "" });

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
const riskClasses: Record<RiskLevel, string> = {
  high: "border-danger/30 bg-danger/5 text-danger",
  medium: "border-amber/30 bg-amber/10 text-amber",
  low: "border-teal/30 bg-teal/10 text-teal",
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex shrink-0 rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${riskClasses[level]}`}>
      {level}
    </span>
  );
}

async function analyzeSlot(
  slot: SlotState,
  setSlot: (u: Partial<SlotState>) => void
): Promise<AgreementAnalysis | null> {
  if (!slot.text.trim() && !slot.file) return null;
  setSlot({ busy: true, error: "", analysis: null });
  try {
    const form = new FormData();
    form.append("text", slot.file ? "" : slot.text);
    if (slot.file) form.append("file", slot.file);
    const res = await fetch("/api/analyze", { method: "POST", body: form });
    const data = (await res.json()) as AnalysisResponse & { error?: string };
    if (!res.ok || data.error) throw new Error(data.error || "Analysis failed.");
    setSlot({ analysis: data.analysis, metadata: data.metadata, busy: false });
    return data.analysis;
  } catch (e) {
    setSlot({ error: e instanceof Error ? e.message : "Analysis failed.", busy: false });
    return null;
  }
}

function SlotInput({
  label,
  slot,
  update,
}: {
  label: string;
  slot: SlotState;
  update: (u: Partial<SlotState>) => void;
}) {
  async function handleFile(f: File | null) {
    if (!f) { update({ file: null }); return; }
    const n = f.name.toLowerCase();
    const isPdf = f.type === "application/pdf" || n.endsWith(".pdf");
    const isDocx = f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || n.endsWith(".docx");
    const isTxt = f.type.startsWith("text/") || n.endsWith(".txt");
    if (isTxt) { update({ text: await f.text(), file: null }); return; }
    if (isPdf || isDocx) { update({ file: f, text: "" }); return; }
    update({ error: "Upload a PDF, DOCX, or TXT file." });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
      <h3 className="text-sm font-semibold text-text-primary">{label}</h3>

      <textarea
        className="min-h-[140px] resize-none rounded-lg border border-border bg-surface-raised p-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-clause transition-colors"
        placeholder="Paste agreement text…"
        value={slot.text}
        onChange={(e) => update({ text: e.target.value, file: null, error: "" })}
      />

      <label className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border border-dashed border-border bg-surface-raised px-3 py-3 text-center transition-colors hover:border-clause" htmlFor={`file-${label}`}>
        <span className="text-xs font-medium text-text-primary">{slot.file ? slot.file.name : "Upload PDF, DOCX, or TXT"}</span>
      </label>
      <input
        id={`file-${label}`}
        type="file"
        accept="application/pdf,.pdf,.docx,text/plain,.txt"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
      />

      {slot.error ? <p className="text-xs text-danger">{slot.error}</p> : null}

      {slot.analysis ? (
        <div className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold ${verdictClasses[slot.analysis.signingDecision.verdict]}`}>
          <span className="flex-1">{slot.analysis.agreementTitle || "Agreement analyzed"}</span>
          <span>{verdictLabels[slot.analysis.signingDecision.verdict]}</span>
        </div>
      ) : null}
    </div>
  );
}

function CompareRow({ title, a, b }: { title: string; a: React.ReactNode; b: React.ReactNode }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Doc A · {title}</p>
        {a}
      </div>
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Doc B · {title}</p>
        {b}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [a, setA] = useState<SlotState>(emptySlot());
  const [b, setB] = useState<SlotState>(emptySlot());
  const [compared, setCompared] = useState(false);

  const updateA = (u: Partial<SlotState>) => setA((s) => ({ ...s, ...u }));
  const updateB = (u: Partial<SlotState>) => setB((s) => ({ ...s, ...u }));

  const busyAny = a.busy || b.busy;
  const hasInput = (s: SlotState) => s.text.trim() || s.file;
  const canCompare = hasInput(a) && hasInput(b) && !busyAny;

  async function compare() {
    setCompared(false);
    await Promise.all([
      analyzeSlot(a, updateA),
      analyzeSlot(b, updateB),
    ]);
    setCompared(true);
  }

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="border-b border-border bg-surface px-5 py-4">
        <h2 className="text-base font-bold text-text-primary">Clause compare</h2>
        <p className="mt-0.5 text-xs text-text-muted">Paste or upload two agreements — Hermes analyzes both and shows them side by side</p>
      </div>

      <div className="p-5">
        {/* Inputs */}
        <div className="grid gap-4 xl:grid-cols-2">
          <SlotInput label="Doc A" slot={a} update={updateA} />
          <SlotInput label="Doc B" slot={b} update={updateB} />
        </div>

        <button
          type="button"
          onClick={() => void compare()}
          disabled={!canCompare}
          className="mt-4 w-full rounded-lg bg-clause px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-clause/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busyAny ? "Analyzing both…" : "Compare agreements"}
        </button>

        {/* Results */}
        {compared && a.analysis && b.analysis ? (
          <div className="mt-6 grid gap-4">
            {/* Signing verdicts */}
            <CompareRow
              title="Signing decision"
              a={
                <div>
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${verdictClasses[a.analysis.signingDecision.verdict]}`}>
                    {verdictLabels[a.analysis.signingDecision.verdict]}
                  </span>
                  <p className="mt-2 text-sm leading-5 text-text-muted">{a.analysis.signingDecision.plainEnglish}</p>
                  {a.analysis.signingDecision.nextStep ? (
                    <p className="mt-2 rounded-md border border-border bg-surface-raised px-3 py-2 text-xs text-text-muted">
                      Next: {a.analysis.signingDecision.nextStep}
                    </p>
                  ) : null}
                </div>
              }
              b={
                <div>
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${verdictClasses[b.analysis.signingDecision.verdict]}`}>
                    {verdictLabels[b.analysis.signingDecision.verdict]}
                  </span>
                  <p className="mt-2 text-sm leading-5 text-text-muted">{b.analysis.signingDecision.plainEnglish}</p>
                  {b.analysis.signingDecision.nextStep ? (
                    <p className="mt-2 rounded-md border border-border bg-surface-raised px-3 py-2 text-xs text-text-muted">
                      Next: {b.analysis.signingDecision.nextStep}
                    </p>
                  ) : null}
                </div>
              }
            />

            {/* Risks */}
            <CompareRow
              title="Risks"
              a={
                a.analysis.risks.length ? (
                  <ul className="grid gap-2">
                    {a.analysis.risks.map((r) => (
                      <li key={r.id || r.issue} className="flex items-start gap-2">
                        <RiskBadge level={r.riskLevel} />
                        <span className="text-sm text-text-muted">{r.issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-text-muted">No risks found.</p>
              }
              b={
                b.analysis.risks.length ? (
                  <ul className="grid gap-2">
                    {b.analysis.risks.map((r) => (
                      <li key={r.id || r.issue} className="flex items-start gap-2">
                        <RiskBadge level={r.riskLevel} />
                        <span className="text-sm text-text-muted">{r.issue}</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-text-muted">No risks found.</p>
              }
            />

            {/* Parties */}
            <CompareRow
              title="Parties"
              a={
                <ul className="grid gap-2">
                  {a.analysis.parties.map((p) => (
                    <li key={p.name} className="rounded-md border border-border bg-surface-raised px-3 py-2">
                      <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                      <p className="text-xs text-teal">{p.role}</p>
                    </li>
                  ))}
                </ul>
              }
              b={
                <ul className="grid gap-2">
                  {b.analysis.parties.map((p) => (
                    <li key={p.name} className="rounded-md border border-border bg-surface-raised px-3 py-2">
                      <p className="text-sm font-semibold text-text-primary">{p.name}</p>
                      <p className="text-xs text-teal">{p.role}</p>
                    </li>
                  ))}
                </ul>
              }
            />

            {/* Missing/vague terms */}
            <CompareRow
              title="Missing or vague terms"
              a={
                a.analysis.missingOrVagueTerms.length ? (
                  <ul className="grid gap-2">
                    {a.analysis.missingOrVagueTerms.map((t) => (
                      <li key={t.term} className="text-sm text-text-muted">
                        <span className="font-semibold text-text-primary">{t.term}</span> — {t.whyItIsProblematic}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-text-muted">None found.</p>
              }
              b={
                b.analysis.missingOrVagueTerms.length ? (
                  <ul className="grid gap-2">
                    {b.analysis.missingOrVagueTerms.map((t) => (
                      <li key={t.term} className="text-sm text-text-muted">
                        <span className="font-semibold text-text-primary">{t.term}</span> — {t.whyItIsProblematic}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-text-muted">None found.</p>
              }
            />

            {/* Payments */}
            {(a.analysis.payments.length > 0 || b.analysis.payments.length > 0) && (
              <CompareRow
                title="Payments"
                a={
                  a.analysis.payments.length ? (
                    <ul className="grid gap-2">
                      {a.analysis.payments.map((p) => (
                        <li key={p.id || p.evidence} className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm">
                          <span className="font-semibold text-text-primary">{p.amount} {p.currency}</span>
                          <span className="text-text-muted"> · {p.payer} → {p.receiver}</span>
                          {p.dueDate ? <p className="mt-0.5 text-xs text-text-muted">Due: {p.dueDate}</p> : null}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-text-muted">No payments.</p>
                }
                b={
                  b.analysis.payments.length ? (
                    <ul className="grid gap-2">
                      {b.analysis.payments.map((p) => (
                        <li key={p.id || p.evidence} className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm">
                          <span className="font-semibold text-text-primary">{p.amount} {p.currency}</span>
                          <span className="text-text-muted"> · {p.payer} → {p.receiver}</span>
                          {p.dueDate ? <p className="mt-0.5 text-xs text-text-muted">Due: {p.dueDate}</p> : null}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-text-muted">No payments.</p>
                }
              />
            )}

            {/* Plain English Summary */}
            <CompareRow
              title="Summary"
              a={<p className="text-sm leading-6 text-text-muted">{a.analysis.plainEnglishSummary || "—"}</p>}
              b={<p className="text-sm leading-6 text-text-muted">{b.analysis.plainEnglishSummary || "—"}</p>}
            />
          </div>
        ) : compared ? (
          <p className="mt-6 text-sm text-danger">One or both analyses failed. Check your inputs and try again.</p>
        ) : null}
      </div>
    </main>
  );
}
