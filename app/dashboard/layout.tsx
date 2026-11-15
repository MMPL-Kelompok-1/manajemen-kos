import UserShell from "@/components/dashboard/UserShell";

// Membungkus semua halaman di /dashboard dengan sidebar penghuni.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <UserShell>{children}</UserShell>;
}
