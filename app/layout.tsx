import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Font: memakai Ubuntu jika terpasang di perangkat, lalu fallback sistem.
// Untuk memuat Ubuntu otomatis, gunakan next/font/google (lihat README).
export const metadata: Metadata = {
  title: "StayEase — Find Your Perfect Sanctuary",
  description:
    "Discover handpicked luxury rentals for your next unforgettable getaway.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-zinc-900">
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
