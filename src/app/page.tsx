import CTASection from "@/components/home/cta-section";
import FaqSection from "@/components/home/faq-section";
import FeaturesSection from "@/components/home/features-section";
import HeroSection from "@/components/home/hero-section";
import HowItWorksSection from "@/components/home/how-it-works-section";
import TokenCountSection from "@/components/home/token-count-section";

export default function Home() {
  return (
    <div className="bg-[#0a0a0a] overflow-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TokenCountSection />
      <FaqSection />
      <CTASection />
    </div>
  );
}