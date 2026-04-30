import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { EditorJSON } from "@/shared/types/domain";
import { cn } from "@/shared/lib/utils";

interface SlashCommandItem {
  id: string;
  label: string;
  run: () => void;
}

interface DocEditorProps {
  content: EditorJSON;
  onContentChange: (content: EditorJSON) => void;
}

export function DocEditor({ content, onContentChange }: DocEditorProps) {
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class:
          "min-h-[360px] rounded-md border bg-background px-4 py-3 text-sm leading-6 outline-none focus-visible:ring-1 focus-visible:ring-ring"
      }
    },
    onUpdate: ({ editor: current }) => {
      onContentChange(current.getJSON() as EditorJSON);

      const { state, view } = current;
      const { selection } = state;
      const { $from } = selection;
      const parentText = $from.parent.textContent;
      const shouldShow = $from.parent.type.name === "paragraph" && /^\/\w*$/.test(parentText);

      if (!shouldShow) {
        setMenuOpen(false);
        setQuery("");
        return;
      }

      setQuery(parentText.slice(1).toLowerCase());
      const coords = view.coordsAtPos(selection.from);
      const editorRect = view.dom.getBoundingClientRect();
      setMenuPosition({
        top: coords.bottom - editorRect.top + 4,
        left: coords.left - editorRect.left
      });
      setMenuOpen(true);
    }
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    if (JSON.stringify(editor.getJSON()) === JSON.stringify(content)) {
      return;
    }

    editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  function clearSlashText() {
    if (!editor) {
      return;
    }

    const { selection } = editor.state;
    const { $from } = selection;
    const text = $from.parent.textContent;
    const start = selection.from - $from.parentOffset;
    const end = start + text.length;
    editor.chain().focus().deleteRange({ from: start, to: end }).run();
  }

  const allCommands = useMemo<SlashCommandItem[]>(
    () => [
      {
        id: "paragraph",
        label: "Paragraph",
        run: () => {
          clearSlashText();
          editor?.chain().focus().setParagraph().run();
        }
      },
      {
        id: "h1",
        label: "Heading 1",
        run: () => {
          clearSlashText();
          editor?.chain().focus().toggleHeading({ level: 1 }).run();
        }
      },
      {
        id: "h2",
        label: "Heading 2",
        run: () => {
          clearSlashText();
          editor?.chain().focus().toggleHeading({ level: 2 }).run();
        }
      },
      {
        id: "h3",
        label: "Heading 3",
        run: () => {
          clearSlashText();
          editor?.chain().focus().toggleHeading({ level: 3 }).run();
        }
      },
      {
        id: "bullet",
        label: "Bullet List",
        run: () => {
          clearSlashText();
          editor?.chain().focus().toggleBulletList().run();
        }
      },
      {
        id: "numbered",
        label: "Numbered List",
        run: () => {
          clearSlashText();
          editor?.chain().focus().toggleOrderedList().run();
        }
      },
      {
        id: "quote",
        label: "Quote",
        run: () => {
          clearSlashText();
          editor?.chain().focus().toggleBlockquote().run();
        }
      },
      {
        id: "code",
        label: "Code Block",
        run: () => {
          clearSlashText();
          editor?.chain().focus().toggleCodeBlock().run();
        }
      },
      {
        id: "divider",
        label: "Divider",
        run: () => {
          clearSlashText();
          editor?.chain().focus().setHorizontalRule().run();
        }
      }
    ],
    [editor]
  );

  const commands = allCommands.filter((item) => item.id.includes(query) || item.label.toLowerCase().includes(query));

  return (
    <div className="relative">
      <EditorContent editor={editor} />
      {menuOpen && commands.length > 0 ? (
        <div
          className={cn(
            "absolute z-20 min-w-44 rounded-md border bg-card shadow-md",
            "max-h-56 overflow-y-auto"
          )}
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {commands.map((command) => (
            <button
              key={command.id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-accent"
              onMouseDown={(event) => {
                event.preventDefault();
                command.run();
                setMenuOpen(false);
              }}
            >
              /{command.id}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
