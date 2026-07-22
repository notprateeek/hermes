import {
  Lock, Palette, GitBranch, CheckCircle2, ArrowRight,
  Sparkles, FileSignature,
} from "lucide-react";

const pipeline = [
  { label: "Analyze",      sub: "AI review",            status: "live" as const },
  { label: "Preflight",    sub: "Sign or negotiate",    status: "live" as const },
  { label: "Escrow",       sub: "Hold payment",         status: "live" as const },
  { label: "Deliver",      sub: "Track milestones",     status: "live" as const },
  { label: "Invoice",      sub: "Generate & send",      status: "live" as const },
  { label: "Vault",        sub: "Archive & search",     status: "live" as const },
  { label: "Intelligence", sub: "Deadlines & analytics",status: "live" as const },
  { label: "Sign",         sub: "In-app e-signature",   status: "soon" as const, accent: "#a855f7" },
];

type Feature = {
  icon: React.ElementType;
  name: string;
  accent: string;
  border: string;
  glow: string;
  stage: string;
  problem: string;
  solution: string;
};

const features: Feature[] = [
  {
    icon: FileSignature,
    name: "E-Signature",
    accent: "#a855f7",
    border: "rgba(168,85,247,0.25)",
    glow: "rgba(168,85,247,0.06)",
    stage: "At execution",
    problem: "You negotiate the contract in Hermes, then export it to DocuSign to sign. That's one tool too many.",
    solution:
      "Sign agreements within Hermes. Cryptographically timestamped, legally binding. Your counterparty signs from any device — no account required, just a link.",
  },
  {
    icon: Palette,
    name: "Figma Connect",
    accent: "#a855f7",
    border: "rgba(168,85,247,0.25)",
    glow: "rgba(168,85,247,0.06)",
    stage: "Design handoff",
    problem: "Design handoffs live in Figma. Payment disputes live in email threads.",
    solution:
      "Link Figma projects to contract milestones. Marking a design delivered closes the milestone and triggers payment — no middle step, no he-said-she-said.",
  },
  {
    icon: GitBranch,
    name: "GitHub Connect",
    accent: "#f59e0b",
    border: "rgba(245,158,11,0.25)",
    glow: "rgba(245,158,11,0.06)",
    stage: "Code delivery",
    problem: "Your code ships on time. Proving it to a non-technical client doesn't.",
    solution:
      "Connect your repo to the agreement. Merged PRs, tagged releases, or deploy events automatically satisfy delivery milestones and release payment.",
  },
];

export default function ComingSoonPage() {
  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">

      {/* Hero */}
      <div className="dot-grid relative overflow-hidden border-b border-border">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,79,31,0.07) 0%, transparent 70%)",
          }}
        />
        <div className="relative px-8 py-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
            <Sparkles size={11} />
            Hermes Roadmap
          </span>
          <h1
            className="font-display mt-6 text-4xl font-normal italic leading-tight text-text-primary lg:text-5xl"
            style={{ maxWidth: 680, margin: "24px auto 0" }}
          >
            Analyze. Escrow. Invoice.<br />
            <span style={{ color: "rgb(var(--clause))" }}>The whole deal.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-text-muted">
            Every feature below is either live today or shipping soon. One platform
            that covers the full freelance contract lifecycle — from AI review to final payment.
          </p>
        </div>
      </div>

      {/* Pipeline */}
      <div className="border-b border-border bg-surface px-8 py-8">
        <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-widest text-text-muted">
          The full agreement lifecycle
        </p>
        <div className="overflow-x-auto pb-4">
          <div className="mx-auto flex min-w-max items-start px-4" style={{ gap: 0 }}>
            {pipeline.map((stage, i) => {
              const isLive = stage.status === "live";
              const isSoon = stage.status === "soon";
              const nodeColor = isLive
                ? "rgb(var(--clause))"
                : isSoon
                ? (stage.accent ?? "rgb(var(--border))")
                : "rgb(var(--border))";

              return (
                <div key={stage.label} className="flex items-start">
                  <div className="flex flex-col items-center" style={{ minWidth: 96 }}>
                    <div style={{ height: 24, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isLive && (
                        <span className="rounded-full bg-clause px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
                          Live
                        </span>
                      )}
                      {isSoon && (
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-black"
                          style={{ background: stage.accent }}
                        >
                          Soon
                        </span>
                      )}
                    </div>
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full border-2"
                      style={{
                        borderColor: nodeColor,
                        background: isLive
                          ? "rgba(255,79,31,0.12)"
                          : isSoon
                          ? `${stage.accent}20`
                          : "transparent",
                      }}
                    >
                      {isLive ? (
                        <CheckCircle2 size={18} style={{ color: nodeColor }} strokeWidth={2} />
                      ) : isSoon ? (
                        <Lock size={15} style={{ color: nodeColor }} strokeWidth={2} />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgb(var(--border))" }} />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <p
                        className="text-xs font-semibold"
                        style={{ color: isLive ? "rgb(var(--text-primary))" : "rgb(var(--text-muted))" }}
                      >
                        {stage.label}
                      </p>
                      <p className="mt-0.5 text-[10px] leading-tight text-text-muted">{stage.sub}</p>
                    </div>
                  </div>

                  {i < pipeline.length - 1 && (
                    <div className="flex items-center" style={{ width: 36, marginTop: 36 }}>
                      <div
                        className="h-px w-full"
                        style={{
                          background: isLive && pipeline[i + 1].status === "live"
                            ? "rgb(var(--clause))"
                            : "rgb(var(--border))",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="p-8">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.name}
                className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  borderColor: f.border,
                  background: `linear-gradient(160deg, ${f.glow} 0%, rgb(var(--surface)) 40%)`,
                }}
              >
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: f.accent }} />

                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg border"
                    style={{ background: `${f.accent}15`, borderColor: f.border }}
                  >
                    <Icon size={18} style={{ color: f.accent }} strokeWidth={1.75} />
                  </div>
                  <span
                    className="rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ background: `${f.accent}15`, color: f.accent, border: `1px solid ${f.border}` }}
                  >
                    {f.stage}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-text-primary">{f.name}</h3>
                <p className="text-sm italic leading-6 text-text-muted">&ldquo;{f.problem}&rdquo;</p>
                <p className="text-sm leading-6 text-text-muted">{f.solution}</p>

                <div
                  className="mt-auto flex items-center gap-2 rounded-lg border px-3 py-2"
                  style={{ borderColor: f.border, background: `${f.accent}08` }}
                >
                  <Sparkles size={12} style={{ color: f.accent }} />
                  <span className="text-xs font-medium" style={{ color: f.accent }}>
                    Coming soon
                  </span>
                </div>
              </article>
            );
          })}
        </div>

        {/* Early access CTA */}
        <div className="dot-grid relative mt-10 overflow-hidden rounded-xl border border-border bg-surface p-8 text-center">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 60% 80% at 50% 100%, rgba(255,79,31,0.06) 0%, transparent 70%)",
            }}
          />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Early access</p>
            <h2 className="font-display mt-3 text-2xl font-normal italic text-text-primary">
              Be first on the platform.
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-text-muted">
              We&apos;re building Hermes for freelancers, contractors, and the people who hire them.
              Early access members help shape what ships first.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="mailto:hello@hermesapp.io?subject=Early Access"
                className="flex items-center gap-2 rounded-lg bg-clause px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Request early access
                <ArrowRight size={14} />
              </a>
              <span className="text-xs text-text-muted">No commitment · We&apos;ll reach out directly</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
