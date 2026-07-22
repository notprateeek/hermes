# Hermes

AI legal agreement analyzer. Upload a PDF, DOCX, or paste contract text → get a structured analysis with signing verdict, risk flags, negotiation ammo, deadlines, and grounded Q&A.

**Live:** https://hermes-notprateeek.netlify.app

---

## What it does

Users upload or paste an agreement. Hermes extracts the text, sends it to OpenAI with a structured JSON schema, and returns a full analysis including:

- **Signing verdict** — `safe_to_sign` / `negotiate_first` / `do_not_sign_without_counsel` with a plain-English rationale and top blockers
- **Risk assessment** — flagged risks at high / medium / low severity
- **Negotiation brief** — per-issue ask, fallback language (copy-ready), and email-ready wording
- **Deadline tracker** — dates and triggers extracted and labeled for calendar entry
- **Agreement overview** — parties, commitments, payments, penalties, important clauses
- **Missing/vague terms** — gaps the model identified
- **Questions to ask** — before signing
- **Grounded Q&A** — ask anything about the specific agreement (`/api/ask`)
- **Export** — Share Pack, Redlines, Counsel Pack, Full Report (all as Markdown)

---

## Tech stack

| Layer           | Choice                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 App Router (`app/` dir, server components by default)                                   |
| UI              | React 19 + TypeScript + Tailwind CSS 3                                                             |
| AI              | OpenAI SDK v5 — `responses.create()` with structured JSON output                                   |
| Auth            | Clerk v7 (`@clerk/nextjs`)                                                                         |
| Database        | Neon PostgreSQL serverless (`@neondatabase/serverless`)                                            |
| PDF extraction  | `pdf-parse`                                                                                        |
| DOCX extraction | `mammoth` (installed with `--legacy-peer-deps`)                                                    |
| Icons           | Lucide React 1.23.0                                                                                |
| Fonts           | Instrument Serif (`--font-display`, display only) + Figtree (`--font-sans`, body) + JetBrains Mono |

---

## Commands

```bash
npm run dev          # localhost:3000
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run smoke        # scripts/smoke.ts — integration smoke test
```

**Always run before shipping:** `npm run typecheck && npm run lint`

---

## Project layout

```
app/
  api/
    analyze/route.ts      # POST: PDF/DOCX/text → AgreementAnalysis JSON
    ask/route.ts          # POST: Q&A against extracted text → QaAnswer JSON
    analyses/[id]/route.ts # GET: load a saved analysis by id
  dashboard/
    page.tsx              # main app — DocumentInput + AnalysisDashboard + AskHermes
    layout.tsx            # dashboard shell with Sidebar
    history/page.tsx      # list of all user analyses (loads from DB)
    compare/page.tsx      # side-by-side clause compare (two SlotInputs → parallel analyze)
    bulk/page.tsx         # multi-file upload, sequential analysis with per-item status
    templates/page.tsx    # 16 redline templates across NDA/MSA/Employment/Lease
    coming-soon/page.tsx  # platform preview page (Payment Escrow, Milestone Tracker, etc.)
  sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in, split-panel layout
  sign-up/[[...sign-up]]/page.tsx   # Clerk sign-up, split-panel layout
  page.tsx               # landing page
  layout.tsx             # root layout — font loading, Clerk provider
  globals.css            # CSS variables, base styles, custom animations

components/
  AnalysisDashboard.tsx  # renders full AgreementAnalysis; LoadingAnalysis state; ExportMarkdownButton
  AskHermes.tsx          # Q&A chat component, grounded on extracted text
  DocumentInput.tsx      # file upload (PDF/DOCX) + paste UI + preflight config selects
  ExportMarkdownButton.tsx # Share Pack / Redlines / Counsel Pack / Full Report buttons
  Sidebar.tsx            # navigation with section groups
  ThemeProvider.tsx      # dark/light theme context
  ThemeToggle.tsx        # theme switcher button

lib/
  types.ts     # ALL domain types — single source of truth
  schema.ts    # JSON schema for OpenAI structured output (mirrors types.ts)
  prompts.ts   # system prompts for analyze + ask
  openai.ts    # client factory, schemaFormat(), parseOutputJson()
  text.ts      # normalizeText() (strips control chars), assertUsableText(), MAX_DOCUMENT_CHARS=70k
  db.ts        # Neon SQL — saveAnalysis(), getAnalysis(), listAnalyses(), AnalysisSummary type
  deadlines.ts # buildDeadlineItems() — pulls dates from commitments + payments + penalties
  markdown.ts  # formatAnalysisMarkdown(), formatSharePackMarkdown(), formatRedlinesMarkdown(), formatCounselPackMarkdown()
  samples.ts   # sample agreement text for demo/smoke
  templates.ts # 16 pre-built clause templates (NDA, MSA/Services, Employment, Lease/Rental)

middleware.ts  # Clerk: protects /dashboard(.*)
scripts/
  smoke.ts     # integration smoke test against the analyze API
```

