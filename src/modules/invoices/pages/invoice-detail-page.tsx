import { Navigate, useParams } from "react-router-dom";

export function InvoiceDetailPage() {
  const params = useParams<{ invoiceId: string }>();
  return <Navigate to={params.invoiceId ? `/invoices?invoiceId=${params.invoiceId}` : "/invoices"} replace />;
}
