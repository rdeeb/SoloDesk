import { Navigate } from "react-router-dom";

export function ProjectCreatePage() {
  return <Navigate to="/projects?drawer=new-project" replace />;
}
