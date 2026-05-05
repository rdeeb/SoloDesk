import { Navigate, useParams, useSearchParams } from "react-router-dom";

export function InvoiceCreatePage() {
  const params = useParams<{ projectId: string }>();
  const [search] = useSearchParams();
  const projectId = params.projectId;
  const clientIdFromQuery = search.get("clientId") ?? undefined;
  const base = projectId ? `/projects/${projectId}/invoices` : "/invoices";
  const clientQuery = clientIdFromQuery ? `&clientId=${clientIdFromQuery}` : "";
  return <Navigate to={`${base}?drawer=new-invoice${clientQuery}`} replace />;
}
