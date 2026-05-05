import { describe, expect, it } from "vitest";
import { editorJsonToText } from "@/shared/lib/editor-json";

describe("editorJsonToText", () => {
  it("extracts text from checklist task items", () => {
    expect(
      editorJsonToText({
        type: "doc",
        content: [
          {
            type: "taskList",
            content: [
              {
                type: "taskItem",
                attrs: { checked: true },
                content: [{ type: "paragraph", content: [{ type: "text", text: "Send proposal" }] }]
              }
            ]
          }
        ]
      })
    ).toBe("Send proposal");
  });
});
