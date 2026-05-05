import { Navigate, useParams } from "react-router-dom";

export function ProjectEditPage() {
  const params = useParams<{ projectId: string }>();
  return <Navigate to={params.projectId ? `/projects/${params.projectId}/tasks?drawer=edit-project` : "/projects"} replace />;
}