---

## Key patterns

### OpenAI calls

All calls go through `lib/openai.ts`:

```ts
const response = await openaiClient().responses.create({
  model: OPENAI_MODEL,
  input: [...],
  text: schemaFormat("agreement_analysis", agreementAnalysisSchema),
  max_output_tokens: 16000,   // raised from 8000 — large DOCX needs headroom
});
const result = parseOutputJson<AgreementAnalysis>(response);
```

`parseOutputJson` does `JSON.parse(response.output_text)`. If this throws, the output was truncated — increase `max_output_tokens` or reduce document length.

### Adding a new analysis field

Touch all four in order: `lib/types.ts` → `lib/schema.ts` → `lib/prompts.ts` → component that renders it.

### Text extraction pipeline

```
File upload → extractPdf() or extractDocx()
  → normalizeText()   strips \r, control chars (null, BEL, etc.), collapses whitespace
  → assertUsableText()  throws if empty or > MAX_DOCUMENT_CHARS (70,000)
  → OpenAI analyze
```

`normalizeText` strips `[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]` — these control characters appear in DOCX files and will break JSON serialization of the OpenAI output if sent through.

### Auth

Clerk. `auth.protect()` in `middleware.ts`. In server components/routes use `auth()` or `currentUser()` from `@clerk/nextjs/server`.

### Database

Neon serverless PostgreSQL. One table:

```sql
CREATE TABLE analyses (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  file_type   TEXT NOT NULL,
  page_count  INTEGER NOT NULL DEFAULT 0,
  extracted_text TEXT NOT NULL,
  analysis    JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX analyses_user_id_idx ON analyses (user_id, created_at DESC);
```

Run migration: `node --env-file=.env.local scripts/migrate.ts` (or equivalent one-off).

---

## Design system

Dark-default. Light theme available via `data-theme="light"`.

| Token                | Value     | Usage                           |
| -------------------- | --------- | ------------------------------- |
| `--bg`               | `#0C0D10` | Page background                 |
| `--surface`          | `#141518` | Card / panel background         |
| `--surface-raised`   | `#1E2028` | Input fields, inner cards       |
| `--border`           | `#2A2E3A` | All borders                     |
| `--clause`           | `#FF4F1F` | Primary accent — red-pen orange |
| `--text-primary`     | `#F0EDE6` | Body text                       |
| `--text-muted`       | `#6E7180` | Secondary text                  |
| `--teal`             | `#3ECF8E` | Safe / positive states          |
| `--gold` / `--amber` | `#F59E0B` | Warning / negotiate states      |
| `--danger`           | `#EF4444` | High risk / do-not-sign states  |

**Typography rule:** `font-display` (Instrument Serif italic) for hero titles only (h1/h2 at 2xl+) and the brand wordmark. Everything else — panel headers, body text, labels, fine print — uses Figtree (sans-serif, inherited from body).

**CSS animations** (in `globals.css`, use via class name):

- `.scan-bar-el` — orange vertical scan line sweeping left→right (used in LoadingAnalysis)
- `.clause-hl` — background highlight pulse (used in LoadingAnalysis mock document)
- `.finding-reveal` — fade-in from below (used in LoadingAnalysis)
- `.dot-grid` — dot texture background for hero panels

