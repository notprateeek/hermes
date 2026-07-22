import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { AgreementAnalysis, AnalysisResponse } from "../../../lib/types";
import { agreementAnalysisSchema } from "../../../lib/schema";
import { ANALYSIS_SYSTEM_PROMPT } from "../../../lib/prompts";
import { assertUsableText, normalizeText } from "../../../lib/text";
import { OPENAI_MODEL, openaiClient, parseOutputJson, schemaFormat } from "../../../lib/openai";
import { saveAnalysis } from "../../../lib/db";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const DEFAULT_SIGNER_PERSPECTIVE = "Not sure";
const DEFAULT_PREFLIGHT_FOCUS = "Auto-detect";
const DEFAULT_SOURCE_CONTEXT = "Uploaded or pasted agreement";

type AnalyzeInput = Omit<AnalysisResponse, "analysis"> & {
  signerPerspective: string;
  preflightFocus: string;
  sourceContext: string;
};

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status });
}

async function extractPdf(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("This PDF is too large for the prototype. Try pasting the agreement text instead.");
  }

  const pdfParse = (await import("pdf-parse")).default;
  const parsed = await pdfParse(Buffer.from(await file.arrayBuffer()));
  const text = normalizeText(parsed.text || "");

  if (!text) {
    throw new Error("Hermes could not read this file. Try pasting the agreement text instead.");
  }

  return {
    text,
    metadata: {
      fileName: file.name || "uploaded.pdf",
      fileType: file.type || "application/pdf",
      pageCount: parsed.numpages || 0
    }
  };
}

async function extractDocx(file: File) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("This DOCX is too large for the prototype. Try pasting the agreement text instead.");
  }

  const mammoth = (await import("mammoth")).default;
  const result = await mammoth.extractRawText({ buffer: Buffer.from(await file.arrayBuffer()) });
  const text = normalizeText(result.value || "");

  if (!text) {
    throw new Error("Hermes could not read this DOCX file. Try pasting the agreement text instead.");
  }

  return {
    text,
    metadata: {
      fileName: file.name || "uploaded.docx",
      fileType: file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      pageCount: 0
    }
  };
}

async function readInput(request: Request): Promise<AnalyzeInput> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const pasted = normalizeText(String(form.get("text") || ""));
    const maybeFile = form.get("file");
    const signerPerspective = normalizeText(String(form.get("signerPerspective") || DEFAULT_SIGNER_PERSPECTIVE));
    const preflightFocus = normalizeText(String(form.get("preflightFocus") || DEFAULT_PREFLIGHT_FOCUS));
    const sourceContext = normalizeText(String(form.get("sourceContext") || DEFAULT_SOURCE_CONTEXT));

    if (pasted) {
      return {
        extractedText: pasted,
        metadata: { fileName: "pasted-text.txt", fileType: "text/plain", pageCount: 0 },
        signerPerspective,
        preflightFocus,
        sourceContext
      };
    }

    if (!(maybeFile instanceof File) || maybeFile.size === 0) {
      throw new Error("Hermes needs agreement text or a PDF to analyze.");
    }

    const name = maybeFile.name.toLowerCase();
    const isPdf = maybeFile.type === "application/pdf" || name.endsWith(".pdf");
    const isDocx = maybeFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || name.endsWith(".docx");

    if (!isPdf && !isDocx) {
      throw new Error("Unsupported file type. Upload a PDF, DOCX, or paste text.");
    }

    const { text, metadata } = isPdf ? await extractPdf(maybeFile) : await extractDocx(maybeFile);
    return { extractedText: text, metadata, signerPerspective, preflightFocus, sourceContext };
  }

  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    signerPerspective?: string;
    preflightFocus?: string;
    sourceContext?: string;
  };
  return {
    extractedText: normalizeText(body.text || ""),
    metadata: { fileName: "pasted-text.txt", fileType: "text/plain", pageCount: 0 },
    signerPerspective: normalizeText(body.signerPerspective || DEFAULT_SIGNER_PERSPECTIVE),
    preflightFocus: normalizeText(body.preflightFocus || DEFAULT_PREFLIGHT_FOCUS),
    sourceContext: normalizeText(body.sourceContext || DEFAULT_SOURCE_CONTEXT)
  };
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const input = await readInput(request);
    assertUsableText(input.extractedText);

    const response = await openaiClient().responses.create({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this agreement and return the Hermes structured JSON.\n\nUser perspective: ${input.signerPerspective}\nPreflight focus: ${input.preflightFocus}\nSource context: ${input.sourceContext}\n\nAgreement text:\n${input.extractedText}`
        }
      ],
      text: schemaFormat("agreement_analysis", agreementAnalysisSchema),
      max_output_tokens: 16000
    });

    const result: AnalysisResponse = {
      extractedText: input.extractedText,
      metadata: input.metadata,
      analysis: parseOutputJson<AgreementAnalysis>(response)
    };
    const id = await saveAnalysis(userId, result);
    return NextResponse.json({ id, ...result });
  } catch (error) {
    const status = error instanceof Error && error.message === "OPENAI_API_KEY is not set." ? 500 : 400;
    return errorResponse(error, status);
  }
}
