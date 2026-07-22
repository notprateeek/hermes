export type Basis = "explicit" | "inferred" | "recommendation";
export type RiskLevel = "low" | "medium" | "high";
export type SigningVerdict = "safe_to_sign" | "negotiate_first" | "do_not_sign_without_counsel";

export type Evidence = {
  evidence: string;
  basis: Basis;
};

export type Party = Evidence & {
  name: string;
  role: string;
  description: string;
};

export type Commitment = Evidence & {
  id: string;
  party: string;
  commitment: string;
  category: string;
  deadline: string;
  conditions: string[];
  dependencies: string[];
  acceptanceCriteria: string[];
  evidenceRequired: string[];
  penaltiesIfNotMet: string[];
  relatedPayments: string[];
  riskLevel: RiskLevel;
  riskReason: string;
};

export type Payment = Evidence & {
  id: string;
  payer: string;
  receiver: string;
  amount: string;
  currency: string;
  dueDate: string;
  trigger: string;
  conditions: string[];
  penaltyForLateOrNonPayment: string;
  riskLevel: RiskLevel;
  riskReason: string;
};

export type Penalty = Evidence & {
  id: string;
  appliesToParty: string;
  triggerEvent: string;
  penalty: string;
  severity: RiskLevel;
  relatedClause: string;
  plainEnglish: string;
  riskNote: string;
};

export type ImportantClause = Evidence & {
  clauseTitle: string;
  clauseTextExcerpt: string;
  plainEnglish: string;
  whyItMatters: string;
  riskLevel: RiskLevel;
};

export type RiskItem = Evidence & {
  id: string;
  riskLevel: RiskLevel;
  issue: string;
  whyItMatters: string;
  recommendation: string;
  relatedClause: string;
};

export type Recommendation = Evidence & {
  priority: RiskLevel;
  recommendation: string;
  reason: string;
  suggestedQuestionToAsk: string;
};

export type MissingTerm = Evidence & {
  term: string;
  whyItIsProblematic: string;
  suggestedClarification: string;
};

export type SigningDecision = Evidence & {
  verdict: SigningVerdict;
  plainEnglish: string;
  rationale: string;
  topBlockers: string[];
  nextStep: string;
};

export type NegotiationAction = Evidence & {
  id: string;
  priority: RiskLevel;
  issue: string;
  ask: string;
  fallbackLanguage: string;
  emailReadyWording: string;
  relatedClause: string;
};

export type RedlineSuggestion = {
  id: string;
  clauseTitle: string;
  currentLanguage: string;
  issue: string;
  proposedLanguage: string;
  negotiatingRationale: string;
  priority: RiskLevel;
};

export type RiskCategory = {
  name: string;
  level: RiskLevel;
  count: number;
  summary: string;
};

export type WalkAwayCondition = {
  id: string;
  term: string;
  classification: "deal_breaker" | "strongly_negotiate" | "acceptable_as_is";
  reason: string;
  ifKept: string;
};

export type AgreementAnalysis = {
  signerPerspective: string;
  preflightFocus: string;
  sourceContext: string;
  documentType: string;
  agreementTitle: string;
  jurisdiction: string;
  effectiveDate: string;
  expirationDate: string;
  parties: Party[];
  purpose: string;
  plainEnglishSummary: string;
  commitments: Commitment[];
  payments: Payment[];
  penalties: Penalty[];
  importantClauses: ImportantClause[];
  risks: RiskItem[];
  riskCategories: RiskCategory[];
  recommendations: Recommendation[];
  questionsToAskBeforeSigning: string[];
  missingOrVagueTerms: MissingTerm[];
  signingDecision: SigningDecision;
  walkAwayConditions: WalkAwayCondition[];
  negotiationBrief: NegotiationAction[];
  redlines: RedlineSuggestion[];
  counselBrief: string;
  userFriendlyTakeaway: string;
  disclaimer: string;
};

export type AnalysisResponse = {
  extractedText: string;
  metadata: {
    fileName: string;
    fileType: string;
    pageCount: number;
  };
  analysis: AgreementAnalysis;
};

export type QaAnswer = {
  answer: string;
  whatTheAgreementSays: string;
  whatIsUnclear: string;
  recommendedNextStep: string;
};

// ── Escrow & Milestones ──────────────────────────────────────────────────────

export type EscrowStatus = "pending" | "active" | "released" | "disputed";
export type MilestoneStatus = "pending" | "in_progress" | "completed";

export type EscrowContract = {
  id: string;
  userId: string;
  analysisId: string | null;
  title: string;
  counterparty: string;
  totalAmount: number;
  currency: string;
  status: EscrowStatus;
  notes: string | null;
  creatorConfirmed: boolean;
  counterpartyConfirmed: boolean;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Milestone = {
  id: string;
  escrowId: string;
  title: string;
  description: string | null;
  amount: number | null;
  dueDate: string | null;
  status: MilestoneStatus;
  completedAt: string | null;
  sortOrder: number;
  createdAt: string;
};

export type EscrowWithMilestones = EscrowContract & { milestones: Milestone[] };

// ── Change Orders ─────────────────────────────────────────────────────────────

export type ChangeOrderStatus = "proposed" | "accepted" | "rejected";

export type ChangeOrder = {
  id: string;
  escrowId: string;
  title: string;
  description: string | null;
  amountDelta: number;
  status: ChangeOrderStatus;
  shareToken: string | null;
  createdAt: string;
  updatedAt: string;
};

// ── Audit Log ────────────────────────────────────────────────────────────────

export type EscrowEvent = {
  id: string;
  actor: string;
  eventType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

// ── Rate Card ─────────────────────────────────────────────────────────────────

export type RateCardItem = {
  id: string;
  userId: string;
  category: string;
  label: string;
  value: string;
  notes: string | null;
  sortOrder: number;
  createdAt: string;
};
