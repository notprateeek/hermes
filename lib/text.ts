export const MAX_DOCUMENT_CHARS = 70_000;

export function normalizeText(text: string) {
  return text
    .replace(/\r/g, "\n")
    // strip control chars that DOCX/PDF extraction can produce (null bytes, BEL, etc.)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function assertUsableText(text: string) {
  if (!text.trim()) {
    throw new Error("Hermes needs agreement text to analyze.");
  }

  if (text.length > MAX_DOCUMENT_CHARS) {
    throw new Error("This document is too long for the prototype. Try a shorter version.");
  }
}
