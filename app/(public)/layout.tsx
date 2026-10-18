import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Layout untuk halaman publik: landing page dan login.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
