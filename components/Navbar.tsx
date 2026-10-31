"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthModal } from "@/components/auth/AuthModalContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [tokenExists, setTokenExists] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const { openModal } = useAuthModal();

  useEffect(() => {
    // 1. Cek token di localStorage / sessionStorage jika ada yang disimpan di client
    const localToken =
      typeof window !== "undefined"
        ? localStorage.getItem("token") ||
        localStorage.getItem("authToken") ||
        localStorage.getItem("accessToken") ||
        sessionStorage.getItem("token")
        : null;

    if (localToken) {
      setTokenExists(true);
    }

    // 2. Cek token sesi via API backend (/api/auth/me) yang membaca cookie KosanKu_session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setTokenExists(true);
          if (data.user?.role === "owner") {
            setDashboardHref("/admin");
          } else {
            setDashboardHref("/dashboard");
          }
        } else if (!localToken) {
          setTokenExists(false);
        }
      })
      .catch(() => {
        // Abaikan jika offline / request gagal
      });
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Search size={16} />
          </span>
          KosanKu
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <Link href="/#home" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/#about" className="hover:text-foreground">
            About
          </Link>
          <Link href="/#product" className="hover:text-foreground">
            Products
          </Link>
          <Link href="/#contact" className="hover:text-foreground">
            Contact
          </Link>
          <Link href="/#faq" className="hover:text-foreground">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {tokenExists ? (
            <Link
              href={dashboardHref}
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openModal("masuk")}
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted sm:inline-flex"
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => openModal("daftar")}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-muted hover:text-foreground"
              >
                Daftar
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Buka menu"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted md:hidden"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-background px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            <li>
              <Link
                href="/#home"
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-background"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/#about"
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-background"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/#product-gallery"
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-background"
              >
                Products
              </Link>
            </li>
            <li>
              <Link
                href="/#contact"
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-background"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/#faq"
                className="block rounded-xl px-3 py-3 text-base font-medium text-foreground hover:bg-background"
              >
                FAQ
              </Link>
            </li>
          </ul>
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {tokenExists ? (
              <Link
                href={dashboardHref}
                onClick={() => setMobileOpen(false)}
                className="w-full rounded-xl bg-primary py-3 text-center text-sm font-medium text-primary-foreground transition hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    openModal("masuk");
                    setMobileOpen(false);
                  }}
                  className="w-full rounded-xl border border-border py-3 text-center text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openModal("daftar");
                    setMobileOpen(false);
                  }}
                  className="w-full rounded-xl bg-primary py-3 text-center text-sm font-medium text-primary-foreground transition hover:bg-muted hover:text-foreground"
                >
                  Daftar
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
