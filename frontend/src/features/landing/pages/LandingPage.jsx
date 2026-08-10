import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CaraKerja from "../components/CaraKerja";
import Fitur from "../components/Fitur";
import PratinjauOlap from "../components/PratinjauOlap";
import Faq from "../components/Faq";
import PenutupCta from "../components/PenutupCta";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-full w-full bg-white">
      <Navbar />
      <main>
        <Hero />
        <CaraKerja />
        <Fitur />
        <PratinjauOlap />
        <Faq />
      </main>
      <PenutupCta />
      <Footer />
    </div>
  );
}
