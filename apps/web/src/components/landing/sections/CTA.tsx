"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { APP_ROUTES } from "@/lib/landing-constants";
import { useInView } from "@/hooks/useInView";

export function CTA() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="relative py-16 lg:py-24 overflow-hidden bg-neutral-950">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight">
          Comience a proteger su escuela hoy
        </h2>

        <p className="mt-4 text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
          14 días gratis. Sin tarjeta de crédito. Configure en 5 minutos.
        </p>

        <div className="mt-7">
          <Button
            asChild
            size="lg"
            className="bg-white hover:bg-neutral-100 text-neutral-900 px-6 h-11 text-sm font-medium transition-colors rounded-md"
          >
            <a href={APP_ROUTES.REGISTER}>
              Crear cuenta gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>

        <p className="mt-4 text-xs text-neutral-600 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-neutral-500" />
          Datos protegidos con encriptación de extremo a extremo.
        </p>
      </motion.div>
    </section>
  );
}
