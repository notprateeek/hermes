"use client";

import { useState } from "react";
import { templates, TEMPLATE_CATEGORIES, type TemplateCategory } from "../../../lib/templates";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="shrink-0 rounded border border-border px-2 py-1 text-[10px] font-medium text-text-muted transition-colors hover:border-clause hover:text-clause"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export default function TemplatesPage() {
  const [active, setActive] = useState<TemplateCategory | "All">("All");

  const shown = active === "All" ? templates : templates.filter((t) => t.category === active);

  return (
    <main className="min-h-0 flex-1 overflow-auto bg-bg">
      <div className="border-b border-border bg-surface px-5 py-4">
        <h2 className="text-base font-bold text-text-primary">Template library</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Standard redline language for {templates.length} common clauses — copy and use in negotiations
        </p>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto border-b border-border bg-surface px-5 py-3">
        {(["All", ...TEMPLATE_CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              active === cat
                ? "border-clause bg-clause/10 text-clause"
                : "border-border text-text-muted hover:border-clause hover:text-text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-2">
        {shown.map((t) => (
          <article key={t.id} className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">{t.category}</span>
                <h3 className="mt-0.5 text-sm font-semibold text-text-primary">{t.clauseTitle}</h3>
              </div>
            </div>

            <div className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2">
              <p className="text-xs font-semibold text-danger">Issue</p>
              <p className="mt-0.5 text-xs leading-5 text-text-muted">{t.issue}</p>
            </div>

            <div className="rounded-md border border-amber/20 bg-amber/5 px-3 py-2">
              <p className="text-xs font-semibold text-amber">Red flag</p>
              <p className="mt-0.5 text-xs leading-5 text-text-muted">{t.redFlag}</p>
            </div>

            <div className="rounded-md border border-teal/20 bg-teal/5 px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs font-semibold text-teal">Standard language</p>
                <CopyButton text={t.standardLanguage} />
              </div>
              <p className="mt-1.5 text-xs leading-5 text-text-muted">{t.standardLanguage}</p>
            </div>

            <p className="text-xs leading-5 text-text-muted">
              <span className="font-semibold text-text-primary">Note: </span>
              {t.notes}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
