"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { APP_ROUTES } from "@/lib/landing-constants";
import { useInView } from "@/hooks/useInView";

export function CTA() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="relative py-24 lg:py-32 overflow-hidden bg-warm-950">
      {/* Dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 w-[600px] h-[400px] bg-brand-900/30 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-brand-800/20 rounded-full blur-[120px]" />
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center"
      >
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight font-[family-name:var(--font-heading)]">
          Comience a proteger su escuela hoy
        </h2>

        <p className="mt-5 text-lg text-warm-400 max-w-xl mx-auto leading-relaxed">
          14 días gratis. Sin tarjeta de crédito. Configure en 5 minutos.
        </p>

        <div className="mt-8">
          <Button
            asChild
            size="lg"
            className="rounded-xl bg-brand-600 hover:bg-brand-500 text-white px-8 h-13 text-base font-semibold shadow-md shadow-brand-600/25 transition-all hover:shadow-lg hover:shadow-brand-500/30"
          >
            <a href={APP_ROUTES.REGISTER}>
              Crear cuenta gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <p className="mt-5 text-sm text-warm-500 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-brand-500" />
          Sus datos están protegidos con encriptación de extremo a extremo.
        </p>
      </motion.div>
    </section>
  );
}
