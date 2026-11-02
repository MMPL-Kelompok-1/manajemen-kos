import type { Metadata } from "next";
import Script from "next/script"; // 1. Impor Script dari next/script
import "./globals.css";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "KosanKu — Find Your Perfect Sanctuary",
  description:
    "Temukan kos nyaman dengan harga yang jelas dan pembayaran yang mudah.",
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className="h-full antialiased scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />

      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        {children}
        <ThemeToggle />
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("kosanku-theme");var isDark=t==="dark"||t==="mocha"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;if(isDark){root.classList.add("dark","dark-theme");root.style.colorScheme="dark";}else{root.classList.add("light","light-theme");root.style.colorScheme="light";}}catch(e){}})()`,
          }}
        />
      </body>
    </html>
  );
}
