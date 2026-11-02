"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  User,
  Home,
  LucideIcon,
} from "lucide-react";

interface AdminSidebarProps {
  children?: React.ReactNode;
  userRole?: string; // Dapat dioper dari parent/session, misal: "admin" | "penghuni" | "client"
}

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export default function Sidebar({
  children,
  userRole = "admin", // Default role jika tidak dioper
}: AdminSidebarProps) {
  // Gunakan Lazy Initializer untuk membaca localStorage tanpa memicu cascading render error
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_sidebar_open");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  const toggleDesktopSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      localStorage.setItem("admin_sidebar_open", String(next));
      return next;
    });
  };

  // Dapatkan item navigasi berdasarkan role user
  const navItems = getNavItems(userRole);

  return (
    <div className="relative flex min-h-screen w-full bg-muted text-foreground">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar kiri - Posisi tetap (sticky h-screen) di desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 overflow-y-auto ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isOpen ? "w-64" : "lg:w-16"}`}
      >
        {/* Header Sidebar */}
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                K
              </span>
              <span className="font-bold text-foreground">KosanKu</span>
            </div>
          ) : (
            <span className="mx-auto flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              K
            </span>
          )}
        </div>

        {/* Menu Navigasi Dinamis Berdasarkan Role */}
        <nav className="flex-1 space-y-1.5 p-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (pathname.startsWith(item.path) &&
                item.path !== "/admin" &&
                item.path !== "/dashboard");

            return (
              <Link
                key={item.id}
                href={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                } ${!isOpen ? "lg:justify-center lg:px-2" : ""}`}
                title={item.label}
              >
                <item.icon className="size-5 shrink-0" />
                <span className={!isOpen ? "lg:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Konten Kanan: Top Navbar + Children */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/90 px-4 sm:px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileOpen((prev) => !prev);
                } else {
                  toggleDesktopSidebar();
                }
              }}
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-border transition-colors"
              aria-label="Toggle sidebar"
            >
              {/* Sidebar toggle icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="size-5"
              >
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </button>
            <span className="font-semibold text-foreground">
              {userRole === "admin" ? "Dashboard Admin" : "Dashboard Penghuni"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <LogoutButton redirectTo="/login" />
          </div>
        </header>

        {/* Konten Halaman */}
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

/**
 * Helper function untuk menentukan menu berdasarkan role
 */
function getNavItems(role: string): NavItem[] {
  switch (role.toLowerCase()) {
    case "admin":
      return [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/admin/dashboard",
        },
        {
          id: "kos",
          label: "Manajemen Kos & Kamar",
          icon: Building2,
          path: "/admin/manajemenkos",
        },
        {
          id: "penghuni",
          label: "Manajemen Penghuni",
          icon: Users,
          path: "/admin/penghuni",
        },
        {
          id: "transaksi",
          label: "Transaksi & Pembayaran",
          icon: CreditCard,
          path: "/admin/transaksi",
        },
        {
          id: "laporan",
          label: "Laporan Keuangan",
          icon: BarChart3,
          path: "/admin/laporan",
        },
      ];

    case "penghuni":
    case "client":
    case "user":
      return [
        {
          id: "user-dashboard",
          label: "Dashboard Saya",
          icon: LayoutDashboard,
          path: "/dashboard",
        },
        {
          id: "user-kamar",
          label: "Info Kamar Saya",
          icon: Home,
          path: "/dashboard/kamar",
        },
        {
          id: "user-pembayaran",
          label: "Tagihan & Pembayaran",
          icon: CreditCard,
          path: "/dashboard/pembayaran",
        },
        {
          id: "user-profil",
          label: "Profil Saya",
          icon: User,
          path: "/dashboard/profil",
        },
      ];

    default:
      return [];
  }
}
