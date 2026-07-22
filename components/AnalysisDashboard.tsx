"use client";

import { useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import type { AgreementAnalysis, RiskLevel, SigningVerdict, WalkAwayCondition } from "../lib/types";
import { buildDeadlineItems } from "../lib/deadlines";
import { ExportMarkdownButton } from "./ExportMarkdownButton";
import { CheckCircle2 } from "lucide-react";

type Props = {
  analysis: AgreementAnalysis | null;
  metadata: { fileName: string; fileType: string; pageCount: number } | null;
  busy?: boolean;
  fileName?: string;
};

type EvidenceLike = {
  evidence?: string;
  basis?: string;
};

const riskClasses: Record<RiskLevel, string> = {
  high: "border-danger/30 bg-danger/5 text-danger",
  medium: "border-amber/30 bg-amber/10 text-amber",
  low: "border-teal/30 bg-teal/10 text-teal"
};

const verdictClasses: Record<SigningVerdict, string> = {
  safe_to_sign: "border-teal/30 bg-teal/10 text-teal",
  negotiate_first: "border-amber/30 bg-amber/10 text-amber",
  do_not_sign_without_counsel: "border-danger/30 bg-danger/5 text-danger"
};

const verdictHeroClasses: Record<SigningVerdict, string> = {
  safe_to_sign: "border-teal/20",
  negotiate_first: "border-amber/20",
  do_not_sign_without_counsel: "border-danger/20"
};

const verdictGlow: Record<SigningVerdict, string> = {
  safe_to_sign: "rgba(62,207,142,0.05)",
  negotiate_first: "rgba(245,158,11,0.05)",
  do_not_sign_without_counsel: "rgba(239,68,68,0.05)"
};

const verdictLabels: Record<SigningVerdict, string> = {
  safe_to_sign: "Safe to sign",
  negotiate_first: "Negotiate first",
  do_not_sign_without_counsel: "Do not sign without counsel"
};

function value(text: string) {
  return text || "Not specified";
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-auto shrink-0 rounded border border-border px-2 py-1 text-[10px] font-medium text-text-muted transition-colors hover:border-clause hover:text-clause"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function RiskScore({ analysis }: { analysis: AgreementAnalysis }) {
  const high = analysis.risks.filter((r) => r.riskLevel === "high").length;
  const med = analysis.risks.filter((r) => r.riskLevel === "medium").length;
  if (!analysis.risks.length) return null;
  return (
    <div className="flex items-center gap-2 text-xs">
      {high > 0 && <span className="rounded-md border border-danger/30 bg-danger/5 px-2 py-1 font-semibold text-danger">{high} high</span>}
      {med > 0 && <span className="rounded-md border border-amber/30 bg-amber/10 px-2 py-1 font-semibold text-amber">{med} med</span>}
    </div>
  );
}

const walkAwayClasses: Record<WalkAwayCondition["classification"], string> = {
  deal_breaker: "border-danger/30 bg-danger/5 text-danger",
  strongly_negotiate: "border-amber/30 bg-amber/10 text-amber",
  acceptable_as_is: "border-teal/30 bg-teal/10 text-teal",
};
const walkAwayLabels: Record<WalkAwayCondition["classification"], string> = {
  deal_breaker: "Deal breaker",
  strongly_negotiate: "Negotiate hard",
  acceptable_as_is: "Acceptable",
};

function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold capitalize ${riskClasses[level]}`}>
      {level}
    </span>
  );
}

function VerdictBadge({ verdict }: { verdict: SigningVerdict }) {
  return (
    <span className={`inline-flex shrink-0 whitespace-nowrap rounded-md border px-2 py-1 text-xs font-semibold ${verdictClasses[verdict]}`}>
      {verdictLabels[verdict]}
    </span>
  );
}

function Panel({
  title,
  description,
  action,
  children,
  className = ""
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-border bg-surface ${className}`}>
      <div className="flex flex-col gap-2 border-b border-border px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="break-words text-sm font-semibold text-text-primary">{title}</h3>
          {description ? <p className="mt-1 break-words text-xs leading-5 text-text-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function EvidenceNote({ item }: { item: EvidenceLike }) {
  if (!item.evidence) return null;

  return (
    <p className="mt-2 text-xs leading-5 text-muted">
      {item.basis ? `${item.basis}: ` : ""}
      {item.evidence}
    </p>
  );
}

