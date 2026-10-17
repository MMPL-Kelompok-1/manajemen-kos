import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

// Layout untuk halaman publik: landing page dan login.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
