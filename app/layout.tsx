import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";

export const metadata: Metadata = {
  title: {
    default: "KosanKu: cari dan sewa kos",
    template: "%s | KosanKu",
  },
  description:
    "Temukan kos nyaman dengan harga yang jelas dan pembayaran yang mudah.",
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
      className={`${inter.variable} ${jakarta.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-ink-12">
        {children}
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
