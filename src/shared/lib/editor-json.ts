import type { EditorJSON } from "@/shared/types/domain";

export const EMPTY_EDITOR_JSON: EditorJSON = { type: "doc", content: [{ type: "paragraph" }] };

export function textToEditorJson(value: string): EditorJSON | undefined {
  const trimmed = value.trim();
  return trimmed ? { text: trimmed } : undefined;
}

export function editorJsonToText(value: EditorJSON | undefined): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const maybeText = (value as Record<string, unknown>).text;
  if (typeof maybeText === "string") {
    return maybeText;
  }

  return collectEditorText(value).trim();
}

export function normalizeEditorJson(value: EditorJSON): EditorJSON | undefined {
  return editorJsonToText(value) ? value : undefined;
}

function collectEditorText(node: unknown): string {
  if (!node || typeof node !== "object") {
    return "";
  }

  const current = node as Record<string, unknown>;
  const selfText = typeof current.text === "string" ? current.text : "";
  const childText = Array.isArray(current.content) ? current.content.map(collectEditorText).filter(Boolean).join(" ") : "";

  return [selfText, childText].filter(Boolean).join(" ");
}
