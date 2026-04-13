import { Header } from '@/components/landing/layout/Header';
import { Footer } from '@/components/landing/layout/Footer';
import { Hero } from '@/components/landing/sections/Hero';
import { Features } from '@/components/landing/sections/Features';
import { HowItWorks } from '@/components/landing/sections/HowItWorks';
import { Pricing } from '@/components/landing/sections/Pricing';
import { FAQ } from '@/components/landing/sections/FAQ';
import { CTA } from '@/components/landing/sections/CTA';

function SectionDivider() {
  return <div className="section-divider mx-auto max-w-5xl" aria-hidden="true" />;
}

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <SectionDivider />
        <Features />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider />
        <Pricing />
        <SectionDivider />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
