import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForms from "@/components/auth/AuthForms";
import { getSession } from "@/lib/auth";

type Props = { searchParams: Promise<{ tab?: string; kos?: string }> };

export default function LoginPage(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-[70svh]" />}>
      <LoginContent {...props} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }: Props) {
  const { tab, kos } = await searchParams;
  const session = await getSession();

  // Sudah masuk: langsung ke dashboard yang sesuai.
  if (session?.role === "admin") redirect("/admin");
  if (session?.role === "user") {
    redirect(kos ? `/dashboard?kos=${encodeURIComponent(kos)}` : "/dashboard");
  }

  return (
    <AuthForms
      initialTab={tab === "daftar" ? "daftar" : "masuk"}
      kosId={kos ?? null}
    />
  );
}
