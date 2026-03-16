"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_ROUTES, type PlanData } from "@/constants/landing";
import { useInView } from "@/lib/hooks/useInView";
import { getActivePlans } from "@/lib/api/services/plans";
import { mapLandingPlanFromDb } from "@/lib/api/mappers";

export function Pricing() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getActivePlans()
      .then((rows) => setPlans(rows.map(mapLandingPlanFromDb)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section id="precios" className="bg-muted py-20 lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Planes simples, sin sorpresas
          </h2>
          <p className="mt-3 text-muted-foreground">
            Elija el plan que mejor se adapte al tamaño de su institución.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-6 bg-background flex flex-col gap-5">
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-4 w-40" />
                </div>
                <Skeleton className="h-10 w-32" />
                <div className="space-y-2.5 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
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
            {plans.map((plan) => (
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
                className={`relative border rounded-lg p-6 bg-background flex flex-col ${
                  plan.highlighted ? "border-primary" : "border-border"
                }`}
              >
                {plan.tag && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-lg">
                    {plan.tag}
                  </Badge>
                )}

                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-muted-foreground">ARS</span>
                    <span className="text-3xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check
                        className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0"
                        strokeWidth={2}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  <a href={APP_ROUTES.REGISTER}>Comenzar</a>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}

        <p className="text-center mt-8 text-xs text-muted-foreground">
          Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}
