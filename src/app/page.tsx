import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustSection from "@/components/TrustSection";
import HowItWorks from "@/components/HowItWorks";
import CaregiverProfiles from "@/components/CaregiverProfiles";
import VideoCallFeature from "@/components/VideoCallFeature";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <TrustSection />
      <HowItWorks />
      <CaregiverProfiles />
      <VideoCallFeature />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}
