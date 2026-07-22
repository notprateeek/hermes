import type { AgreementAnalysis } from "./types";
import { buildDeadlineItems } from "./deadlines.ts";

function list(items: string[]) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- Not found";
}

function verdictLabel(verdict?: string) {
  return (verdict || "not_found").replace(/_/g, " ");
}

function top<T>(items: T[], limit: number) {
  return items.slice(0, limit);
}

export function formatAnalysisMarkdown(analysis: AgreementAnalysis) {
  const lines = [
    `# ${analysis.agreementTitle || "Hermes Agreement Analysis"}`,
    "",
    `**User perspective:** ${analysis.signerPerspective || "Not specified"}`,
    `**Preflight focus:** ${analysis.preflightFocus || "Auto-detect"}`,
    `**Source:** ${analysis.sourceContext || "Uploaded or pasted agreement"}`,
    `**Document type:** ${analysis.documentType || "Not found"}`,
    `**Jurisdiction:** ${analysis.jurisdiction || "Not found"}`,
    `**Effective date:** ${analysis.effectiveDate || "Not found"}`,
    `**Expiration date:** ${analysis.expirationDate || "Not found"}`,
    "",
    "## Signing Decision",
    `**Verdict:** ${verdictLabel(analysis.signingDecision?.verdict)}`,
    analysis.signingDecision?.plainEnglish || analysis.signingDecision?.rationale || "Not found",
    "",
    "### Top blockers",
    list(analysis.signingDecision?.topBlockers || []),
    "",
    `**Next step:** ${analysis.signingDecision?.nextStep || "Not found"}`,
    "",
    "## Summary",
    analysis.plainEnglishSummary || "Not found",
    "",
    "## Parties",
    list(analysis.parties.map((party) => `${party.name} (${party.role}) - ${party.description}`)),
    "",
    "## Commitments",
    list(
      analysis.commitments.map(
        (item) =>
          `${item.party}: ${item.commitment} | deadline: ${item.deadline || "not stated"} | risk: ${item.riskLevel}`
      )
    ),
    "",
    "## Payments",
    list(
      analysis.payments.map(
        (item) =>
          `${item.payer} pays ${item.receiver} ${item.amount || "an unstated amount"} ${item.currency} | due: ${item.dueDate || item.trigger || "not stated"}`
      )
    ),
    "",
    "## Penalties",
    list(analysis.penalties.map((item) => `${item.appliesToParty}: ${item.plainEnglish || item.penalty}`)),
    "",
    "## Risks",
    list(analysis.risks.map((item) => `[${item.riskLevel}] ${item.issue} - ${item.recommendation}`)),
    "",
    "## Recommendations",
    list(analysis.recommendations.map((item) => `[${item.priority}] ${item.recommendation}`)),
    "",
    "## Deadline Tracker",
    list(buildDeadlineItems(analysis).map((item) => `${item.due} | ${item.owner} | ${item.label}`)),
    "",
    "## Term-by-term Verdict",
    list(
      (analysis.walkAwayConditions || []).map(
        (c) => `[${c.classification.replace(/_/g, " ")}] ${c.term} — ${c.reason}${c.ifKept && c.classification !== "acceptable_as_is" ? ` | If kept: ${c.ifKept}` : ""}`
      )
    ),
    "",
    "## Redline Suggestions",
    ...(analysis.redlines || []).flatMap((r) => [
      `### ${r.clauseTitle} [${r.priority}]`,
      `**Issue:** ${r.issue}`,
      `**Current:** ${r.currentLanguage}`,
      `**Proposed:** ${r.proposedLanguage}`,
      `**Why:** ${r.negotiatingRationale}`,
      ""
    ]),
    "## Negotiation Brief",
    list(
      (analysis.negotiationBrief || []).map(
        (item) =>
          `[${item.priority}] ${item.issue} | Ask: ${item.ask} | Fallback: ${item.fallbackLanguage} | Email: ${item.emailReadyWording}`
      )
    ),
    "",
    "## Counsel Brief",
    analysis.counselBrief || "Not provided.",
    "",
    "## Questions to Ask Before Signing",
    list(analysis.questionsToAskBeforeSigning),
    "",
    "## Missing or Vague Terms",
    list(analysis.missingOrVagueTerms.map((item) => `${item.term}: ${item.suggestedClarification}`)),
    "",
    "## Takeaway",
    analysis.userFriendlyTakeaway || "Not found",
    "",
    `_${analysis.disclaimer || "This output is not legal, financial, or insurance advice."}_`
  ];

  return `${lines.join("\n")}\n`;
}

