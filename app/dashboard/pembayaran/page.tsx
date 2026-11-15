import { Suspense } from "react";
import PembayaranUser from "@/components/dashboard/PembayaranUser";
import { requireUserDashboard } from "@/lib/user-dashboard";

export default function PembayaranPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat...</p>}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  const data = await requireUserDashboard();
  return <PembayaranUser data={data} />;
}
