import { Navigate, useParams } from "react-router-dom";

export function ClientEditPage() {
  const params = useParams<{ clientId: string }>();
  return <Navigate to={params.clientId ? `/clients?drawer=edit-client&clientId=${params.clientId}` : "/clients"} replace />;
}