const STEPS = [
  { label: "Extracting text and structure", delay: 0 },
  { label: "Reading clauses and obligations", delay: 4000 },
  { label: "Identifying parties and commitments", delay: 9000 },
  { label: "Assessing risks and penalties", delay: 15000 },
  { label: "Writing negotiation brief", delay: 21000 },
  { label: "Generating signing verdict", delay: 27000 },
];

function LoadingAnalysis({ fileName }: { fileName?: string }) {
  const [activeStep, setActiveStep] = useState(0);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const timers = STEPS.map(({ delay }, i) => setTimeout(() => setActiveStep(i), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setDots((d) => (d.length >= 3 ? "." : d + ".")), 450);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center bg-bg px-8 py-12">
      <div className="w-full max-w-[360px]">
        {/* Animated doc scanner */}
        <div className="relative mb-8 overflow-hidden rounded-xl border border-border bg-surface px-5 py-4">
          <div className="scan-bar-el" />
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            {fileName ?? "Analyzing agreement"}
          </p>
          <div className="grid gap-2">
            <div className="flex gap-2">
              <div className="h-2 w-10 rounded-full bg-surface-raised" />
              <div className="clause-hl h-2 flex-1 rounded-full bg-surface-raised" />
            </div>
            <div className="h-2 rounded-full bg-surface-raised" style={{ width: "88%" }} />
            <div className="h-2 rounded-full bg-surface-raised" style={{ width: "73%" }} />
            <div className="flex gap-2">
              <div className="clause-hl h-2 w-20 rounded-full bg-surface-raised" />
              <div className="h-2 flex-1 rounded-full bg-surface-raised" />
            </div>
            <div className="h-2 rounded-full bg-surface-raised" style={{ width: "95%" }} />
            <div className="h-2 rounded-full bg-surface-raised" style={{ width: "60%" }} />
            <div className="flex gap-2">
              <div className="h-2 flex-1 rounded-full bg-surface-raised" />
              <div className="clause-hl h-2 w-14 rounded-full bg-surface-raised" />
            </div>
          </div>
          <div className="finding-reveal mt-3 rounded-md border border-border bg-bg px-3 py-2 text-[11px] text-text-muted">
            Clause detected → evaluating risk level
          </div>
        </div>

        {/* Step list */}
        <div className="grid gap-3.5">
          {STEPS.map(({ label }, i) => {
            const done = i < activeStep;
            const active = i === activeStep;
            return (
              <div key={label} className="flex items-center gap-3">
                {done ? (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/10">
                    <CheckCircle2 size={12} className="text-teal" />
                  </div>
                ) : active ? (
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <span
                      className="h-3 w-3 animate-pulse rounded-full"
                      style={{ background: "rgb(var(--clause))" }}
                    />
                  </div>
                ) : (
                  <div className="h-5 w-5 shrink-0 rounded-full border border-border" />
                )}
                <span
                  className={`text-sm transition-colors ${
                    done
                      ? "text-text-muted"
                      : active
                      ? "font-medium text-text-primary"
                      : "text-text-muted opacity-40"
                  }`}
                >
                  {label}
                  {active ? dots : ""}
                </span>
              </div>
            );
          })}
        </div>

        <p className="mt-7 text-xs leading-5 text-text-muted">
          Hermes reads the full agreement carefully. This usually takes 20–40 seconds.
        </p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center bg-bg p-8 text-center">
      <div className="max-w-md rounded-xl border border-border bg-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">No preflight yet</p>
        <h2 className="mt-3 text-xl font-bold text-text-primary">Know what to do before you sign.</h2>
        <p className="mt-2 text-sm leading-6 text-text-muted">
          Choose the source, your role, and deal type. Hermes returns a signing decision, deadlines, redlines, counsel pack, and grounded Q&A.
        </p>
      </div>
    </div>
  );
}

