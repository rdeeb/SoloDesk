import { Navigate, useParams } from "react-router-dom";

export function ClientDetailPage() {
  const params = useParams<{ clientId: string }>();
  return <Navigate to={params.clientId ? `/clients?clientId=${params.clientId}` : "/clients"} replace />;
}
