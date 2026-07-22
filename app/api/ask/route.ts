import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { AgreementAnalysis, QaAnswer } from "../../../lib/types";
import { qaAnswerSchema } from "../../../lib/schema";
import { QA_SYSTEM_PROMPT } from "../../../lib/prompts";
import { assertUsableText } from "../../../lib/text";
import { OPENAI_MODEL, openaiClient, parseOutputJson, schemaFormat } from "../../../lib/openai";

export const runtime = "nodejs";

function errorResponse(error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Something went wrong.";
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      question?: string;
      agreementText?: string;
      analysis?: AgreementAnalysis;
    };

    const question = (body.question || "").trim();
    if (!question) {
      throw new Error("Ask a question about the agreement.");
    }

    assertUsableText(body.agreementText || "");
    if (!body.analysis) {
      throw new Error("Analyze an agreement before asking follow-up questions.");
    }

    const response = await openaiClient().responses.create({
      model: OPENAI_MODEL,
      input: [
        { role: "system", content: QA_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            question,
            agreementText: body.agreementText,
            analysis: body.analysis
          })
        }
      ],
      text: schemaFormat("qa_answer", qaAnswerSchema),
      max_output_tokens: 1600
    });

    return NextResponse.json(parseOutputJson<QaAnswer>(response));
  } catch (error) {
    const status = error instanceof Error && error.message === "OPENAI_API_KEY is not set." ? 500 : 400;
    return errorResponse(error, status);
  }
}
