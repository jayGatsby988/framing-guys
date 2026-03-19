import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import FeaturesOverview from "@/components/sections/FeaturesOverview";
import HowItWorks from "@/components/sections/HowItWorks";
import UseCases from "@/components/sections/UseCases";
import Stats from "@/components/sections/Stats";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <main id="main-content">
      <Navbar />
      <Hero />
      <Problem />
      <FeaturesOverview />
      <HowItWorks />
      <UseCases />
      <Stats />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
