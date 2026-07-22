# Hermes

AI legal agreement analyzer. Upload a PDF or paste contract text → structured analysis + Q&A.

## Stack

- **Next.js 15 App Router** — `app/` directory, server components by default
- **React 19** + **TypeScript** + **Tailwind CSS 3**
- **OpenAI SDK** (`openai` v5) — uses `responses.create()` with structured JSON output
- **Clerk** — auth, `/dashboard` is the only protected route
- **pdf-parse** — server-side PDF text extraction

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run smoke        # scripts/smoke.ts — integration smoke test
```

**Check before shipping:** `npm run typecheck && npm run lint`

## Project layout

```
app/
  api/analyze/route.ts   # POST: PDF/text → AgreementAnalysis JSON
  api/ask/route.ts       # POST: Q&A against extracted text → QaAnswer JSON
  dashboard/             # main app UI (Clerk-protected)
  page.tsx               # landing page
  layout.tsx             # root layout + Clerk provider
components/
  AnalysisDashboard.tsx  # renders full AgreementAnalysis
  AskHermes.tsx          # Q&A chat component
  DocumentInput.tsx      # file upload + paste UI
  ExportMarkdownButton   # export analysis as .md
  Sidebar.tsx            # navigation
lib/
  types.ts    # ALL domain types — source of truth
  schema.ts   # JSON schema for OpenAI structured output
  prompts.ts  # system prompts for analyze + ask
  openai.ts   # client factory, schemaFormat(), parseOutputJson()
  text.ts     # normalizeText(), assertUsableText()
  markdown.ts # analysis → markdown conversion
  samples.ts  # sample agreement text for demo
middleware.ts  # Clerk: protects /dashboard(.*)
```

## Key patterns

**OpenAI calls** always go through `lib/openai.ts`:
```ts
openaiClient().responses.create({ model: OPENAI_MODEL, text: schemaFormat(name, schema), ... })
// then:
parseOutputJson<T>(response)
```

**Adding a new analysis field:** `lib/types.ts` → `lib/schema.ts` → `lib/prompts.ts` → component. Touch all four.

**Auth:** Clerk. `auth.protect()` in middleware. Use `currentUser()` / `auth()` from `@clerk/nextjs/server` in server components/routes.

## Env vars

```
OPENAI_API_KEY=        # required
OPENAI_MODEL=          # optional, defaults to gpt-5.5 (lib/openai.ts:3)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

## Design system

Dark-default. Cobalt + gold palette. `globals.css` holds CSS variables.
- Display font: **Syne** — headings, brand
- Body font: **Inter**
- Use existing Tailwind classes/CSS vars before adding new ones.

## What not to do

- Don't add a test framework — `npm run smoke` is the integration check
- Don't add new deps without checking if OpenAI SDK, Tailwind, or stdlib covers it
- `lib/types.ts` is the single source of truth — don't duplicate types in components
- API routes are `runtime = "nodejs"` (pdf-parse needs Node) — don't switch to edge
