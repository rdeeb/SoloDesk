import { Navigate, useParams } from "react-router-dom";

export function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  return <Navigate to={params.projectId ? `/projects/${params.projectId}/tasks` : "/projects"} replace />;
}
