import { CalendarDays, CreditCard, KeyRound } from "lucide-react";
import AppShell, { type NavItem } from "@/components/layout/AppShell";

const navItems: NavItem[] = [
  { label: "Kos Anda", href: "/dashboard", icon: <KeyRound /> },
  { label: "Histori pesanan", href: "/dashboard/histori", icon: <CalendarDays /> },
  { label: "Pembayaran", href: "/dashboard/pembayaran", icon: <CreditCard /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell navItems={navItems} title="Penghuni">
      <div className="mx-auto w-full max-w-[800px] px-5 pb-12 pt-4 md:px-6 md:pt-6">{children}</div>
    </AppShell>
  );
}
