"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AnalysisDashboard } from "../../components/AnalysisDashboard";
import { AskHermes, type ChatTurn } from "../../components/AskHermes";
import { DocumentInput } from "../../components/DocumentInput";
import type { AgreementAnalysis, AnalysisResponse, QaAnswer } from "../../lib/types";

type Metadata = AnalysisResponse["metadata"];

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Hermes could not complete the request.");
  }
  return data;
}

export default function Dashboard() {
  const searchParams = useSearchParams();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [signerPerspective, setSignerPerspective] = useState("Not sure");
  const [preflightFocus, setPreflightFocus] = useState("Auto-detect");
  const [sourceContext, setSourceContext] = useState("Uploaded or pasted agreement");
  const [analysis, setAnalysis] = useState<AgreementAnalysis | null>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [agreementText, setAgreementText] = useState("");
  const [chat, setChat] = useState<ChatTurn[]>([]);
  const [busyAnalyze, setBusyAnalyze] = useState(false);
  const [busyAsk, setBusyAsk] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = searchParams.get("id");
    if (!id) return;
    setBusyAnalyze(true);
    setError("");
    fetch(`/api/analyses/${id}`)
      .then((r) => r.json() as Promise<AnalysisResponse & { error?: string }>)
      .then((data) => {
        if (data.error) { setError(data.error); return; }
        setAnalysis(data.analysis);
        setMetadata(data.metadata);
        setAgreementText(data.extractedText);
        setText(data.extractedText);
        setChat([]);
      })
      .catch(() => setError("Could not load this analysis."))
      .finally(() => setBusyAnalyze(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get("id")]);

  async function analyze() {
    setBusyAnalyze(true);
    setError("");
    try {
      const form = new FormData();
      form.append("text", file ? "" : text);
      form.append("signerPerspective", signerPerspective);
      form.append("preflightFocus", preflightFocus);
      form.append("sourceContext", sourceContext);
      if (file) form.append("file", file);

      const result = await readJson<AnalysisResponse>(
        await fetch("/api/analyze", { method: "POST", body: form })
      );

      setAnalysis(result.analysis);
      setMetadata(result.metadata);
      setAgreementText(result.extractedText);
      setText(result.extractedText);
      setChat([]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Hermes could not analyze this agreement.");
    } finally {
      setBusyAnalyze(false);
    }
  }

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || !analysis) return;

    setBusyAsk(true);
    setError("");
    try {
      const answer = await readJson<QaAnswer>(
        await fetch("/api/ask", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ question: trimmed, agreementText, analysis }),
        })
      );
      setChat((turns) => [...turns, { id: crypto.randomUUID(), question: trimmed, answer }]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Hermes could not answer that question.");
    } finally {
      setBusyAsk(false);
    }
  }

  return (
    <main className="grid min-h-0 flex-1 overflow-hidden bg-bg xl:grid-cols-[320px_minmax(0,1fr)]">
      <DocumentInput
        text={text}
        file={file}
        signerPerspective={signerPerspective}
        preflightFocus={preflightFocus}
        sourceContext={sourceContext}
        busy={busyAnalyze}
        error={error}
        onTextChange={setText}
        onFileChange={setFile}
        onSignerPerspectiveChange={setSignerPerspective}
        onPreflightFocusChange={setPreflightFocus}
        onSourceContextChange={setSourceContext}
        onError={setError}
        onAnalyze={analyze}
      />
      <div className="grid min-h-[560px] min-w-0 grid-rows-[1fr_auto] xl:min-h-0">
        <AnalysisDashboard analysis={analysis} metadata={metadata} busy={busyAnalyze} fileName={file?.name} />
        <AskHermes
          disabled={!analysis}
          busy={busyAsk}
          turns={chat}
          suggestions={analysis?.questionsToAskBeforeSigning}
          onAsk={ask}
        />
      </div>
    </main>
  );
}
