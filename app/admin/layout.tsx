import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "owner") {
    redirect("/dashboard");
  }

  return <Sidebar userRole="admin">{children}</Sidebar>;
}
