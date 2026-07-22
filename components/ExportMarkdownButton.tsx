"use client";

import { useState } from "react";
import { Clipboard, Download } from "lucide-react";
import {
  formatAnalysisMarkdown,
  formatCounterpartyRedlinesMarkdown,
  formatCounselPackMarkdown,
  formatSharePackMarkdown
} from "../lib/markdown";
import type { AgreementAnalysis } from "../lib/types";

type Props = {
  analysis: AgreementAnalysis | null;
};

function slug(value: string) {
  return (value || "hermes-analysis")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function ExportMarkdownButton({ analysis }: Props) {
  const [copied, setCopied] = useState(false);
  const [copiedRedlines, setCopiedRedlines] = useState(false);
  const [copiedCounsel, setCopiedCounsel] = useState(false);

  function downloadMarkdown(markdown: string, suffix: string) {
    if (!analysis) return;

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${slug(analysis.agreementTitle)}-${suffix}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function copyMarkdown(markdown: string, fallbackSuffix: string, onCopied: () => void) {
    if (!analysis) return;

    if (!navigator.clipboard?.writeText) {
      downloadMarkdown(markdown, fallbackSuffix);
      return;
    }

    try {
      await navigator.clipboard.writeText(markdown);
      onCopied();
    } catch {
      downloadMarkdown(markdown, fallbackSuffix);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface-raised px-2.5 py-2 text-xs font-semibold text-text-primary hover:border-teal disabled:opacity-50"
        onClick={() =>
          copyMarkdown(formatSharePackMarkdown(analysis!), "share-pack", () => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          })
        }
        disabled={!analysis}
      >
        <Clipboard size={14} />
        {copied ? "Copied" : "Share Pack"}
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface-raised px-2.5 py-2 text-xs font-semibold text-text-primary hover:border-teal disabled:opacity-50"
        onClick={() =>
          copyMarkdown(formatCounterpartyRedlinesMarkdown(analysis!), "counterparty-redlines", () => {
            setCopiedRedlines(true);
            window.setTimeout(() => setCopiedRedlines(false), 1500);
          })
        }
        disabled={!analysis}
      >
        <Clipboard size={14} />
        {copiedRedlines ? "Copied" : "Redlines"}
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface-raised px-2.5 py-2 text-xs font-semibold text-text-primary hover:border-teal disabled:opacity-50"
        onClick={() =>
          copyMarkdown(formatCounselPackMarkdown(analysis!), "counsel-pack", () => {
            setCopiedCounsel(true);
            window.setTimeout(() => setCopiedCounsel(false), 1500);
          })
        }
        disabled={!analysis}
      >
        <Clipboard size={14} />
        {copiedCounsel ? "Copied" : "Counsel Pack"}
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface-raised px-2.5 py-2 text-xs font-semibold text-text-primary hover:border-teal disabled:opacity-50"
        onClick={() => analysis && downloadMarkdown(formatAnalysisMarkdown(analysis), "report")}
        disabled={!analysis}
      >
        <Download size={14} />
        Full Report
      </button>
    </div>
  );
}
