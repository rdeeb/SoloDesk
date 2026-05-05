import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { docsRepository } from "@/modules/docs/docs.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import type { EditorJSON } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";

const NovelEditor = lazy(() => import("@/modules/editor/components/novel-editor").then((module) => ({ default: module.NovelEditor })));

export function DocEditorPage() {
  const navigate = useNavigate();
  const params = useParams<{ docId: string }>();
  const doc = useLiveQuery(
    async () => {
      if (!params.docId) {
        return undefined;
      }
      return docsRepository.getById(params.docId);
    },
    [params.docId],
    null
  );
  const project = useLiveQuery(
    async () => {
      if (!doc?.projectId) {
        return undefined;
      }
      return projectRepository.getById(doc.projectId);
    },
    [doc?.projectId],
    null
  );

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState<EditorJSON>({ type: "doc", content: [{ type: "paragraph" }] });
  const initializedDocId = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!doc || doc.deletedAt) {
      return;
    }

    if (initializedDocId.current === doc.id) {
      return;
    }

    initializedDocId.current = doc.id;
    setTitle(doc.title);
    setContent(doc.content);
  }, [doc]);

  const backTo = useMemo(() => {
    if (!doc) {
      return "/docs";
    }
    return doc.projectId ? `/projects/${doc.projectId}/docs` : "/docs";
  }, [doc]);

  useEffect(() => {
    if (!doc || doc.deletedAt || initializedDocId.current !== doc.id) {
      return;
    }

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      void docsRepository.update(doc.id, { title, content });
    }, 450);

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [content, doc, title]);

  if (!params.docId) {
    return <Navigate to="/docs" replace />;
  }

  if (doc === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading editor...</div>;
  }

  if (!doc || doc.deletedAt) {
    return <Navigate to="/docs" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-xl font-semibold tracking-tight"
            placeholder="Untitled"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {doc.projectId ? (
              project?.deletedAt ? (
                "Project deleted"
              ) : project ? (
                <Link className="underline" to={`/projects/${project.id}/docs`}>
                  {project.name}
                </Link>
              ) : (
                "Project doc"
              )
            ) : (
              "Standalone doc"
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(backTo)}>
            Back
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              await docsRepository.softDelete(doc.id);
              navigate(backTo);
            }}
          >
            Move to trash
          </Button>
        </div>
      </div>

      <Suspense fallback={<div className="min-h-[520px] py-1 text-sm text-muted-foreground">Loading editor...</div>}>
        <NovelEditor content={content} onContentChange={setContent} minHeightClassName="min-h-[520px]" />
      </Suspense>
    </div>
  );
}
