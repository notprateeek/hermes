import Link from "next/link";
import {
  ShieldAlert, FileSearch, Lock, CheckCircle2, ArrowRight,
  DollarSign, BarChart3, FileSignature, Palette, GitBranch,
  Sparkles, CalendarClock, AlertTriangle, Clock, Tag,
  Scale, Activity, TrendingUp, Workflow, Users,
} from "lucide-react";

// ── Animated document scanner ─────────────────────────────────────────────────
function DocumentScanner() {
  return (
    <div className="relative w-full max-w-[520px] overflow-hidden rounded-xl border border-white/[0.06] bg-[rgb(var(--surface))]">
      <div className="scan-bar-el" />
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
        </div>
        <span className="ml-2 text-[11px] font-medium uppercase tracking-[0.18em] text-text-muted">
          Freelance Design Contract · 12pp
        </span>
        <div className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full border border-clause/25 bg-clause/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-clause" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-clause">Analyzing</span>
        </div>
      </div>
      <div className="p-6 font-mono text-[13px] leading-[1.85]">
        <p className="text-text-muted/60">
          <span className="text-text-muted/40 select-none">8.2 </span>
          Client may terminate this agreement at any time upon{" "}
          <span className="clause-hl px-0.5">48 hours written notice,</span>{" "}
          without cause,{" "}
          <span className="clause-hl px-0.5">with no obligation to compensate for work in progress</span>{" "}
          beyond milestones formally delivered and accepted.
        </p>
      </div>
      <div className="finding-reveal border-t border-white/[0.06] bg-[rgba(255,79,31,0.04)] p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert size={15} className="mt-0.5 shrink-0 text-clause" />
          <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-clause">
              Hermes · Negotiate First
            </p>
            <p className="text-sm leading-6 text-text-primary">
              Kill clause with no payment protection.{" "}
              <span className="text-clause">48-hour termination</span> with zero
              compensation for in-progress work exposes you to scope theft.
              Negotiate a kill fee of at least 50% for work in progress.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Contract Preflight product mock ───────────────────────────────────────────
function PreflightMock() {
  return (
    <div className="w-full max-w-[560px] overflow-hidden rounded-xl border border-border bg-surface">
      {/* Verdict */}
      <div className="border-b border-amber/20 bg-amber/[0.04] p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              Signing decision · Contractor
            </p>
            <p className="mt-1.5 text-[15px] font-normal italic leading-snug text-text-primary">
              Do not sign with this termination clause. A 48-hour kill
              with no kill fee is scope theft waiting to happen.
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-amber/30 bg-amber/10 px-2 py-1 text-[10px] font-semibold text-amber whitespace-nowrap">
            Negotiate first
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["48h termination, no kill fee", "Vague acceptance criteria"].map((b) => (
            <span key={b} className="rounded-full border border-border bg-surface px-2.5 py-1 text-[10px] text-text-muted">
              {b}
            </span>
          ))}
        </div>
        <p className="mt-3 border-t border-border/40 pt-2.5 text-xs font-medium text-text-primary">
          → Get these 2 clauses rewritten before signing.
        </p>
      </div>

      {/* Walk-away */}
      <div className="border-b border-border p-4">
        <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          Term-by-term verdict
        </p>
        <div className="grid gap-1.5">
          {[
            { term: "Termination clause", cls: "deal_breaker", label: "Deal breaker", color: "border-danger/30 bg-danger/5 text-danger" },
            { term: "Acceptance criteria", cls: "negotiate", label: "Negotiate hard", color: "border-amber/30 bg-amber/10 text-amber" },
            { term: "IP ownership", cls: "ok", label: "Acceptable", color: "border-teal/30 bg-teal/10 text-teal" },
          ].map((t) => (
            <div key={t.term} className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 ${t.color}`}>
              <p className="text-xs font-medium">{t.term}</p>
              <span className="shrink-0 rounded border border-current/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Redline */}
      <div className="p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
            Redline · Termination clause
          </p>
          <span className="rounded border border-danger/30 bg-danger/5 px-1.5 py-0.5 text-[9px] font-bold text-danger">HIGH</span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-md bg-danger/5 p-2.5">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-danger/70">Current language</p>
            <p className="font-mono text-[11px] italic leading-[1.7] text-text-muted">
              &ldquo;...may terminate at any time upon 48 hours written notice, with no obligation to compensate...&rdquo;
            </p>
          </div>
          <div className="rounded-md bg-teal/5 p-2.5">
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-teal/70">Proposed language</p>
            <p className="font-mono text-[11px] leading-[1.7] text-text-primary">
              &ldquo;...may terminate with 30 days written notice and shall pay a kill fee equal to 50% of fees for work in progress...&rdquo;
            </p>
          </div>
        </div>
        <p className="mt-2.5 text-[10px] text-text-muted">
          Why: Protects against scope theft on in-progress work — without this, you work for free on termination.
        </p>
      </div>
    </div>
  );
}

// ── Escrow & milestones product mock ─────────────────────────────────────────
function EscrowMock() {
  return (
    <div className="w-full max-w-[480px] overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <p className="font-semibold text-text-primary">Northstar Labs</p>
          <p className="text-[11px] text-text-muted">Website redesign · 3 milestones</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-lg font-bold tabular-nums text-text-primary">$8,500</p>
          <span className="rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">
            Active
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 py-3 border-b border-border">
        <div className="mb-1.5 flex items-center justify-between text-[10px] text-text-muted">
          <span>Progress</span>
          <span className="tabular-nums font-mono">$2,000 of $8,500 released</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
          <div className="h-full rounded-full bg-teal" style={{ width: "23.5%" }} />
        </div>
      </div>

      {/* Milestones */}
      <div className="divide-y divide-border">
        {[
          { title: "Discovery & wireframes", amount: "$2,000", note: "Accepted Jul 3", status: "completed" },
          { title: "UI design", amount: "$3,500", note: "In review", status: "in_progress" },
          { title: "Development handoff", amount: "$3,000", note: "Pending delivery", status: "pending" },
        ].map((m) => (
          <div key={m.title} className="flex items-center gap-3 px-5 py-3.5">
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                m.status === "completed"
                  ? "border-teal bg-teal/20"
                  : m.status === "in_progress"
                  ? "border-clause bg-clause/10"
                  : "border-border"
              }`}
            >
              {m.status === "completed" && (
                <span className="h-2 w-2 rounded-full bg-teal" />
              )}
              {m.status === "in_progress" && (
                <span className="h-2 w-2 animate-pulse rounded-full bg-clause" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-medium ${
                  m.status === "completed" ? "text-text-muted line-through" : "text-text-primary"
                }`}
              >
                {m.title}
              </p>
              <p className="text-[11px] text-text-muted">{m.note}</p>
            </div>
            <span
              className={`shrink-0 font-mono text-xs tabular-nums ${
                m.status === "completed" ? "text-teal" : "text-text-muted"
              }`}
            >
              {m.amount}
            </span>
          </div>
        ))}
      </div>

      {/* Change order */}
      <div className="border-t border-border bg-surface-raised px-5 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Workflow size={11} className="shrink-0" />
            Change order: +$750 — additional mobile screens
          </div>
          <span className="rounded-full border border-teal/30 bg-teal/10 px-2 py-0.5 text-[10px] font-semibold text-teal">
            Accepted
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Intelligence product mock ─────────────────────────────────────────────────
function IntelligenceMock() {
  return (
    <div className="w-full max-w-[500px] space-y-3">
      {/* Analytics tiles */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Active value", value: "$24,500", color: "text-text-primary" },
          { label: "Released", value: "$41,200", color: "text-teal" },
          { label: "Clients", value: "8", color: "text-text-primary" },
        ].map((t) => (
          <div key={t.label} className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">{t.label}</p>
            <p className={`mt-1 font-mono text-lg font-bold tabular-nums ${t.color}`}>{t.value}</p>
          </div>
        ))}
      </div>

      {/* Client health */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Client health</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { name: "Northstar Labs", contracts: 3, value: "$24,500", dot: "bg-teal", sub: "3 completed" },
            { name: "Apex Creative", contracts: 1, value: "$3,200", dot: "bg-danger", sub: "1 disputed", flag: true },
            { name: "MindfulOS", contracts: 2, value: "$11,000", dot: "bg-teal", sub: "Active" },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-3 px-4 py-3">
              <span className={`h-2 w-2 shrink-0 rounded-full ${c.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{c.name}</p>
                <p className={`text-[11px] ${c.flag ? "text-danger" : "text-text-muted"}`}>{c.sub}</p>
              </div>
              <span className="font-mono tabular-nums text-xs font-semibold text-text-muted">{c.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deadlines */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Upcoming deadlines</p>
        </div>
        <div className="divide-y divide-border">
          {[
            { title: "UI design delivery", escrow: "Northstar Labs", chip: "2d overdue", chipCls: "bg-danger/15 text-danger", icon: "danger" },
            { title: "API integration docs", escrow: "MindfulOS", chip: "5d left", chipCls: "bg-gold/15 text-gold", icon: "soon" },
          ].map((d) => (
            <div key={d.title} className="flex items-center gap-3 px-4 py-3">
              {d.icon === "danger"
                ? <AlertTriangle size={13} className="shrink-0 text-danger" />
                : <Clock size={13} className="shrink-0 text-gold" />}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary">{d.title}</p>
                <p className="text-[11px] text-text-muted">{d.escrow}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${d.chipCls}`}>{d.chip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Landing page ──────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-bg">

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/[0.04] bg-bg/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-clause">
              <span className="font-display text-xs italic text-white">H</span>
            </div>
            <span className="font-display text-sm italic text-text-primary">Hermes</span>
          </div>
          <div className="hidden items-center gap-6 text-sm text-text-muted md:flex">
            <a href="#features" className="transition-colors hover:text-text-primary">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-text-primary">How it works</a>
            <a href="#roadmap" className="transition-colors hover:text-text-primary">Roadmap</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="text-sm text-text-muted transition-colors hover:text-text-primary">
              Sign in
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 rounded-lg bg-clause px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="dot-grid relative flex min-h-screen items-center overflow-hidden pt-16">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 70% at 20% 50%, rgba(255,79,31,0.07) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto flex w-full max-w-7xl flex-col items-start gap-14 px-6 py-20 lg:flex-row lg:items-center lg:gap-20 lg:py-0">
          <div className="flex max-w-xl flex-col gap-6">
            <p className="animate-fade-in text-[11px] font-semibold uppercase tracking-[0.25em] text-clause">
              Contract intelligence for freelancers
            </p>
            <h1
              className="animate-slide-up font-display text-5xl font-normal leading-[1.05] text-text-primary lg:text-6xl"
              style={{ fontStyle: "italic" }}
            >
              Read before you sign.{" "}
              <span style={{ color: "rgb(var(--clause))" }}>
                Get paid for what you deliver.
              </span>
            </h1>
            <p className="animate-fade-in max-w-md text-lg leading-8 text-text-muted">
              Upload a contract and get a signing verdict, clause rewrites, and a
              lawyer-ready brief in under 60 seconds. Escrow, milestones, and
              business intelligence handle everything after.
            </p>
            <div className="animate-fade-in flex flex-wrap items-center gap-3">
              <Link
                href="/sign-in"
                className="flex items-center gap-2 rounded-xl bg-clause px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90"
              >
                Start free <ArrowRight size={14} />
              </Link>
              <a
                href="#how-it-works"
                className="rounded-xl border border-border px-5 py-3 text-sm font-medium text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
              >
                How it works
              </a>
            </div>
            {/* Fact pills */}
            <div className="flex flex-wrap gap-2 text-[11px]">
              {[
                { label: "PDF, DOCX, or paste text" },
                { label: "Verdict in under 60 seconds" },
                { label: "No escrow minimum" },
              ].map((p) => (
                <span key={p.label} className="rounded-full border border-border bg-surface px-3 py-1.5 text-text-muted">
                  {p.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex w-full justify-center lg:flex-1 lg:justify-end">
            <DocumentScanner />
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                num: "71%",
                label: "of freelancers have experienced late or unpaid work",
                src: "Freelancers Union",
              },
              {
                num: "1 in 3",
                label: "payment disputes trace back to vague scope language in the original contract",
                src: "Upwork survey",
              },
              {
                num: "$6,000+",
                label: "median annual income lost to payment issues per freelancer",
                src: "Freelancers Union",
              },
            ].map((s) => (
              <div key={s.num} className="flex flex-col gap-1">
                <p className="font-mono text-4xl font-bold tabular-nums text-clause">{s.num}</p>
                <p className="text-sm leading-6 text-text-muted">{s.label}</p>
                <p className="text-[10px] text-text-muted/50">Source: {s.src}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three problems ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <p className="mb-12 text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-text-muted">
          Why freelancers keep losing
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            {
              icon: FileSearch,
              accent: "text-clause",
              border: "border-clause/20",
              bg: "bg-clause/5",
              pain: "You signed a clause that cost you.",
              fix: "The contract was 12 pages. You skimmed 4. The kill clause was on page 9 — the one that let the client walk away without paying for work in progress.",
              feature: "Contract Preflight",
            },
            {
              icon: DollarSign,
              accent: "text-gold",
              border: "border-gold/20",
              bg: "bg-gold/5",
              pain: "You finished the work. The invoice sat for 90 days.",
              fix: "No contract clause protects you if the money was never held anywhere. When the client ghosts, your leverage is zero. Escrow reverses this entirely — funds are held before you start.",
              feature: "Payment Escrow",
            },
            {
              icon: BarChart3,
              accent: "text-teal",
              border: "border-teal/20",
              bg: "bg-teal/5",
              pain: "The scope crept. Your rate didn't move.",
              fix: "Three extra rounds of revision. A second language. 'Just one more thing.' Without a formal change order process, every request is free work dressed as goodwill.",
              feature: "Milestone Tracker",
            },
          ].map(({ icon: Icon, accent, border, bg, pain, fix, feature }) => (
            <div key={feature} className={`flex flex-col gap-4 rounded-xl border ${border} ${bg} p-6`}>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg border ${border} bg-bg`}>
                <Icon size={16} className={accent} />
              </div>
              <p className="text-base font-semibold leading-snug text-text-primary">{pain}</p>
              <p className="flex-1 text-sm leading-7 text-text-muted">{fix}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${accent}`}>{feature} →</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature: Contract Preflight ───────────────────────────────────── */}
      <section id="features" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Text */}
            <div className="flex flex-col gap-8">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-clause">
                  Contract Preflight
                </p>
                <h2 className="font-display text-4xl font-normal italic leading-tight text-text-primary">
                  Know exactly what you&apos;re signing before you click agree.
                </h2>
                <p className="mt-4 text-base leading-8 text-text-muted">
                  Upload a PDF, DOCX, or paste the text. Hermes reads every clause
                  against your role and deal type — and gives you a full intelligence
                  report, not just a risk score.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    icon: Scale,
                    title: "Signing verdict",
                    desc: "Safe to sign, negotiate first, or do not sign without counsel — grounded in the specific clauses that drive the call.",
                  },
                  {
                    icon: AlertTriangle,
                    title: "Risk by category",
                    desc: "Risks grouped by payment, IP, termination, liability, and scope — each category rated with a severity level and clause count.",
                  },
                  {
                    icon: FileSearch,
                    title: "Term-by-term verdict",
                    desc: "Every major term classified: deal breaker, negotiate hard, or acceptable as-is. Know where to stand firm.",
                  },
                  {
                    icon: Activity,
                    title: "Redline suggestions",
                    desc: "Full clause rewrites — not directions, but actual replacement language ready to paste into the contract.",
                  },
                  {
                    icon: Users,
                    title: "Counsel brief",
                    desc: "A 3–5 paragraph brief written for your lawyer. Summarizes the deal, flags the blockers, lists the redlines. One tap to forward.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Q&A",
                    desc: 'Ask anything about the contract. "Who owns the IP if I use open source?" "What triggers the late fee?"',
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-clause/20 bg-clause/5">
                      <Icon size={13} className="text-clause" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-text-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/sign-in"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-clause/30 bg-clause/5 px-4 py-2.5 text-sm font-semibold text-clause transition-colors hover:bg-clause/10"
              >
                Analyze a contract free <ArrowRight size={13} />
              </Link>
            </div>
            {/* Mock */}
            <div className="flex justify-center lg:justify-end lg:pt-2">
              <PreflightMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature: Payment Escrow ───────────────────────────────────────── */}
      <section className="border-t border-border bg-bg">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Mock first on desktop */}
            <div className="order-2 flex justify-center lg:order-1 lg:justify-start lg:pt-2">
              <EscrowMock />
            </div>
            {/* Text */}
            <div className="order-1 flex flex-col gap-8 lg:order-2">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">
                  Payment Escrow
                </p>
                <h2 className="font-display text-4xl font-normal italic leading-tight text-text-primary">
                  Client funds held before you start. Released when you deliver.
                </h2>
                <p className="mt-4 text-base leading-8 text-text-muted">
                  Both parties confirm before the contract activates. Your client
                  gets a live project portal showing milestone progress — no Hermes
                  account needed. Scope changes go through formal change orders with
                  counterparty approval.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    icon: Lock,
                    title: "Two-party confirmation",
                    desc: "Neither party can activate the contract unilaterally. Both confirm before funds are held and work starts.",
                  },
                  {
                    icon: Workflow,
                    title: "Milestone releases",
                    desc: "Break the project into deliverables. Each milestone releases its share of the escrow when marked complete.",
                  },
                  {
                    icon: Activity,
                    title: "Change orders",
                    desc: "Every scope change goes through a formal change order. Your client approves via a link — no login required.",
                  },
                  {
                    icon: Users,
                    title: "Client portal",
                    desc: "Your client sees live project status, milestone completion, and change orders. Signed link, no account needed.",
                  },
                  {
                    icon: FileSearch,
                    title: "Import from contract",
                    desc: "Hermes reads your contract analysis and imports deliverables as milestones — with due dates and acceptance criteria.",
                  },
                  {
                    icon: TrendingUp,
                    title: "Invoice generation",
                    desc: "Generate a professional invoice from any escrow in one click, pre-filled with milestones and amounts.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gold/20 bg-gold/5">
                      <Icon size={13} className="text-gold" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-text-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/sign-in"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 px-4 py-2.5 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
              >
                Set up an escrow free <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature: Business Intelligence ────────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            {/* Text */}
            <div className="flex flex-col gap-8">
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-teal">
                  Business Intelligence
                </p>
                <h2 className="font-display text-4xl font-normal italic leading-tight text-text-primary">
                  Your whole freelance practice, visible at a glance.
                </h2>
                <p className="mt-4 text-base leading-8 text-text-muted">
                  Know which clients have a history of disputes before they become
                  a problem. Track every upcoming deadline across all active
                  contracts in one place. See monthly revenue broken down by
                  released escrows.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                {[
                  {
                    icon: Users,
                    title: "Client health scores",
                    desc: "Green, amber, or red — based on dispute history and completion rate. Know who to work with again.",
                  },
                  {
                    icon: CalendarClock,
                    title: "Deadline tracker",
                    desc: "Every milestone due date across every active contract. Overdue items surface immediately.",
                  },
                  {
                    icon: BarChart3,
                    title: "Revenue analytics",
                    desc: "Monthly revenue from released escrows, active value held, and average contract size. Your numbers in one view.",
                  },
                  {
                    icon: Tag,
                    title: "Rate card",
                    desc: "Your standard services and pricing. Reference it when scoping, or import rates directly when building a contract.",
                  },
                  {
                    icon: Activity,
                    title: "Activity log",
                    desc: "Every status change, milestone update, and change order on every contract — timestamped and immutable.",
                  },
                  {
                    icon: FileSearch,
                    title: "Contract vault",
                    desc: "Every past analysis is stored and searchable. Surface any past agreement in seconds.",
                  },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-teal/20 bg-teal/5">
                      <Icon size={13} className="text-teal" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{title}</p>
                      <p className="mt-0.5 text-xs leading-5 text-text-muted">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/sign-in"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-teal/30 bg-teal/5 px-4 py-2.5 text-sm font-semibold text-teal transition-colors hover:bg-teal/10"
              >
                See the intelligence dashboard <ArrowRight size={13} />
              </Link>
            </div>
            {/* Mock */}
            <div className="flex justify-center lg:justify-end lg:pt-2">
              <IntelligenceMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-border bg-bg">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-16 text-center">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-text-muted">
              How it works
            </p>
            <h2 className="font-display text-4xl font-normal italic text-text-primary">
              From upload to payment released — in one place.
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                label: "Upload or paste",
                sub: "PDF, DOCX, or paste the contract text. Hermes extracts every clause, party, and obligation.",
                color: "text-text-muted",
                accent: "",
              },
              {
                step: "02",
                label: "Get the verdict",
                sub: "Signing decision, risk heatmap by category, term-by-term classification, redline suggestions, and counsel brief.",
                color: "text-clause",
                accent: "bg-clause/5",
              },
              {
                step: "03",
                label: "Negotiate from a position",
                sub: "Copy the email wording, paste in the proposed clause language, or forward the counsel brief. Hermes writes the words.",
                color: "text-clause",
                accent: "bg-clause/5",
              },
              {
                step: "04",
                label: "Activate escrow",
                sub: "Both parties confirm. Funds are held. Your client gets a live portal link — no account needed.",
                color: "text-gold",
                accent: "bg-gold/5",
              },
              {
                step: "05",
                label: "Deliver by milestone",
                sub: "Complete milestones one at a time. Each completion releases its share of the escrow. Scope changes go through formal change orders.",
                color: "text-teal",
                accent: "bg-teal/5",
              },
              {
                step: "06",
                label: "Payment released",
                sub: "Final milestone triggers final release. All of it is recorded in the activity log. The contract is archived in your vault.",
                color: "text-teal",
                accent: "bg-teal/5",
              },
            ].map(({ step, label, sub, color, accent }) => (
              <div key={step} className={`flex flex-col gap-3 bg-surface p-6 ${accent}`}>
                <p className={`font-mono text-2xl font-bold tabular-nums ${color}`}>{step}</p>
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="text-xs leading-6 text-text-muted">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison: before / after ────────────────────────────────────── */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-24">
          <div className="mb-14 text-center">
            <h2 className="font-display text-4xl font-normal italic text-text-primary">
              The difference Hermes makes.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-bg p-6">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-text-muted">Without Hermes</p>
              <ul className="space-y-3">
                {[
                  "Skim the contract, miss the kill clause on page 9",
                  "Sign, start work, deliver — invoice ignored for 90 days",
                  "Scope creeps, you absorb it to stay professional",
                  "Client dispute: you have email threads, they have a lawyer",
                  "Chase payment manually, lose leverage, take a partial",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-danger/60" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-teal/20 bg-teal/[0.03] p-6">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-teal">With Hermes</p>
              <ul className="space-y-3">
                {[
                  "Upload contract, get verdict + redlines in 60 seconds",
                  "Escrow activated before work starts — funds are held",
                  "Every scope change triggers a formal change order",
                  "Dispute? The activity log timestamps every delivery",
                  "Milestone complete → funds released automatically",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-sm text-text-muted">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coming next ───────────────────────────────────────────────────── */}
      <section id="roadmap" className="border-t border-border bg-bg">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="mb-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Sparkles size={13} className="text-gold" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold">On the roadmap</p>
              </div>
              <h2 className="font-display text-3xl font-normal italic text-text-primary">
                The full contract lifecycle is coming.
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-7 text-text-muted">
                E-signatures, Figma and GitHub integrations, and email notifications
                are in active development. Everything ships to the same platform —
                no new accounts, no new logins.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="hidden shrink-0 items-center gap-1.5 text-xs text-text-muted transition-colors hover:text-text-primary sm:flex"
            >
              See full roadmap <ArrowRight size={11} />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {[
              {
                icon: FileSignature,
                label: "E-Signature",
                stage: "At execution",
                desc: "Sign agreements within Hermes. Cryptographically timestamped, legally binding. Your counterparty signs from any device — no account required, just a link.",
                color: "#a855f7",
                border: "rgba(168,85,247,0.2)",
                bg: "rgba(168,85,247,0.04)",
              },
              {
                icon: Palette,
                label: "Figma Connect",
                stage: "Design handoff",
                desc: "Link Figma projects to contract milestones. Marking a design delivered closes the milestone and triggers payment — no middle step, no he-said-she-said.",
                color: "#f59e0b",
                border: "rgba(245,158,11,0.2)",
                bg: "rgba(245,158,11,0.04)",
              },
              {
                icon: GitBranch,
                label: "GitHub Connect",
                stage: "Code delivery",
                desc: "Connect your repo to the agreement. Merged PRs, tagged releases, or deploy events automatically satisfy delivery milestones and release payment.",
                color: "#3ecf8e",
                border: "rgba(62,207,142,0.2)",
                bg: "rgba(62,207,142,0.04)",
              },
            ].map(({ icon: Icon, label, stage, desc, color, border, bg }) => (
              <div
                key={label}
                className="relative overflow-hidden rounded-xl border p-5"
                style={{ borderColor: border, background: bg }}
              >
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: color }} />
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                    style={{ borderColor: border, background: `${color}18` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: `${color}15`, color, border: `1px solid ${border}` }}
                  >
                    {stage}
                  </span>
                </div>
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="mt-2 text-xs leading-6 text-text-muted">{desc}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-semibold" style={{ color }}>
                  <Sparkles size={10} />
                  Coming soon
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="dot-grid relative overflow-hidden border-t border-border bg-surface">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(255,79,31,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-6 py-28 text-center">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.25em] text-clause">
            Start today
          </p>
          <h2
            className="font-display text-5xl font-normal leading-tight text-text-primary"
            style={{ fontStyle: "italic" }}
          >
            Stop reading contracts blind.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg leading-8 text-text-muted">
            Upload your next contract and get the signing verdict, the redlines,
            and the escrow setup — before you sign a word.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-in"
              className="flex items-center gap-2 rounded-xl bg-clause px-6 py-3.5 font-semibold text-white transition-opacity hover:opacity-90"
            >
              Start free — no credit card <ArrowRight size={14} />
            </Link>
            <Link
              href="/sign-in"
              className="flex items-center gap-1.5 rounded-xl border border-border px-5 py-3.5 text-sm text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
            >
              See a sample analysis <ArrowRight size={12} />
            </Link>
          </div>
          <p className="mt-5 text-xs text-text-muted">
            AI analysis only. Not legal advice. Consult a qualified lawyer for high-stakes agreements.
          </p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-bg">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-clause">
                  <span className="font-display text-[10px] italic text-white">H</span>
                </div>
                <span className="font-display text-sm italic text-text-primary">Hermes</span>
              </div>
              <p className="text-xs leading-6 text-text-muted">
                AI contract intelligence for freelancers. Read before you sign. Get
                paid for what you deliver.
              </p>
              <p className="text-[10px] text-text-muted/50">AI analysis only — not legal advice.</p>
            </div>
            {/* Product */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Product</p>
              <ul className="space-y-2 text-xs text-text-muted">
                {[
                  { label: "Contract Preflight", href: "#features" },
                  { label: "Payment Escrow", href: "#features" },
                  { label: "Milestone Tracker", href: "#features" },
                  { label: "Business Intelligence", href: "#features" },
                  { label: "Rate Card", href: "/sign-in" },
                  { label: "Contract Vault", href: "/sign-in" },
                ].map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="transition-colors hover:text-text-primary">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Roadmap */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Roadmap</p>
              <ul className="space-y-2 text-xs text-text-muted">
                {["E-Signature", "Figma Connect", "GitHub Connect", "Email Notifications", "Team Accounts"].map((l) => (
                  <li key={l} className="flex items-center gap-1.5">
                    <span className="h-1 w-1 rounded-full bg-gold/60" />
                    {l}
                  </li>
                ))}
              </ul>
            </div>
            {/* Get started */}
            <div>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-text-muted">Get started</p>
              <ul className="space-y-2 text-xs text-text-muted">
                {[
                  { label: "Create account", href: "/sign-in" },
                  { label: "Sign in", href: "/sign-in" },
                  { label: "Platform roadmap", href: "/sign-in" },
                ].map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition-colors hover:text-text-primary">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link
                  href="/sign-in"
                  className="flex items-center gap-1.5 rounded-lg bg-clause px-3 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Start free <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
