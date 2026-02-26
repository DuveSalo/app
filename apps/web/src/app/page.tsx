import { Header } from "@/components/landing/layout/Header";
import { Footer } from "@/components/landing/layout/Footer";
import { Hero } from "@/components/landing/sections/Hero";
import { Features } from "@/components/landing/sections/Features";
import { HowItWorks } from "@/components/landing/sections/HowItWorks";
import { Pricing } from "@/components/landing/sections/Pricing";
import { Testimonials } from "@/components/landing/sections/Testimonials";
import { FAQ } from "@/components/landing/sections/FAQ";
import { CTA } from "@/components/landing/sections/CTA";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
