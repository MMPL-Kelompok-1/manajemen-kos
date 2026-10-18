import type { Metadata } from "next";
import "./globals.css";

// Font: memakai Ubuntu jika terpasang di perangkat, lalu fallback sistem.
// Untuk memuat Ubuntu otomatis, gunakan next/font/google (lihat README).
export const metadata: Metadata = {
  title: "KosanKu — Find Your Perfect Sanctuary",
  description: "Temukan kos nyaman dengan harga yang jelas dan pembayaran yang mudah.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-zinc-900">{children}</body>
    </html>
  );
}
