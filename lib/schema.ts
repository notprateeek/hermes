const basis = { type: "string", enum: ["explicit", "inferred", "recommendation"] };
const riskLevel = { type: "string", enum: ["low", "medium", "high"] };
const signingVerdict = { type: "string", enum: ["safe_to_sign", "negotiate_first", "do_not_sign_without_counsel"] };
const stringArray = { type: "array", items: { type: "string" } };

const evidenceRequired = ["evidence", "basis"];
const evidenceProps = {
  evidence: { type: "string" },
  basis
};

function object(properties: Record<string, unknown>, required = Object.keys(properties)) {
  return {
    type: "object",
    additionalProperties: false,
    properties,
    required
  };
}

function arrayOf(item: unknown) {
  return { type: "array", items: item };
}

const party = object({
  name: { type: "string" },
  role: { type: "string" },
  description: { type: "string" },
  ...evidenceProps
});

const commitment = object({
  id: { type: "string" },
  party: { type: "string" },
  commitment: { type: "string" },
  category: { type: "string" },
  deadline: { type: "string" },
  conditions: stringArray,
  dependencies: stringArray,
  acceptanceCriteria: stringArray,
  evidenceRequired: stringArray,
  penaltiesIfNotMet: stringArray,
  relatedPayments: stringArray,
  riskLevel,
  riskReason: { type: "string" },
  ...evidenceProps
});

const payment = object({
  id: { type: "string" },
  payer: { type: "string" },
  receiver: { type: "string" },
  amount: { type: "string" },
  currency: { type: "string" },
  dueDate: { type: "string" },
  trigger: { type: "string" },
  conditions: stringArray,
  penaltyForLateOrNonPayment: { type: "string" },
  riskLevel,
  riskReason: { type: "string" },
  ...evidenceProps
});

const penalty = object({
  id: { type: "string" },
  appliesToParty: { type: "string" },
  triggerEvent: { type: "string" },
  penalty: { type: "string" },
  severity: riskLevel,
  relatedClause: { type: "string" },
  plainEnglish: { type: "string" },
  riskNote: { type: "string" },
  ...evidenceProps
});

const importantClause = object({
  clauseTitle: { type: "string" },
  clauseTextExcerpt: { type: "string" },
  plainEnglish: { type: "string" },
  whyItMatters: { type: "string" },
  riskLevel,
  ...evidenceProps
});

const risk = object({
  id: { type: "string" },
  riskLevel,
  issue: { type: "string" },
  whyItMatters: { type: "string" },
  recommendation: { type: "string" },
  relatedClause: { type: "string" },
  ...evidenceProps
});

const recommendation = object({
  priority: riskLevel,
  recommendation: { type: "string" },
  reason: { type: "string" },
  suggestedQuestionToAsk: { type: "string" },
  ...evidenceProps
});

const missingTerm = object({
  term: { type: "string" },
  whyItIsProblematic: { type: "string" },
  suggestedClarification: { type: "string" },
  ...evidenceProps
});

const signingDecision = object({
  verdict: signingVerdict,
  plainEnglish: { type: "string" },
  rationale: { type: "string" },
  topBlockers: stringArray,
  nextStep: { type: "string" },
  ...evidenceProps
});

const negotiationAction = object({
  id: { type: "string" },
  priority: riskLevel,
  issue: { type: "string" },
  ask: { type: "string" },
  fallbackLanguage: { type: "string" },
  emailReadyWording: { type: "string" },
  relatedClause: { type: "string" },
  ...evidenceProps
});

const redlineSuggestion = object({
  id: { type: "string" },
  clauseTitle: { type: "string" },
  currentLanguage: { type: "string" },
  issue: { type: "string" },
  proposedLanguage: { type: "string" },
  negotiatingRationale: { type: "string" },
  priority: riskLevel,
});

const riskCategory = object({
  name: { type: "string" },
  level: riskLevel,
  count: { type: "number" },
  summary: { type: "string" },
});

const walkAwayCondition = object({
  id: { type: "string" },
  term: { type: "string" },
  classification: { type: "string", enum: ["deal_breaker", "strongly_negotiate", "acceptable_as_is"] },
  reason: { type: "string" },
  ifKept: { type: "string" },
});

export const agreementAnalysisSchema = object({
  signerPerspective: { type: "string" },
  preflightFocus: { type: "string" },
  sourceContext: { type: "string" },
  documentType: { type: "string" },
  agreementTitle: { type: "string" },
  jurisdiction: { type: "string" },
  effectiveDate: { type: "string" },
  expirationDate: { type: "string" },
  parties: arrayOf(party),
  purpose: { type: "string" },
  plainEnglishSummary: { type: "string" },
  commitments: arrayOf(commitment),
  payments: arrayOf(payment),
  penalties: arrayOf(penalty),
  importantClauses: arrayOf(importantClause),
  risks: arrayOf(risk),
  riskCategories: arrayOf(riskCategory),
  recommendations: arrayOf(recommendation),
  questionsToAskBeforeSigning: stringArray,
  missingOrVagueTerms: arrayOf(missingTerm),
  signingDecision,
  walkAwayConditions: arrayOf(walkAwayCondition),
  negotiationBrief: arrayOf(negotiationAction),
  redlines: arrayOf(redlineSuggestion),
  counselBrief: { type: "string" },
  userFriendlyTakeaway: { type: "string" },
  disclaimer: { type: "string" }
});

export const qaAnswerSchema = object({
  answer: { type: "string" },
  whatTheAgreementSays: { type: "string" },
  whatIsUnclear: { type: "string" },
  recommendedNextStep: { type: "string" }
});

export const schemaSanity = {
  agreementRequiredFields: Object.keys(agreementAnalysisSchema.properties),
  evidenceRequired
};
