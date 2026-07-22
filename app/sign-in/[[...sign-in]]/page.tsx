import { SignIn } from "@clerk/nextjs";
import { CheckCircle2, Shield, FileSearch, Handshake } from "lucide-react";

const features = [
  { icon: FileSearch, text: "AI reads every clause — plain English, not legalese" },
  { icon: Shield, text: "Signing verdict: safe, negotiate, or get counsel" },
  { icon: Handshake, text: "Negotiation email wording, ready to send" },
];

export default function SignInPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 lg:flex lg:w-[44%]">
        {/* Dot grid texture */}
        <div className="dot-grid absolute inset-0 opacity-60" />

        {/* Radial glow from bottom-right */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 80% 100%, rgba(255,79,31,0.08) 0%, transparent 65%)",
          }}
        />

        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-clause">
              <span className="font-display text-base font-normal italic text-white">H</span>
            </div>
            <span className="font-display text-lg font-normal italic text-text-primary">Hermes</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display mt-12 text-4xl font-normal italic leading-tight text-text-primary"
            style={{ maxWidth: 420 }}
          >
            Know what to do<br />
            <span style={{ color: "rgb(var(--clause))" }}>before you sign.</span>
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-7 text-text-muted">
            Upload a contract or paste the text. Hermes returns a signing decision,
            redlines, deadlines, and negotiation wording — in seconds.
          </p>

          {/* Feature bullets */}
          <ul className="mt-8 grid gap-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md"
                  style={{ background: "rgba(255,79,31,0.1)", border: "1px solid rgba(255,79,31,0.2)" }}
                >
                  <Icon size={13} style={{ color: "rgb(var(--clause))" }} strokeWidth={2} />
                </div>
                <span className="text-sm leading-6 text-text-muted">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sample verdict card */}
        <div className="relative">
          <div className="rounded-xl border border-amber/20 bg-bg p-4" style={{ background: "rgba(245,158,11,0.04)" }}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">
                Sample signing decision
              </p>
              <span className="shrink-0 rounded-md border border-amber/30 bg-amber/10 px-2 py-1 text-xs font-semibold text-amber">
                Negotiate first
              </span>
            </div>
            <p className="mt-3 text-sm italic leading-6 text-text-primary">
              &ldquo;This NDA is one-way only. You&apos;re exposing your IP with no reciprocal protection,
              and the non-compete scope is dangerously broad.&rdquo;
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["One-way confidentiality", "Overbroad non-compete", "No liability cap"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-text-muted"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 border-t border-border/40 pt-3">
              <CheckCircle2 size={12} className="text-teal" />
              <p className="text-xs text-text-muted">
                → Push for mutual NDA before signing.
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            AI analysis only. Not legal advice. Always consult a lawyer for high-stakes agreements.
          </p>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex flex-1 items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-clause">
              <span className="font-display text-sm font-normal italic text-white">H</span>
            </div>
            <span className="font-display text-base font-normal italic text-text-primary">Hermes</span>
          </div>

          <SignIn
            forceRedirectUrl="/dashboard"
            appearance={{
              variables: {
                colorBackground: "rgb(20,21,24)",
                colorPrimary: "rgb(255,79,31)",
                colorDanger: "rgb(239,68,68)",
                borderRadius: "0.75rem",
                fontFamily: "inherit",
                fontSize: "14px",
              },
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "text-xl font-bold text-text-primary",
                headerSubtitle: "text-text-muted text-sm",
                socialButtonsBlockButton:
                  "border-border bg-surface-raised text-text-primary hover:bg-surface-raised/80",
                dividerLine: "bg-border",
                dividerText: "text-text-muted text-xs",
                formFieldLabel: "text-text-muted text-xs font-medium",
                formFieldInput:
                  "bg-surface-raised border-border text-text-primary placeholder:text-text-muted focus:border-clause rounded-lg",
                formButtonPrimary:
                  "bg-clause hover:bg-clause/90 text-white font-semibold rounded-lg",
                footerActionLink: "text-clause hover:text-clause/80",
                identityPreviewText: "text-text-primary",
                identityPreviewEditButton: "text-clause",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
