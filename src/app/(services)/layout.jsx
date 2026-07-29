import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function ServicesLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="mt-16 lg:mt-20">{children}</div>
      <Footer />
    </div>
  );
}
