import assert from "node:assert/strict";
import { buildDeadlineItems } from "../lib/deadlines.ts";
import {
  formatAnalysisMarkdown,
  formatCounterpartyRedlinesMarkdown,
  formatCounselPackMarkdown,
  formatSharePackMarkdown
} from "../lib/markdown.ts";
import { schemaSanity } from "../lib/schema.ts";
import type { AgreementAnalysis } from "../lib/types.ts";

const sample: AgreementAnalysis = {
  signerPerspective: "Contractor / freelancer",
  preflightFocus: "Freelance / consulting",
  sourceContext: "Copied from signing page",
  documentType: "Freelance Agreement",
  agreementTitle: "Sample Website Agreement",
  jurisdiction: "",
  effectiveDate: "2026-07-01",
  expirationDate: "",
  parties: [
    {
      name: "Northstar Labs",
      role: "Client",
      description: "Receives the website deliverable.",
      evidence: "This agreement is between Northstar Labs, the Client...",
      basis: "explicit"
    }
  ],
  purpose: "Build a marketing website.",
  plainEnglishSummary: "The freelancer builds a website and the client pays in two milestones.",
  commitments: [
    {
      id: "C1",
      party: "Freelancer",
      commitment: "Deliver a staging URL.",
      category: "delivery",
      deadline: "2026-07-20",
      conditions: [],
      dependencies: ["Client provides assets by 2026-07-05"],
      acceptanceCriteria: ["Responsive on mobile and desktop"],
      evidenceRequired: ["Staging URL"],
      penaltiesIfNotMet: ["Client may withhold final payment after delay."],
      relatedPayments: ["P2"],
      riskLevel: "medium",
      riskReason: "Approval process is loose.",
      evidence: "The Freelancer will deliver a staging URL by July 20, 2026.",
      basis: "explicit"
    }
  ],
  payments: [
    {
      id: "P1",
      payer: "Client",
      receiver: "Freelancer",
      amount: "3000",
      currency: "USD",
      dueDate: "",
      trigger: "After approving the staging URL",
      conditions: [],
      penaltyForLateOrNonPayment: "",
      riskLevel: "medium",
      riskReason: "Payment timing depends on approval.",
      evidence: "USD 3,000 after approving the staging URL.",
      basis: "explicit"
    }
  ],
  penalties: [],
  importantClauses: [],
  risks: [
    {
      id: "R1",
      riskLevel: "medium",
      issue: "Acceptance criteria are vague.",
      whyItMatters: "Vague approval can delay final payment.",
      recommendation: "Define objective acceptance criteria.",
      relatedClause: "Acceptance",
      evidence: "Generally matches the approved design.",
      basis: "explicit"
    }
  ],
  recommendations: [],
  questionsToAskBeforeSigning: ["Who decides final approval?"],
  missingOrVagueTerms: [],
  signingDecision: {
    verdict: "negotiate_first",
    plainEnglish: "Do not sign until approval and payment timing are clarified.",
    rationale: "Final payment depends on loose approval language.",
    topBlockers: ["Acceptance criteria are vague."],
    nextStep: "Ask for objective acceptance criteria before signing.",
    evidence: "Generally matches the approved design.",
    basis: "recommendation"
  },
  riskCategories: [
    { name: "Payment & Cash Flow", level: "medium", count: 1, summary: "Final payment depends on loose approval language." }
  ],
  walkAwayConditions: [
    { id: "W1", term: "Acceptance criteria", classification: "strongly_negotiate", reason: "Vague language delays payment.", ifKept: "Payment can be withheld indefinitely." }
  ],
  negotiationBrief: [
    {
      id: "N1",
      priority: "medium",
      issue: "Acceptance criteria are vague.",
      ask: "Define objective approval criteria and a fixed response window.",
      fallbackLanguage: "Approval will not be unreasonably withheld and silence for seven business days means acceptance.",
      emailReadyWording: "Can we tighten the acceptance language so final payment is tied to objective criteria and a clear response window?",
      relatedClause: "Acceptance",
      evidence: "Generally matches the approved design.",
      basis: "recommendation"
    }
  ],
  redlines: [
    {
      id: "RL1",
      clauseTitle: "Acceptance",
      currentLanguage: "Generally matches the approved design.",
      issue: "Vague acceptance standard.",
      proposedLanguage: "Acceptance shall be deemed given if Client does not provide written objections within 7 business days of delivery.",
      negotiatingRationale: "Protects the Freelancer from indefinite approval delays.",
      priority: "medium"
    }
  ],
  counselBrief: "This is a freelance website agreement. The main risk is vague acceptance criteria that could delay final payment. Request objective approval language before signing.",
  userFriendlyTakeaway: "Clarify approval before signing.",
  disclaimer: "This output is not legal, financial, or insurance advice."
};

assert(schemaSanity.agreementRequiredFields.includes("commitments"));
assert(schemaSanity.agreementRequiredFields.includes("signerPerspective"));
assert(schemaSanity.agreementRequiredFields.includes("preflightFocus"));
assert(schemaSanity.agreementRequiredFields.includes("sourceContext"));
assert(schemaSanity.agreementRequiredFields.includes("signingDecision"));
assert(schemaSanity.agreementRequiredFields.includes("negotiationBrief"));
assert(schemaSanity.agreementRequiredFields.includes("disclaimer"));
assert.equal(sample.commitments[0].basis, "explicit");

const markdown = formatAnalysisMarkdown(sample);
const sharePack = formatSharePackMarkdown(sample);
const redlines = formatCounterpartyRedlinesMarkdown(sample);
const counselPack = formatCounselPackMarkdown(sample);
const deadlines = buildDeadlineItems(sample);
assert(markdown.includes("# Sample Website Agreement"));
assert(markdown.includes("**User perspective:** Contractor / freelancer"));
assert(markdown.includes("**Preflight focus:** Freelance / consulting"));
assert(markdown.includes("**Source:** Copied from signing page"));
assert(markdown.includes("## Signing Decision"));
assert(markdown.includes("## Negotiation Brief"));
assert(markdown.includes("## Deadline Tracker"));
assert(markdown.includes("## Commitments"));
assert(markdown.includes("Clarify approval before signing."));
assert(sharePack.includes("# Hermes Share Pack: Sample Website Agreement"));
assert(sharePack.includes("**Focus:** Freelance / consulting"));
assert(sharePack.includes("**Source:** Copied from signing page"));
assert(sharePack.includes("**Decision:** negotiate first"));
assert(sharePack.includes("## Dates to Calendar"));
assert(sharePack.includes("Can we tighten the acceptance language"));
assert(redlines.includes("# Counterparty Response: Sample Website Agreement"));
assert(redlines.includes("Acceptance shall be deemed given"));
assert(counselPack.includes("# Counsel Pack: Sample Website Agreement"));
assert(counselPack.includes("**Source:** Copied from signing page"));
assert(counselPack.includes("## Risk Evidence"));
assert(counselPack.includes("Generally matches the approved design."));
assert.equal(deadlines.length, 3);
assert(deadlines.some((item) => item.due === "2026-07-20"));

console.log("smoke ok");
