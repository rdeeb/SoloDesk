import { Navigate, useParams } from "react-router-dom";

export function TaskEditPage() {
  const params = useParams<{ taskId: string }>();
  return <Navigate to={params.taskId ? `/tasks?drawer=edit-task&taskId=${params.taskId}` : "/tasks"} replace />;
}
