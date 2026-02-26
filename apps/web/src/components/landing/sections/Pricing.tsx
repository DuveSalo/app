"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/landing/ui/button";
import { Badge } from "@/components/landing/ui/badge";
import { APP_ROUTES, PLANS } from "@/lib/landing-constants";
import { useInView } from "@/hooks/useInView";

export function Pricing() {
  const { ref, isInView } = useInView({ threshold: 0.1 });

  return (
    <section id="precios" className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-warm-900 tracking-tight font-[family-name:var(--font-heading)]">
            Planes simples, sin sorpresas
          </h2>
          <p className="mt-4 text-warm-500 text-lg leading-relaxed">
            Elija el plan que mejor se adapte al tamaño de su institución.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.5, ease: "easeOut" as const },
                },
              }}
              className={`relative rounded-2xl border p-6 lg:p-8 flex flex-col ${
                plan.highlighted
                  ? "border-brand-600 bg-brand-50/30 shadow-md ring-1 ring-brand-600"
                  : "border-warm-200 bg-white shadow-card hover:shadow-card-hover transition-all"
              }`}
            >
              {plan.tag && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-700 text-white hover:bg-brand-700 px-3 py-1 text-xs font-semibold rounded-full">
                  {plan.tag}
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-warm-900 font-[family-name:var(--font-heading)]">
                  {plan.name}
                </h3>
                <p className="text-sm text-warm-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-sm text-warm-500">ARS</span>
                  <span className="text-4xl font-bold text-warm-900 font-[family-name:var(--font-mono)] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-warm-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-warm-600"
                  >
                    <Check className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full rounded-xl h-11 font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-brand-700 hover:bg-brand-800 text-white shadow-sm"
                    : "bg-warm-900 hover:bg-warm-800 text-white"
                }`}
              >
                <a href={APP_ROUTES.REGISTER}>Comenzar</a>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center mt-8 text-sm text-warm-500">
          Todos los planes incluyen{" "}
          <span className="font-medium text-warm-700">
            14 días de prueba gratuita
          </span>
          . Sin tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}
