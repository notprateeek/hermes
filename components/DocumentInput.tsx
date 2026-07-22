"use client";

import { ChevronDown, Upload } from "lucide-react";
import { demoSamples } from "../lib/samples";

type Props = {
  text: string;
  file: File | null;
  signerPerspective: string;
  preflightFocus: string;
  sourceContext: string;
  busy: boolean;
  error: string;
  onTextChange: (text: string) => void;
  onFileChange: (file: File | null) => void;
  onSignerPerspectiveChange: (perspective: string) => void;
  onPreflightFocusChange: (focus: string) => void;
  onSourceContextChange: (source: string) => void;
  onError: (message: string) => void;
  onAnalyze: () => void;
};

const signerPerspectives = [
  "Not sure",
  "Buyer / customer",
  "Seller / vendor",
  "Founder / company",
  "Contractor / freelancer",
  "Employee / candidate",
  "Tenant / renter",
];

const preflightFocuses = [
  "Auto-detect",
  "NDA / confidentiality",
  "MSA / services",
  "Employment offer",
  "Lease / rental",
  "Freelance / consulting",
  "Vendor / customer contract",
];

const sourceContexts = [
  "Uploaded or pasted agreement",
  "Copied from signing page",
  "Email or message thread",
  "Draft before negotiation",
];

function Field({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-surface-raised py-2 pl-3 pr-8 text-sm text-text-primary outline-none transition-colors focus:border-clause"
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    </div>
  );
}

export function DocumentInput({
  text,
  file,
  signerPerspective,
  preflightFocus,
  sourceContext,
  busy,
  error,
  onTextChange,
  onFileChange,
  onSignerPerspectiveChange,
  onPreflightFocusChange,
  onSourceContextChange,
  onError,
  onAnalyze,
}: Props) {
  async function handleFile(f: File | null) {
    if (!f) { onFileChange(null); return; }
    const name = f.name.toLowerCase();
    const isPdf = f.type === "application/pdf" || name.endsWith(".pdf");
    const isDocx = f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || name.endsWith(".docx");
    const isTxt = f.type.startsWith("text/") || name.endsWith(".txt");

    if (isTxt) {
      try {
        onTextChange(await f.text());
        onFileChange(null);
        onError("");
      } catch {
        onError("Could not read this file. Try pasting the text instead.");
      }
      return;
    }
    if (isPdf || isDocx) {
      onTextChange("");
      onFileChange(f);
      onError("");
      return;
    }
    onFileChange(null);
    onError("Upload a PDF, DOCX, or TXT — or paste the text directly.");
  }

  const hasInput = text.trim() || file;

  return (
    <section className="flex w-full flex-col overflow-hidden border-b border-border bg-surface xl:min-h-0 xl:border-b-0 xl:border-r">
      {/* Header */}
      <div className="shrink-0 border-b border-border px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Signing Preflight</h1>
            <p className="mt-0.5 text-[11px] text-text-muted">Sign, negotiate, or get counsel?</p>
          </div>
          <span className="shrink-0 rounded border border-clause/20 bg-clause/5 px-2 py-0.5 text-[10px] font-semibold text-clause">
            Beta
          </span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">

        {/* Context fields — all full-width, no sm:grid-cols-2 */}
        <div className="grid gap-2.5">
          <Field
            id="signer-perspective"
            label="Your role"
            value={signerPerspective}
            options={signerPerspectives}
            onChange={onSignerPerspectiveChange}
          />
          <Field
            id="preflight-focus"
            label="Deal type"
            value={preflightFocus}
            options={preflightFocuses}
            onChange={onPreflightFocusChange}
          />
          <Field
            id="source-context"
            label="Source"
            value={sourceContext}
            options={sourceContexts}
            onChange={onSourceContextChange}
          />
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">Agreement</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Textarea — dominant input */}
        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <textarea
            id="agreement-text"
            className="w-full min-h-[180px] flex-1 resize-none rounded-lg border border-border bg-surface-raised p-3 text-sm leading-6 text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-clause"
            value={text}
            onChange={(e) => {
              onTextChange(e.target.value);
              onFileChange(null);
              onError("");
            }}
            placeholder="Paste your agreement here — NDA, MSA, employment offer, lease, anything."
          />
        </div>

        {/* Upload zone */}
        <div>
          <label
            htmlFor="agreement-file"
            className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border border-dashed px-4 py-3 transition-colors ${
              file
                ? "border-clause/40 bg-clause/5"
                : "border-border bg-surface-raised hover:border-clause hover:bg-clause/5"
            }`}
          >
            <Upload
              size={15}
              className={file ? "shrink-0 text-clause" : "shrink-0 text-text-muted"}
            />
            <span className="min-w-0">
              <span className={`block truncate text-sm font-medium ${file ? "text-clause" : "text-text-muted"}`}>
                {file ? file.name : "Upload PDF, DOCX, or TXT"}
              </span>
              {!file && (
                <span className="block text-[11px] text-text-muted">Text-based files only</span>
              )}
            </span>
            {file && (
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); onFileChange(null); onError(""); }}
                className="ml-auto shrink-0 text-xs text-text-muted hover:text-danger"
              >
                Remove
              </button>
            )}
          </label>
          <input
            id="agreement-file"
            type="file"
            accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,text/plain,.txt"
            className="sr-only"
            onChange={(e) => void handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Demo samples */}
        {demoSamples.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Load a sample
            </p>
            <div className="flex flex-wrap gap-1.5">
              {demoSamples.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  className="rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-clause hover:text-text-primary"
                  onClick={() => {
                    onTextChange(sample.text);
                    onFileChange(null);
                    onError("");
                  }}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger">
            {error}
          </p>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={onAnalyze}
          disabled={busy || !hasInput}
          className="w-full rounded-lg bg-clause py-3 text-sm font-semibold text-white transition-colors hover:bg-clause/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Analyzing…" : "Run preflight"}
        </button>
      </div>
    </section>
  );
}
