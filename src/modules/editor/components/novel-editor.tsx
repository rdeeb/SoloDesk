import { CheckSquare, Code, GripVertical, Heading1, Heading2, Heading3, List, ListOrdered, Pilcrow, Quote, SeparatorHorizontal } from "lucide-react";
import {
  Command,
  createSuggestionItems,
  EditorCommand,
  EditorCommandEmpty,
  EditorCommandItem,
  EditorCommandList,
  EditorContent,
  EditorRoot,
  GlobalDragHandle,
  handleCommandNavigation,
  HorizontalRule,
  Placeholder,
  renderItems,
  StarterKit,
  TaskItem,
  TaskList,
  type EditorContentProps,
  type JSONContent
} from "novel";
import type { EditorJSON } from "@/shared/types/domain";
import { cn } from "@/shared/lib/utils";

interface NovelEditorProps {
  content: EditorJSON;
  onContentChange: (content: EditorJSON) => void;
  className?: string;
  minHeightClassName?: string;
}

function isInTaskContextAtPos(editor: any, pos: number) {
  const $pos = editor.state.doc.resolve(pos);
  for (let depth = 0; depth <= $pos.depth; depth += 1) {
    const typeName = $pos.node(depth).type.name;
    if (typeName === "taskList" || typeName === "taskItem") {
      return true;
    }
  }

  return false;
}

const suggestionItems = createSuggestionItems([
  {
    title: "Text",
    description: "Plain paragraph",
    icon: <Pilcrow aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    }
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: <Heading1 aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    }
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <Heading2 aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    }
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <Heading3 aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    }
  },
  {
    title: "Bullet List",
    description: "Simple unordered list",
    icon: <List aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    }
  },
  {
    title: "Numbered List",
    description: "Ordered list",
    icon: <ListOrdered aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    }
  },
  {
    title: "Checklist",
    description: "Track subtasks",
    icon: <CheckSquare aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    }
  },
  {
    title: "Quote",
    description: "Call out a note",
    icon: <Quote aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    }
  },
  {
    title: "Code",
    description: "Code block",
    icon: <Code aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    }
  },
  {
    title: "Divider",
    description: "Visual separator",
    icon: <SeparatorHorizontal aria-hidden="true" />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    }
  }
]);

const extensions = [
  StarterKit.configure({
    horizontalRule: false
  }),
  HorizontalRule,
  TaskList,
  TaskItem.configure({
    nested: true
  }),
  GlobalDragHandle.configure({
    dragHandleWidth: 24,
    scrollTreshold: 80,
    dragHandleSelector: ".novel-drag-handle"
  }),
  Placeholder.configure({
    placeholder: ({ editor, node, pos }) => {
      if (isInTaskContextAtPos(editor, pos)) {
        return undefined as unknown as string;
      }

      return node.type.name === "heading" ? `Heading ${node.attrs.level}` : "Type '/' for commands";
    }
  }),
  Command.configure({
    suggestion: {
      items: ({ editor }: { editor: { state: { selection: { $from: { pos: number } } } } }) => {
        if (isInTaskContextAtPos(editor, editor.state.selection.$from.pos)) {
          return [];
        }

        return suggestionItems;
      },
      render: renderItems
    }
  })
] as unknown as NonNullable<EditorContentProps["extensions"]>;

export function NovelEditor({ content, onContentChange, className, minHeightClassName = "min-h-[320px]" }: NovelEditorProps) {
  return (
    <EditorRoot>
      <EditorContent
        initialContent={content as JSONContent}
        extensions={extensions}
        onUpdate={({ editor }) => onContentChange(editor.getJSON() as EditorJSON)}
        editorProps={{
          attributes: {
            class: cn(
              "tiptap h-full w-full bg-transparent px-0 py-1 text-base leading-7 outline-none",
              minHeightClassName,
              "focus-visible:outline-none"
            )
          },
          handleDOMEvents: {
            keydown: (_view, event) => handleCommandNavigation(event)
          }
        }}
        className={cn("novel-editor relative min-h-0 flex-1", className)}
      >
        <div className="novel-drag-handle drag-handle" aria-hidden="true">
          <GripVertical className="size-4" />
        </div>
        <EditorCommand className="z-50 max-h-72 w-72 overflow-y-auto rounded-md border bg-card p-1 shadow-md">
          <EditorCommandEmpty className="px-3 py-2 text-sm text-muted-foreground">No results</EditorCommandEmpty>
          <EditorCommandList>
            {suggestionItems.map((item) => (
              <EditorCommandItem
                key={item.title}
                value={item.title}
                onCommand={(value) => item.command?.(value)}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent aria-selected:bg-accent"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block font-medium">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.description}</span>
                </span>
              </EditorCommandItem>
            ))}
          </EditorCommandList>
        </EditorCommand>
      </EditorContent>
    </EditorRoot>
  );
}