export function AnalysisDashboard({ analysis, metadata, busy, fileName }: Props) {
  if (busy && !analysis) return <LoadingAnalysis fileName={fileName} />;
  if (!analysis) return <EmptyState />;

  const overviewRows = [
    ["Document type", analysis.documentType],
    ["Jurisdiction", analysis.jurisdiction],
    ["Effective date", analysis.effectiveDate],
    ["Expiration date", analysis.expirationDate],
    ["Purpose", analysis.purpose]
  ];
  const deadlineItems = buildDeadlineItems(analysis);

  return (
    <section className="min-h-0 overflow-auto bg-bg">
      <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-border bg-surface px-5 py-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-text-primary">{analysis.agreementTitle || "Agreement analysis"}</h2>
          <p className="mt-0.5 truncate text-xs text-text-muted">
            {analysis.documentType || "Unknown type"} · {metadata?.fileName || "pasted text"}
            {analysis.signerPerspective ? ` · ${analysis.signerPerspective}` : ""}
            {metadata?.pageCount ? ` · ${metadata.pageCount}pp` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RiskScore analysis={analysis} />
          <ExportMarkdownButton analysis={analysis} />
        </div>
      </div>

      <div className="grid gap-4 p-5">
        {analysis.signingDecision ? (
          <div className="grid gap-4">
            {/* Hero verdict banner */}
            <section
              className={`overflow-hidden rounded-xl border ${verdictHeroClasses[analysis.signingDecision.verdict]}`}
              style={{ background: verdictGlow[analysis.signingDecision.verdict] }}
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                    Signing decision
                    {analysis.signerPerspective ? ` · ${analysis.signerPerspective}` : ""}
                    {analysis.preflightFocus ? ` · ${analysis.preflightFocus}` : ""}
                  </p>
                  <p className="mt-2 text-xl font-normal italic leading-snug text-text-primary">
                    {analysis.signingDecision.plainEnglish || analysis.signingDecision.rationale || "Review carefully before signing."}
                  </p>
                </div>
                <VerdictBadge verdict={analysis.signingDecision.verdict} />
              </div>

              {analysis.signingDecision.topBlockers.length ? (
                <div className="flex flex-wrap gap-2 px-5 pb-4">
                  {analysis.signingDecision.topBlockers.map((blocker, index) => (
                    <span
                      key={`${blocker}-${index}`}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted"
                    >
                      {blocker}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="border-t border-border/40 bg-surface/50 px-5 py-3">
                <p className="text-sm font-medium text-text-primary">
                  → {analysis.signingDecision.nextStep || "Ask for clarification before signing."}
                </p>
              </div>
            </section>

            {/* Risk heatmap */}
            {analysis.riskCategories?.length ? (
              <Panel title="Risk by category" description="Grouped by area of exposure">
                <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                  {analysis.riskCategories.map((cat) => (
                    <div key={cat.name} className={`rounded-md border p-3 ${riskClasses[cat.level]}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold">{cat.name}</p>
                        <span className="rounded border border-current/20 bg-current/10 px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                          {cat.count}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 opacity-80">{cat.summary}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            ) : null}

            {/* Walk-away conditions */}
            {analysis.walkAwayConditions?.length ? (
              <Panel
                title="Term-by-term verdict"
                description="Know where to stand firm, where to push, and what's fine as-is"
              >
                <div className="grid gap-2">
                  {analysis.walkAwayConditions.map((cond) => (
                    <article key={cond.id || cond.term} className={`rounded-md border p-3 ${walkAwayClasses[cond.classification]}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold">{cond.term}</p>
                        <span className={`shrink-0 rounded-md border border-current/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider`}>
                          {walkAwayLabels[cond.classification]}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-5 opacity-80">{cond.reason}</p>
                      {cond.ifKept && cond.classification !== "acceptable_as_is" ? (
                        <p className="mt-2 text-xs font-medium opacity-90">If kept: {cond.ifKept}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </Panel>
            ) : null}

            {/* Redlines */}
            {analysis.redlines?.length ? (
              <Panel title="Redline suggestions" description="Proposed clause rewrites — ready to paste into the contract">
                <div className="grid gap-4">
                  {analysis.redlines.map((r) => (
                    <article key={r.id || r.clauseTitle} className="rounded-md border border-border bg-panel overflow-hidden">
                      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">{r.clauseTitle}</h4>
                        <RiskBadge level={r.priority} />
                      </div>
                      <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                        <div className="p-3">
                          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-danger/70">Current</p>
                          <p className="text-sm leading-6 text-text-muted italic">{r.currentLanguage || "See contract."}</p>
                        </div>
                        <div className="p-3">
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-teal/70">Proposed</p>
                            <CopyButton text={r.proposedLanguage} />
                          </div>
                          <p className="text-sm leading-6 text-text-primary">{r.proposedLanguage}</p>
                        </div>
                      </div>
                      <div className="border-t border-border bg-surface/50 px-3 py-2">
                        <p className="text-xs text-text-muted">Why: {r.negotiatingRationale}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </Panel>
            ) : null}

            <Panel title="Negotiation ammo" description="Use this with the counterparty">
              <div className="grid gap-3">
                {analysis.negotiationBrief?.length ? (
                  analysis.negotiationBrief.map((item) => (
                    <article key={item.id || item.issue} className="rounded-md border border-line bg-panel p-3">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-semibold text-ink">{item.issue || "Negotiation point"}</h4>
                        <RiskBadge level={item.priority} />
                      </div>
                      <p className="mt-2 text-sm leading-5 text-muted">{item.ask || "Ask for a clearer term."}</p>
                      {item.fallbackLanguage ? (
                        <div className="mt-3 rounded-md border border-line bg-surface p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-ink">Fallback: {item.fallbackLanguage}</p>
                            <CopyButton text={item.fallbackLanguage} />
                          </div>
                        </div>
                      ) : null}
                      {item.emailReadyWording ? (
                        <div className="mt-2 rounded-md border border-line bg-surface p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-ink">Email: {item.emailReadyWording}</p>
                            <CopyButton text={item.emailReadyWording} />
                          </div>
                        </div>
                      ) : null}
                      <EvidenceNote item={item} />
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-muted">No negotiation points found.</p>
                )}
              </div>
            </Panel>

            {/* Counsel brief */}
            {analysis.counselBrief ? (
              <Panel
                title="Counsel brief"
                description="Forward this to your lawyer"
                action={<CopyButton text={analysis.counselBrief} />}
              >
                <div className="whitespace-pre-wrap rounded-md border border-border bg-surface/60 p-4 text-sm leading-7 text-text-muted">
                  {analysis.counselBrief}
                </div>
              </Panel>
            ) : null}
          </div>
        ) : null}

        <Panel
          title="Deadline tracker"
          description="Dates and triggers to calendar"
          action={
            <span className="rounded-md border border-line bg-panel px-2 py-1 text-xs font-semibold text-muted">
              {deadlineItems.length}
            </span>
          }
        >
          {deadlineItems.length ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {deadlineItems.map((item, index) => (
                <article key={`${item.kind}-${item.due}-${index}`} className="rounded-md border border-line bg-panel p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-ink">{item.due}</p>
                    {item.riskLevel ? <RiskBadge level={item.riskLevel} /> : null}
                  </div>
                  <p className="mt-2 text-sm leading-5 text-muted">{item.label}</p>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted">{item.owner}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No dated obligations found.</p>
          )}
        </Panel>

        <Panel title="Agreement overview" description={metadata?.fileType || "text/plain"}>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {overviewRows.map(([label, rowValue]) => (
              <div key={label} className="rounded-md border border-line bg-panel p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
                <p className="mt-1 text-sm font-medium text-ink">{value(rowValue)}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel title="Plain-English summary">
            <p className="text-sm leading-6 text-muted">{analysis.plainEnglishSummary || "Not found"}</p>
          </Panel>
          <Panel title="Takeaway">
            <p className="text-sm leading-6 text-muted">{analysis.userFriendlyTakeaway || "Not found"}</p>
          </Panel>
        </div>

        <Panel title="Parties">
          <div className="grid gap-3 md:grid-cols-2">
            {analysis.parties.length ? (
              analysis.parties.map((party) => (
                <article key={`${party.name}-${party.role}`} className="rounded-md border border-line bg-panel p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-ink">{party.name || "Unnamed party"}</h4>
                      <p className="mt-1 text-xs font-medium text-teal">{party.role || "Role not stated"}</p>
                    </div>
                    <span className="rounded-md border border-line bg-surface px-2 py-1 text-xs text-muted">{party.basis}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-muted">{party.description || "Not found"}</p>
                  <EvidenceNote item={party} />
                </article>
              ))
            ) : (
              <p className="text-sm text-muted">No parties found.</p>
            )}
          </div>
        </Panel>

        <Panel title="Commitments">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-muted">
                <tr>
                  <th className="py-2 pr-4">Party</th>
                  <th className="py-2 pr-4">Commitment</th>
                  <th className="py-2 pr-4">Deadline</th>
                  <th className="py-2 pr-4">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {analysis.commitments.map((item) => (
                  <tr key={item.id || item.commitment} className="align-top">
                    <td className="py-3 pr-4 font-medium text-ink">{value(item.party)}</td>
                    <td className="py-3 pr-4 text-muted">
                      <p>{value(item.commitment)}</p>
                      {item.conditions.length ? <p className="mt-2 text-xs">Conditions: {item.conditions.join(", ")}</p> : null}
                      <EvidenceNote item={item} />
                    </td>
                    <td className="py-3 pr-4 text-muted">{value(item.deadline)}</td>
                    <td className="py-3 pr-4">
                      <RiskBadge level={item.riskLevel} />
                      {item.riskReason ? <p className="mt-2 text-xs leading-5 text-muted">{item.riskReason}</p> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!analysis.commitments.length ? <p className="py-3 text-sm text-muted">No commitments found.</p> : null}
          </div>
        </Panel>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Payments">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead className="border-b border-line text-xs uppercase text-muted">
                  <tr>
                    <th className="py-2 pr-4">Flow</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Due / trigger</th>
                    <th className="py-2 pr-4">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {analysis.payments.map((payment) => (
                    <tr key={payment.id || payment.evidence} className="align-top">
                      <td className="py-3 pr-4 font-medium text-ink">
                        {value(payment.payer)} → {value(payment.receiver)}
                      </td>
                      <td className="py-3 pr-4 text-muted">
                        {payment.amount || "Amount not stated"} {payment.currency}
                      </td>
                      <td className="py-3 pr-4 text-muted">{payment.dueDate || payment.trigger || "Not specified"}</td>
                      <td className="py-3 pr-4">
                        <RiskBadge level={payment.riskLevel} />
                        {payment.riskReason ? <p className="mt-2 text-xs leading-5 text-muted">{payment.riskReason}</p> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!analysis.payments.length ? <p className="py-3 text-sm text-muted">No payments found.</p> : null}
            </div>
          </Panel>

          <Panel title="Penalties">
            <div className="grid gap-3">
              {analysis.penalties.length ? (
                analysis.penalties.map((penalty) => (
                  <article key={penalty.id || penalty.penalty} className="rounded-md border border-line bg-panel p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-ink">{penalty.triggerEvent || "Trigger not specified"}</h4>
                        <p className="mt-1 text-xs text-muted">{penalty.appliesToParty || "Affected party not stated"}</p>
                      </div>
                      <RiskBadge level={penalty.severity} />
                    </div>
                    <p className="mt-2 text-sm leading-5 text-muted">{penalty.plainEnglish || penalty.penalty || "Not found"}</p>
                    {penalty.riskNote ? <p className="mt-2 text-xs leading-5 text-muted">{penalty.riskNote}</p> : null}
                    <EvidenceNote item={penalty} />
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No penalties found.</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Risks">
            <div className="grid gap-3">
              {analysis.risks.length ? (
                analysis.risks.map((risk) => (
                  <article key={risk.id || risk.issue} className="rounded-md border border-line bg-panel p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-ink">{risk.issue || "Risk"}</h4>
                      <RiskBadge level={risk.riskLevel} />
                    </div>
                    <p className="mt-2 text-sm leading-5 text-muted">{risk.whyItMatters || "Not found"}</p>
                    <p className="mt-3 rounded-md border border-line bg-surface p-3 text-sm font-medium text-ink">
                      {risk.recommendation || "No recommendation available."}
                    </p>
                    <EvidenceNote item={risk} />
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No risks found.</p>
              )}
            </div>
          </Panel>

          <Panel title="Recommendations">
            <div className="grid gap-3">
              {analysis.recommendations.length ? (
                analysis.recommendations.map((item, index) => (
                  <article key={`${item.recommendation}-${index}`} className="rounded-md border border-line bg-panel p-3">
                    <RiskBadge level={item.priority} />
                    <p className="mt-2 text-sm font-semibold text-ink">{item.recommendation || "Recommendation"}</p>
                    <p className="mt-1 text-sm leading-5 text-muted">{item.reason || "Not found"}</p>
                    {item.suggestedQuestionToAsk ? (
                      <p className="mt-3 rounded-md border border-line bg-surface p-3 text-sm text-ink">
                        Ask: {item.suggestedQuestionToAsk}
                      </p>
                    ) : null}
                    <EvidenceNote item={item} />
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No recommendations found.</p>
              )}
            </div>
          </Panel>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Panel title="Important clauses">
            <div className="grid gap-3">
              {analysis.importantClauses.length ? (
                analysis.importantClauses.map((clause) => (
                  <article key={clause.clauseTitle || clause.clauseTextExcerpt} className="rounded-md border border-line bg-panel p-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm font-semibold text-ink">{clause.clauseTitle || "Untitled clause"}</h4>
                      <RiskBadge level={clause.riskLevel} />
                    </div>
                    <p className="mt-2 text-sm leading-5 text-muted">{clause.plainEnglish || clause.whyItMatters || "Not found"}</p>
                    <EvidenceNote item={clause} />
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No important clauses found.</p>
              )}
            </div>
          </Panel>

          <Panel title="Missing or vague terms">
            <div className="grid gap-3">
              {analysis.missingOrVagueTerms.length ? (
                analysis.missingOrVagueTerms.map((term) => (
                  <article key={term.term || term.suggestedClarification} className="rounded-md border border-line bg-panel p-3">
                    <h4 className="text-sm font-semibold text-ink">{term.term || "Unspecified term"}</h4>
                    <p className="mt-2 text-sm leading-5 text-muted">{term.whyItIsProblematic || "Not found"}</p>
                    <p className="mt-3 rounded-md border border-line bg-surface p-3 text-sm font-medium text-ink">
                      Clarify: {term.suggestedClarification || "Not specified"}
                    </p>
                    <EvidenceNote item={term} />
                  </article>
                ))
              ) : (
                <p className="text-sm text-muted">No missing or vague terms found.</p>
              )}
            </div>
          </Panel>
        </div>

        <Panel title="Questions to ask before signing">
          {analysis.questionsToAskBeforeSigning.length ? (
            <ul className="grid gap-2 md:grid-cols-2">
              {analysis.questionsToAskBeforeSigning.map((question, index) => (
                <li key={`${question}-${index}`} className="flex items-start justify-between gap-3 rounded-md border border-line bg-panel px-3 py-2">
                  <span className="text-sm text-muted">{question}</span>
                  <CopyButton text={question} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No questions suggested.</p>
          )}
        </Panel>

        <p className="pb-4 text-xs leading-5 text-muted">{analysis.disclaimer}</p>
      </div>
    </section>
  );
}
