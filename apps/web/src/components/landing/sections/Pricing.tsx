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
    <section id="precios" className="py-16 lg:py-24 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 tracking-tight">
            Planes simples, sin sorpresas
          </h2>
          <p className="mt-3 text-neutral-500 text-sm leading-relaxed">
            Elija el plan que mejor se adapte al tamaño de su institución.
          </p>
        </div>

        <motion.div
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.08 } },
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.4, ease: "easeOut" as const },
                },
              }}
              className={`relative border p-5 lg:p-6 flex flex-col rounded-lg ${
                plan.highlighted
                  ? "border-neutral-900 bg-neutral-50/30"
                  : "border-neutral-200 bg-white transition-colors hover:border-neutral-300"
              }`}
            >
              {plan.tag && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-neutral-900 text-white hover:bg-neutral-900 px-2 py-0.5 text-[11px] font-medium rounded-md">
                  {plan.tag}
                </Badge>
              )}

              <div className="mb-5">
                <h3 className="text-base font-semibold text-neutral-900">
                  {plan.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-1">{plan.description}</p>
              </div>

              <div className="mb-5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs text-neutral-500">ARS</span>
                  <span className="text-3xl font-bold text-neutral-900 font-[family-name:var(--font-mono)] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-neutral-500">{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-neutral-600"
                  >
                    <Check className="h-3.5 w-3.5 text-neutral-900 mt-0.5 flex-shrink-0" strokeWidth={2} />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={`w-full h-10 font-medium transition-colors rounded-md text-sm ${
                  plan.highlighted
                    ? "bg-neutral-900 hover:bg-neutral-800 text-white"
                    : "bg-neutral-900 hover:bg-neutral-800 text-white"
                }`}
              >
                <a href={APP_ROUTES.REGISTER}>Comenzar</a>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center mt-8 text-xs text-neutral-500">
          Todos los planes incluyen{" "}
          <span className="font-medium text-neutral-700">
            14 días de prueba gratuita
          </span>
          . Sin tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}
