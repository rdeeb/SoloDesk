import { Navigate, useParams } from "react-router-dom";

export function TaskCreatePage() {
  const params = useParams<{ projectId: string }>();
  const lockedProjectId = params.projectId;

  return <Navigate to={lockedProjectId ? `/projects/${lockedProjectId}/tasks?drawer=new-task` : "/tasks?drawer=new-task"} replace />;
}
