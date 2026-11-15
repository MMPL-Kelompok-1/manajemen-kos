import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserDashboard } from "@/lib/data";

// Dipakai semua halaman /dashboard: cek login, lalu ambil data penghuni.
export async function requireUserDashboard() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "client") redirect("/admin");
  const data = await getUserDashboard(session.id);
  if (!data) redirect("/login");
  return data;
}
