import type { AgreementAnalysis, RiskLevel } from "./types";

export type DeadlineItem = {
  kind: "agreement" | "commitment" | "payment";
  label: string;
  due: string;
  owner: string;
  riskLevel?: RiskLevel;
};

export function buildDeadlineItems(analysis: AgreementAnalysis): DeadlineItem[] {
  return [
    ...(analysis.effectiveDate
      ? [{ kind: "agreement" as const, label: "Agreement starts", due: analysis.effectiveDate, owner: "All parties" }]
      : []),
    ...(analysis.expirationDate
      ? [{ kind: "agreement" as const, label: "Agreement ends", due: analysis.expirationDate, owner: "All parties" }]
      : []),
    ...(analysis.commitments || [])
      .filter((item) => item.deadline)
      .map((item) => ({
        kind: "commitment" as const,
        label: item.commitment || "Commitment",
        due: item.deadline,
        owner: item.party || "Not specified",
        riskLevel: item.riskLevel
      })),
    ...(analysis.payments || [])
      .filter((item) => item.dueDate || item.trigger)
      .map((item) => ({
        kind: "payment" as const,
        label: `${item.payer || "Payer"} pays ${item.receiver || "receiver"}${item.amount ? ` ${item.amount} ${item.currency}` : ""}`,
        due: item.dueDate || item.trigger,
        owner: item.payer || "Not specified",
        riskLevel: item.riskLevel
      }))
  ];
}
