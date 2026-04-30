import type { EditorJSON } from "@/shared/types/domain";

export function textToEditorJson(value: string): EditorJSON | undefined {
  const trimmed = value.trim();
  return trimmed ? { text: trimmed } : undefined;
}

export function editorJsonToText(value: EditorJSON | undefined): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const maybeText = (value as Record<string, unknown>).text;
  return typeof maybeText === "string" ? maybeText : "";
}
