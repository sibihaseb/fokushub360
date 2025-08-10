import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { TestimonialsSection } from "@/components/testimonials-section";
import { PricingSection } from "@/components/pricing-section";
import { AuthSection } from "@/components/auth-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
import { SimpleCookieConsent } from "@/components/simple-cookie-consent";

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <AuthSection />
      <CTASection />
      <Footer />
      <SimpleCookieConsent />
    </div>
  );
}
