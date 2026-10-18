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
    BarChart3
} from "lucide-react";

interface AdminSidebarProps {
    children?: React.ReactNode;
}

export default function AdminSidebar({ children }: AdminSidebarProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
            {/* Mobile Backdrop */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar kiri */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-200 bg-zinc-100 transition-all duration-200 lg:static ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                    } ${isOpen ? "w-64" : "lg:w-16"}`}
            >
                {/* Header Sidebar */}
                <div className="flex h-14 items-center border-b border-zinc-200/70 px-4">
                    {isOpen ? (
                        <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-bold text-white">
                                K
                            </span>
                            <span className="font-bold text-zinc-900">KosanKu</span>
                        </div>
                    ) : (
                        <span className="mx-auto flex size-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-bold text-white">
                            K
                        </span>
                    )}
                </div>

                {/* Menu Navigasi */}
                <nav className="flex-1 space-y-1.5 p-3">
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${pathname === "/admin"
                            ? "bg-zinc-200 text-zinc-950 font-semibold"
                            : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
                            } ${!isOpen ? "lg:justify-center lg:px-2" : ""}`}
                        title="Dashboard"
                    >
                        <LayoutDashboard className="size-5 shrink-0" />
                        <span className={!isOpen ? "lg:hidden" : ""}>Dashboard</span>
                    </Link>

                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${pathname === "/admin/kos"
                            ? "bg-zinc-200 text-zinc-950 font-semibold"
                            : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
                            } ${!isOpen ? "lg:justify-center lg:px-2" : ""}`}
                        title="Manajemen Kos & Kamar"
                    >
                        <Building2 className="size-5 shrink-0" />
                        <span className={!isOpen ? "lg:hidden" : ""}>Manajemen Kos & Kamar</span>
                    </Link>

                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${pathname === "/admin/penghuni"
                            ? "bg-zinc-200 text-zinc-950 font-semibold"
                            : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
                            } ${!isOpen ? "lg:justify-center lg:px-2" : ""}`}
                        title="Manajemen Penghuni"
                    >
                        <Users className="size-5 shrink-0" />
                        <span className={!isOpen ? "lg:hidden" : ""}>Manajemen Penghuni</span>
                    </Link>

                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${pathname === "/admin/transaksi"
                            ? "bg-zinc-200 text-zinc-950 font-semibold"
                            : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
                            } ${!isOpen ? "lg:justify-center lg:px-2" : ""}`}
                        title="Transaksi & Riwayat Pembayaran"
                    >
                        <CreditCard className="size-5 shrink-0" />
                        <span className={!isOpen ? "lg:hidden" : ""}>Transaksi & Riwayat Pembayaran</span>
                    </Link>

                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${pathname === "/admin/laporan"
                            ? "bg-zinc-200 text-zinc-950 font-semibold"
                            : "text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-900"
                            } ${!isOpen ? "lg:justify-center lg:px-2" : ""}`}
                        title="Laporan Keuangan & Rekapitulasi"
                    >
                        <BarChart3 className="size-5 shrink-0" />
                        <span className={!isOpen ? "lg:hidden" : ""}>Laporan Keuangan & Rekapitulasi</span>
                    </Link>
                </nav>
            </aside>

            {/* Konten Kanan: Top Navbar + Children */}
            <div className="flex flex-1 flex-col min-w-0">
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-zinc-200/90 px-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (window.innerWidth < 1024) {
                                    setIsMobileOpen((prev) => !prev);
                                } else {
                                    setIsOpen((prev) => !prev);
                                }
                            }}
                            className="inline-flex size-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-300 transition-colors"
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
                        <span className="font-semibold text-zinc-900">Dashboard Admin</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <LogoutButton redirectTo="/admin/login" />
                    </div>
                </header>

                {/* Konten Halaman */}
                <div className="flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
}