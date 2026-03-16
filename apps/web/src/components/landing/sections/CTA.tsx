"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/constants/landing";
import { useInView } from "@/lib/hooks/useInView";

export function CTA() {
  const { ref, isInView } = useInView({ threshold: 0.2 });

  return (
    <section className="bg-background py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="bg-primary text-primary-foreground rounded-lg p-12 max-w-4xl mx-auto text-center"
        >
          <h2 className="text-2xl font-bold text-primary-foreground">
            Comience a proteger su escuela hoy
          </h2>

          <p className="text-sm text-primary-foreground/80 mt-3 max-w-md mx-auto">
            14 días gratis. Sin tarjeta de crédito. Configure en 5 minutos.
          </p>

          <Button
            asChild
            className="bg-background text-foreground hover:bg-background/90 h-11 px-8 text-base mt-6"
          >
            <a href={APP_ROUTES.REGISTER}>Comenzar gratis</a>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
