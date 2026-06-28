import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingNav } from "@/components/landing/landing-nav";
import { LandingProof } from "@/components/landing/landing-proof";
import "@/components/landing/landing.css";

export default function HomePage() {
  return (
    <div className="landing-page flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingProof />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
