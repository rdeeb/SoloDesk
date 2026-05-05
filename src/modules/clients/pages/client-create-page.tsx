import { Navigate } from "react-router-dom";

export function ClientCreatePage() {
  return <Navigate to="/clients?drawer=new-client" replace />;
}
