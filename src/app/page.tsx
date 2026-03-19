import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import Problem from "@/components/sections/Problem";
import FeaturesOverview from "@/components/sections/FeaturesOverview";
import HowItWorks from "@/components/sections/HowItWorks";
import VisionAssistDemo from "@/components/sections/VisionAssistDemo";
import LiveCaptionsDemo from "@/components/sections/LiveCaptionsDemo";
import AudioToolsDemo from "@/components/sections/AudioToolsDemo";
import WebOverlayDemo from "@/components/sections/WebOverlayDemo";
import VoiceCommandDemo from "@/components/sections/VoiceCommandDemo";
import AICompanionDemo from "@/components/sections/AICompanionDemo";
import UseCases from "@/components/sections/UseCases";
import Stats from "@/components/sections/Stats";
import Mission from "@/components/sections/Mission";
import Testimonials from "@/components/sections/Testimonials";
import AccessibilityCommitment from "@/components/sections/AccessibilityCommitment";
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
      <VisionAssistDemo />
      <LiveCaptionsDemo />
      <AudioToolsDemo />
      <WebOverlayDemo />
      <VoiceCommandDemo />
      <AICompanionDemo />
      <UseCases />
      <Stats />
      <Mission />
      <Testimonials />
      <AccessibilityCommitment />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
