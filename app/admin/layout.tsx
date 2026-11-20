import { redirect } from "next/navigation";
import { Building2, ChartColumn, LayoutDashboard, ReceiptText, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import AppShell, { type NavItem } from "@/components/layout/AppShell";

export const instant = false;

// Hanya rute yang benar-benar ada.
const navItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard /> },
  { label: "Penghuni", href: "/admin/penghuni", icon: <Users /> },
  { label: "Transaksi & pembayaran", href: "/admin/transaksi", icon: <ReceiptText /> },
  { label: "Laporan keuangan", href: "/admin/laporan", icon: <ChartColumn /> },
  { label: "Manajemen kos & kamar", href: "/admin/manajemenkos", icon: <Building2 /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/dashboard");

  return (
    <AppShell navItems={navItems} title="Admin">
      {children}
    </AppShell>
  );
}
