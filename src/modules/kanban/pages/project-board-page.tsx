import { CSS } from "@dnd-kit/utilities";
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { useLiveQuery } from "dexie-react-hooks";
import { Link, Navigate, useParams } from "react-router-dom";
import { kanbanRepository } from "@/modules/kanban/kanban.repository";
import { projectRepository } from "@/modules/projects/project.repository";
import { taskRepository } from "@/modules/tasks/task.repository";
import type { KanbanStatus, Task } from "@/shared/types/domain";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

function BoardTaskCard({ task, projectId }: { task: Task; projectId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id
  });

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-md border bg-background p-3 text-sm shadow-sm",
        isDragging && "z-10 opacity-70 shadow-md"
      )}
      {...listeners}
      {...attributes}
    >
      <p className="font-medium">{task.title}</p>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{task.priority ?? "no priority"}</span>
        <span>{task.dueDate ?? ""}</span>
      </div>
      <Link to={`/projects/${projectId}/tasks?taskId=${task.id}`} className="mt-2 block text-xs font-medium underline">
        Open
      </Link>
    </article>
  );
}

function BoardColumn({ status, tasks, projectId }: { status: KanbanStatus; tasks: Task[]; projectId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id
  });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-80 w-72 shrink-0 flex-col rounded-lg border bg-card",
        isOver && "ring-2 ring-ring"
      )}
    >
      <header className="flex items-center justify-between border-b px-3 py-2">
        <div>
          <h3 className="text-sm font-semibold">{status.name}</h3>
          <p className="text-xs text-muted-foreground">{tasks.length} tasks</p>
        </div>
        {status.isDone ? <span className="text-xs text-muted-foreground">Done</span> : null}
      </header>
      <div className="flex flex-1 flex-col gap-2 p-2">
        {tasks.map((task) => (
          <BoardTaskCard key={task.id} task={task} projectId={projectId} />
        ))}
      </div>
    </section>
  );
}

export function ProjectBoardPage() {
  const params = useParams<{ projectId: string }>();
  const project = useLiveQuery(
    async () => {
      if (!params.projectId) {
        return undefined;
      }
      return projectRepository.getById(params.projectId);
    },
    [params.projectId],
    null
  );
  const statuses = useLiveQuery(() => kanbanRepository.listActive(), [], []);
  const tasks = useLiveQuery(
    async () => {
      if (!params.projectId) {
        return [];
      }
      return taskRepository.listActiveByProjectId(params.projectId);
    },
    [params.projectId],
    []
  );

  if (!params.projectId) {
    return <Navigate to="/projects" replace />;
  }

  if (project === null) {
    return <div className="p-4 text-sm text-muted-foreground">Loading board...</div>;
  }

  if (!project || project.deletedAt) {
    return <Navigate to="/projects" replace />;
  }

  async function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const statusId = event.over?.id ? String(event.over.id) : undefined;

    if (!statusId) {
      return;
    }

    const task = tasks.find((candidate) => candidate.id === taskId);
    if (!task || task.statusId === statusId) {
      return;
    }

    await taskRepository.moveToStatus(taskId, statusId);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{project.name} Board</h2>
          <p className="text-sm text-muted-foreground">Global Kanban statuses, filtered to this project.</p>
        </div>
        <Link to={`/projects/${project.id}/tasks?drawer=new-task`}>
          <Button>New task</Button>
        </Link>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <BoardColumn
              key={status.id}
              status={status}
              tasks={tasks.filter((task) => task.statusId === status.id)}
              projectId={project.id}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
