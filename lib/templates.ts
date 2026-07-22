export type Template = {
  id: string;
  category: string;
  clauseTitle: string;
  issue: string;
  redFlag: string;
  standardLanguage: string;
  notes: string;
};

export const TEMPLATE_CATEGORIES = ["NDA", "MSA / Services", "Employment", "Lease / Rental"] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export const templates: Template[] = [
  // NDA
  {
    id: "nda-1",
    category: "NDA",
    clauseTitle: "One-way vs. mutual confidentiality",
    issue: "Agreement only protects one party's information.",
    redFlag: "Look for \"Disclosing Party\" and \"Receiving Party\" flowing one direction only.",
    standardLanguage:
      "Both parties agree to keep each other's Confidential Information strictly confidential and not to disclose it to any third party without the other party's prior written consent.",
    notes: "If you're sharing your information too, push for a mutual NDA.",
  },
  {
    id: "nda-2",
    category: "NDA",
    clauseTitle: "Definition of confidential information",
    issue: "Definition is overbroad — anything shared verbally or in writing is covered with no marking requirement.",
    redFlag: "\"All information disclosed\" or \"any information shared in connection with\" with no marking or designation requirement.",
    standardLanguage:
      "\"Confidential Information\" means information designated in writing as confidential at the time of disclosure, or if disclosed orally, identified as confidential and confirmed in writing within 10 business days.",
    notes: "Marking requirements protect you from accidental confidentiality obligations on casual conversations.",
  },
  {
    id: "nda-3",
    category: "NDA",
    clauseTitle: "Term and survival",
    issue: "Confidentiality obligations survive indefinitely — no sunset.",
    redFlag: "\"Obligations survive termination\" with no time limit.",
    standardLanguage:
      "Confidentiality obligations shall survive for 3 years following termination of this Agreement, except for trade secrets which shall survive indefinitely.",
    notes: "Perpetual NDAs are a significant long-term liability. Negotiate a 3–5 year cap.",
  },
  {
    id: "nda-4",
    category: "NDA",
    clauseTitle: "Compelled disclosure carve-out",
    issue: "No exception for legally compelled disclosure (subpoena, court order).",
    redFlag: "No mention of legal process, court orders, or regulatory requirements in permitted disclosures.",
    standardLanguage:
      "A party may disclose Confidential Information if required by applicable law or court order, provided it (i) gives prompt prior written notice, (ii) cooperates with the other party's efforts to obtain a protective order, and (iii) discloses only what is legally required.",
    notes: "Without this carve-out, complying with a court order could itself be a breach.",
  },
  // MSA / Services
  {
    id: "msa-1",
    category: "MSA / Services",
    clauseTitle: "Limitation of liability cap",
    issue: "No cap on liability — either party faces potentially unlimited damages.",
    redFlag: "Absence of a liability cap, or exclusions that swallow the cap entirely.",
    standardLanguage:
      "Neither party's total aggregate liability arising out of or related to this Agreement shall exceed the total fees paid or payable in the 12 months immediately preceding the claim.",
    notes: "12-month fee cap is standard market position. Push back on anything higher.",
  },
  {
    id: "msa-2",
    category: "MSA / Services",
    clauseTitle: "Work product and IP ownership",
    issue: "Vendor retains ownership of all deliverables — client gets a license only.",
    redFlag: "\"Vendor retains all IP\" or \"license only\" language in the deliverables section.",
    standardLanguage:
      "All work product and deliverables created specifically for Client under this Agreement shall be works made for hire and owned exclusively by Client. Vendor retains ownership of its pre-existing tools, frameworks, and background IP.",
    notes: "Always include the pre-existing IP carve-out — vendors can't transfer what they don't own.",
  },
  {
    id: "msa-3",
    category: "MSA / Services",
    clauseTitle: "Termination for convenience",
    issue: "No right to terminate without cause — locked in for the full term regardless of performance.",
    redFlag: "Only \"for cause\" termination rights or no termination clause at all.",
    standardLanguage:
      "Either party may terminate this Agreement for any reason upon 30 days' prior written notice. Client shall pay for all services rendered and expenses incurred through the effective termination date.",
    notes: "Without this, the relationship is a one-way trap. 30-day notice is the standard.",
  },
  {
    id: "msa-4",
    category: "MSA / Services",
    clauseTitle: "Invoice dispute process",
    issue: "No process for disputing invoices — payment is due in full even for disputed amounts.",
    redFlag: "\"All invoices due within X days\" with no dispute or hold mechanism.",
    standardLanguage:
      "Client may dispute an invoice in good faith by (i) paying the undisputed portion when due, (ii) providing written notice of the disputed amount and basis within 10 days of receipt, and (iii) working in good faith to resolve the dispute within 30 days.",
    notes: "Without this, withholding any payment — even legitimately — may constitute breach.",
  },
  // Employment
  {
    id: "emp-1",
    category: "Employment",
    clauseTitle: "Non-compete scope",
    issue: "Non-compete is overbroad in geography, duration, or activity — effectively blacklists you from your industry.",
    redFlag: "\"Any competitive business\" + \"worldwide\" or duration over 12 months.",
    standardLanguage:
      "Employee agrees not to engage in any business that directly competes with Employer's core products within [specific territory] for a period of 12 months following termination.",
    notes: "Courts frequently void overbroad non-competes. Narrow scope now — it's better protection for them too.",
  },
  {
    id: "emp-2",
    category: "Employment",
    clauseTitle: "IP assignment — prior inventions carve-out",
    issue: "IP assignment covers everything you've ever created, including pre-existing personal work.",
    redFlag: "\"All inventions, discoveries, and works\" with no carve-out for prior inventions.",
    standardLanguage:
      "Employee assigns to Employer all IP created during employment using Employer resources or relating to Employer's business. Excluded from this assignment are the prior inventions listed in Schedule A, attached hereto.",
    notes: "Attach a Prior Inventions Schedule before signing. Protects your side projects and prior portfolio.",
  },
  {
    id: "emp-3",
    category: "Employment",
    clauseTitle: "At-will termination and severance",
    issue: "At-will employment with no severance — terminated with no notice and no pay.",
    redFlag: "\"Employment is at-will\" with no accompanying severance provision.",
    standardLanguage:
      "In the event of termination without cause, Employee shall receive severance equal to [X] weeks per year of service, subject to signing a release of claims. Employer shall provide at least 2 weeks' advance written notice or pay in lieu thereof.",
    notes: "Standard negotiated severance is 2–4 weeks per year of service. Get it in writing at hire.",
  },
  {
    id: "emp-4",
    category: "Employment",
    clauseTitle: "Mandatory arbitration and class waiver",
    issue: "All disputes go to binding arbitration and you waive the right to class or collective action.",
    redFlag: "\"All disputes shall be resolved by binding arbitration\" combined with a \"class action waiver\".",
    standardLanguage:
      "The parties shall attempt in good faith to resolve disputes informally for 30 days. Any remaining disputes shall be submitted to mediation before arbitration. Nothing herein waives any rights under applicable employment law, including participation in class or collective actions.",
    notes: "Class action waivers are unenforceable for NLRA claims in many US jurisdictions. Know your state law.",
  },
  // Lease / Rental
  {
    id: "lease-1",
    category: "Lease / Rental",
    clauseTitle: "Maintenance and repair allocation",
    issue: "Tenant bears responsibility for all repairs including structural elements and major systems.",
    redFlag: "\"Tenant shall maintain premises in good repair\" with no carve-out for landlord obligations.",
    standardLanguage:
      "Landlord shall maintain and repair the building structure, roof, HVAC systems, plumbing, electrical systems, and all common areas. Tenant is responsible only for damage caused by Tenant's misuse or negligence.",
    notes: "HVAC alone can run thousands of dollars. Get landlord responsibility in writing before signing.",
  },
  {
    id: "lease-2",
    category: "Lease / Rental",
    clauseTitle: "Annual rent escalation cap",
    issue: "Rent can increase without limit at the landlord's discretion each year.",
    redFlag: "\"Rent subject to annual adjustment\" or \"at prevailing market rate\" with no ceiling.",
    standardLanguage:
      "Annual rent increases shall not exceed the lesser of (i) 3% or (ii) the percentage change in the applicable CPI index for the preceding 12-month period.",
    notes: "Without a cap, you could face 20%+ increases in competitive markets. Non-negotiable in most situations.",
  },
  {
    id: "lease-3",
    category: "Lease / Rental",
    clauseTitle: "Early termination right",
    issue: "No exit clause — breaking the lease means paying all remaining months in full.",
    redFlag: "No early termination provision, or \"Tenant liable for the entire remaining term\" language.",
    standardLanguage:
      "Tenant may terminate this Lease upon 60 days' prior written notice by paying an early termination fee equal to 2 months' rent. Landlord shall use commercially reasonable efforts to mitigate damages by re-letting the premises.",
    notes: "2–3 months as a termination fee is market. The mitigation duty is legally required in most states anyway.",
  },
  {
    id: "lease-4",
    category: "Lease / Rental",
    clauseTitle: "Security deposit return timeline",
    issue: "No deadline for returning security deposit — landlord can hold it indefinitely.",
    redFlag: "Security deposit section with no return deadline or itemization requirement.",
    standardLanguage:
      "Landlord shall return the security deposit, with a written itemization of any deductions, within 21 days of lease termination and Tenant's vacation of the premises. Failure to provide an itemization within this period forfeits Landlord's right to make any deductions.",
    notes: "Most states mandate 14–30 days by statute. Know your local law — the forfeiture clause adds teeth.",
  },
];
