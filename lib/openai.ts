import OpenAI from "openai";

export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.5";

export function openaiClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export function schemaFormat(name: string, schema: Record<string, unknown>) {
  return {
    format: {
      type: "json_schema",
      name,
      schema,
      strict: true
    }
  } as const;
}

export function parseOutputJson<T>(response: { output_text?: string }) {
  if (!response.output_text) {
    throw new Error("Hermes could not produce valid analysis. Try again.");
  }

  return JSON.parse(response.output_text) as T;
}
