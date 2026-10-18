import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthModalProvider } from "@/components/auth/AuthModalContext";
import AuthModal from "@/components/auth/AuthModal";

// Layout untuk halaman publik: landing page dan login.
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthModalProvider>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <AuthModal />
    </AuthModalProvider>
  );
}
