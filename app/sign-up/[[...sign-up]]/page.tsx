import { SignUp } from "@clerk/nextjs";
import { FileSearch, Shield, Handshake, Sparkles } from "lucide-react";

const features = [
  { icon: FileSearch, text: "AI reads every clause — plain English, not legalese" },
  { icon: Shield, text: "Signing verdict: safe, negotiate, or get counsel" },
  { icon: Handshake, text: "Negotiation email wording, ready to send" },
  { icon: Sparkles, text: "Payment escrow, milestones & integrations — coming soon" },
];

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left: Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-10 lg:flex lg:w-[44%]">
        <div className="dot-grid absolute inset-0 opacity-60" />
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

          <h1
            className="font-display mt-12 text-4xl font-normal italic leading-tight text-text-primary"
            style={{ maxWidth: 420 }}
          >
            Your agreements,<br />
            <span style={{ color: "rgb(var(--clause))" }}>finally readable.</span>
          </h1>

          <p className="mt-5 max-w-sm text-sm leading-7 text-text-muted">
            Join Hermes and stop signing things you don&apos;t fully understand. Upload, analyze,
            negotiate — and soon, pay and deliver — all in one place.
          </p>

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

        <div className="relative">
          <div className="rounded-xl border border-border bg-bg p-5">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">What you get</p>
            <div className="mt-4 grid gap-3">
              {[
                { label: "Signing decision", val: "Safe / Negotiate / Get counsel" },
                { label: "Deadline tracker", val: "Calendar-ready dates" },
                { label: "Negotiation ammo", val: "Email-ready redline wording" },
                { label: "Grounded Q&A", val: "Ask anything about the agreement" },
              ].map(({ label, val }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-text-muted">{label}</span>
                  <span className="text-xs text-text-primary">{val}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-3 text-xs text-text-muted">
            Free during beta. Not legal advice.
          </p>
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex flex-1 items-center justify-center bg-bg px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-clause">
              <span className="font-display text-sm font-normal italic text-white">H</span>
            </div>
            <span className="font-display text-base font-normal italic text-text-primary">Hermes</span>
          </div>

          <SignUp
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