Use existing Tailwind classes and CSS vars before adding new ones.

---

## Env vars

```
OPENAI_API_KEY=                          # required
OPENAI_MODEL=                            # optional, defaults to gpt-5.5 (lib/openai.ts:3)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
DATABASE_URL=                            # Neon postgres connection string
```

---

## Current features (shipped)

| Feature              | Route                                    | Status |
| -------------------- | ---------------------------------------- | ------ |
| Signing Preflight    | `/dashboard`                             | Live   |
| Analysis history     | `/dashboard/history`                     | Live   |
| Clause Compare       | `/dashboard/compare`                     | Live   |
| Bulk Upload          | `/dashboard/bulk`                        | Live   |
| Template Library     | `/dashboard/templates`                   | Live   |
| PDF upload           | via `/api/analyze`                       | Live   |
| DOCX upload          | via `/api/analyze`                       | Live   |
| Text paste           | via `/api/analyze`                       | Live   |
| Grounded Q&A         | `/api/ask`                               | Live   |
| Export (4 formats)   | `ExportMarkdownButton`                   | Live   |
| Auth (Clerk)         | `middleware.ts`                          | Live   |
| Analysis persistence | Neon PostgreSQL                          | Live   |
| Dark/light theme     | `ThemeToggle`                            | Live   |
| Loading animation    | `LoadingAnalysis` in `AnalysisDashboard` | Live   |

---

## Planned / coming soon (Hermes Platform)

The coming-soon page (`/dashboard/coming-soon`) describes what's next. These are real planned features, not vaporware — the UX is already designed:

### Payment Escrow

Hold payment when both parties sign. Funds auto-release when milestones complete or disputes resolve. Integrates with the signing flow — "At signing" stage in the agreement lifecycle pipeline.

### Milestone Tracker

Turn a signed agreement's deliverables into a real-time shared checklist. Both parties mark milestones done; escrow releases stage by stage. Integrates into the "During delivery" stage.

### Figma Connect

Link Figma projects to contract milestones. Marking a frame/file delivered closes the milestone and triggers escrow release. Target: design/freelance agreements.

### GitHub Connect

Connect a repo to the agreement. Merged PRs, tagged releases, or deploy events satisfy delivery milestones automatically. Target: dev/engineering contracts.

The full agreement lifecycle pipeline is:

```
Draft → Analyze (live) → Preflight (live) → Sign (live) → Escrow (soon) → Deliver (soon) → Pay (soon)
```

---

## Known constraints / gotchas

- **`max_output_tokens: 16000`** — large agreements with many clauses can still hit this. If `parseOutputJson` throws "Unterminated string in JSON", the output was truncated. Either increase this limit or truncate the input document earlier.
- **`MAX_DOCUMENT_CHARS = 70_000`** in `lib/text.ts` — documents above this throw before reaching OpenAI. Increase if needed (but longer docs → more output tokens).
- **mammoth installed with `--legacy-peer-deps`** — peer dep conflict with React 19. Don't update without checking.
- **`runtime = "nodejs"`** on all API routes — pdf-parse and mammoth need Node.js runtime, not Edge.
- **Clerk `appearance` prop** — only `colorBackground`, `colorPrimary`, `colorDanger`, `borderRadius`, `fontFamily`, `fontSize` are valid in `variables`. Other color tokens (`colorInputBackground`, `colorText`, etc.) will cause TypeScript errors.
- **`sm:grid-cols-2` fires at 640px viewport, not container width** — don't use it inside the 320px DocumentInput sidebar panel.
- **No test framework** — `npm run smoke` is the integration check. Don't add Jest/Vitest.
- **No new deps** without checking if OpenAI SDK, Tailwind, or stdlib covers it first.

---

## What not to do

- Don't duplicate types from `lib/types.ts` in components
- Don't switch API routes to Edge runtime
- Don't mock the database in smoke tests
- Don't add a test framework
- Don't commit `.env.local`
- Don't add comments that describe what the code does — only add them for non-obvious WHY (hidden constraints, workarounds, invariants)