export function formatSharePackMarkdown(analysis: AgreementAnalysis) {
  const lines = [
    `# Hermes Share Pack: ${analysis.agreementTitle || "Agreement"}`,
    "",
    `**Perspective:** ${analysis.signerPerspective || "Not specified"}`,
    `**Focus:** ${analysis.preflightFocus || "Auto-detect"}`,
    `**Source:** ${analysis.sourceContext || "Uploaded or pasted agreement"}`,
    `**Decision:** ${verdictLabel(analysis.signingDecision?.verdict)}`,
    `**Next step:** ${analysis.signingDecision?.nextStep || "Not found"}`,
    "",
    "## Executive Takeaway",
    analysis.signingDecision?.plainEnglish || analysis.userFriendlyTakeaway || "Not found",
    "",
    "## Top Blockers",
    list(analysis.signingDecision?.topBlockers || []),
    "",
    "## Risks to Discuss",
    list(top(analysis.risks, 3).map((item) => `[${item.riskLevel}] ${item.issue} - ${item.recommendation}`)),
    "",
    "## Negotiation Asks",
    list(top(analysis.negotiationBrief || [], 3).map((item) => `${item.ask} Fallback: ${item.fallbackLanguage}`)),
    "",
    "## Email Wording",
    list(top(analysis.negotiationBrief || [], 2).map((item) => item.emailReadyWording)),
    "",
    "## Dates to Calendar",
    list(top(buildDeadlineItems(analysis), 5).map((item) => `${item.due} | ${item.owner} | ${item.label}`)),
    "",
    "## Questions Before Signing",
    list(top(analysis.questionsToAskBeforeSigning, 5)),
    "",
    `_${analysis.disclaimer || "This output is not legal, financial, or insurance advice."}_`
  ];

  return `${lines.join("\n")}\n`;
}

export function formatCounterpartyRedlinesMarkdown(analysis: AgreementAnalysis) {
  const hasRedlines = analysis.redlines?.length > 0;
  const lines = [
    `# Counterparty Response: ${analysis.agreementTitle || "Agreement"}`,
    "",
    "Hi,",
    "",
    "Thanks for sending this over. Before signing, I need to tighten a few points:",
    "",
    ...(hasRedlines
      ? analysis.redlines.flatMap((r, index) => [
          `${index + 1}. **${r.clauseTitle}**`,
          `Issue: ${r.issue}`,
          `Proposed language: ${r.proposedLanguage}`,
          ""
        ])
      : top(analysis.negotiationBrief || [], 5).flatMap((item, index) => [
          `${index + 1}. ${item.issue}`,
          `Ask: ${item.ask}`,
          `Proposed language: ${item.fallbackLanguage || "Please revise this clause to address the issue above."}`,
          ""
        ])),
    "These changes would make the agreement clearer and easier to move forward with.",
    "",
    "Thanks."
  ];

  return `${lines.join("\n")}\n`;
}

export function formatCounselPackMarkdown(analysis: AgreementAnalysis) {
  const lines = [
    `# Counsel Pack: ${analysis.agreementTitle || "Agreement"}`,
    "",
    `**Perspective:** ${analysis.signerPerspective || "Not specified"}`,
    `**Focus:** ${analysis.preflightFocus || "Auto-detect"}`,
    `**Source:** ${analysis.sourceContext || "Uploaded or pasted agreement"}`,
    `**Hermes decision:** ${verdictLabel(analysis.signingDecision?.verdict)}`,
    "",
    "## Counsel Brief",
    analysis.counselBrief || analysis.plainEnglishSummary || "Not found",
    "",
    "## Blockers",
    list(analysis.signingDecision?.topBlockers || []),
    "",
    "## Term-by-term Verdict",
    list(
      (analysis.walkAwayConditions || [])
        .filter((c) => c.classification !== "acceptable_as_is")
        .map((c) => `[${c.classification.replace(/_/g, " ")}] ${c.term} — ${c.ifKept || c.reason}`)
    ),
    "",
    "## Redline Requests",
    ...(analysis.redlines || []).flatMap((r) => [
      `### ${r.clauseTitle}`,
      `Proposed: ${r.proposedLanguage}`,
      ""
    ]),
    "## Risk Evidence",
    list(top(analysis.risks, 5).map((item) => `[${item.riskLevel}] ${item.issue} | ${item.evidence || item.relatedClause}`)),
    "",
    "## Dates and Obligations",
    list(top(buildDeadlineItems(analysis), 8).map((item) => `${item.due} | ${item.owner} | ${item.label}`)),
    "",
    "## Questions for Counsel",
    list(top(analysis.questionsToAskBeforeSigning, 8)),
    "",
    `_${analysis.disclaimer || "This output is not legal, financial, or insurance advice."}_`
  ];

  return `${lines.join("\n")}\n`;
}
