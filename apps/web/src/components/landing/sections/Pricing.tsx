'use client';

import { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { APP_ROUTES, type PlanData } from '@/constants/landing';
import { useInView } from '@/lib/hooks/useInView';
import { getActivePlans } from '@/lib/api/services/plans';
import { mapLandingPlanFromDb } from '@/lib/api/mappers';

const FALLBACK_PLANS: PlanData[] = [
  {
    id: 'basic',
    name: 'Básico',
    price: '5.990',
    priceNumber: 5990,
    period: '/mes',
    description: 'Para escuelas pequeñas',
    features: [
      'Todos los módulos de gestión',
      'Hasta 3 usuarios',
      'Alertas de vencimiento por email',
      'Soporte por email',
    ],
    highlighted: false,
  },
  {
    id: 'standard',
    name: 'Estándar',
    price: '9.990',
    priceNumber: 9990,
    period: '/mes',
    description: 'Para instituciones medianas',
    features: [
      'Todo en Básico',
      'Usuarios ilimitados',
      'Alertas avanzadas configurables',
      'Historial completo de documentos',
      'Soporte prioritario',
    ],
    highlighted: true,
    tag: 'Más popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '14.990',
    priceNumber: 14990,
    period: '/mes',
    description: 'Para redes educativas',
    features: [
      'Todo en Estándar',
      'Múltiples sedes',
      'Reportes personalizados',
      'Exportación de datos',
      'Soporte dedicado',
    ],
    highlighted: false,
  },
];

export function Pricing() {
  const { ref, isInView } = useInView({ threshold: 0.1 });
  const [plans, setPlans] = useState<PlanData[]>(FALLBACK_PLANS);

  useEffect(() => {
    getActivePlans()
      .then((rows) => {
        const mapped = rows.map(mapLandingPlanFromDb);
        if (mapped.length > 0) setPlans(mapped);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="precios" className="bg-muted py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Precios
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
            Planes simples, sin sorpresas
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Elija el plan que mejor se adapte al tamaño de su institución.
          </p>
        </div>

        <div
          ref={ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto items-start landing-fade-in ${isInView ? 'is-visible' : ''}`}
        >
          {plans.map((plan) => {
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.id}
                className={`landing-stagger-item relative rounded-lg p-6 flex flex-col transition-all duration-200 ${
                  isHighlighted
                    ? 'bg-primary text-primary-foreground border border-primary md:-my-4 md:py-10'
                    : 'bg-background border border-border'
                }`}
              >
                {plan.tag && (
                  <Badge
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-lg ${
                      isHighlighted ? 'bg-background text-foreground hover:bg-background' : ''
                    }`}
                  >
                    {plan.tag}
                  </Badge>
                )}

                <div className="mb-5">
                  <h3
                    className={`text-lg font-semibold ${isHighlighted ? 'text-primary-foreground' : 'text-foreground'}`}
                  >
                    {plan.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${isHighlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-xs ${isHighlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                    >
                      ARS
                    </span>
                    <span
                      className={`text-3xl font-bold ${isHighlighted ? 'text-primary-foreground' : 'text-foreground'}`}
                    >
                      ${plan.price}
                    </span>
                    <span
                      className={`text-sm ${isHighlighted ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2 text-sm ${isHighlighted ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}
                    >
                      <Check
                        className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isHighlighted ? 'text-emerald-400' : 'text-emerald-600'}`}
                        strokeWidth={2}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={isHighlighted ? 'default' : 'ghost'}
                  className={`w-full ${
                    isHighlighted
                      ? 'bg-background text-foreground hover:bg-background/90'
                      : 'border border-input'
                  }`}
                >
                  <a href={APP_ROUTES.REGISTER}>Comenzar</a>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center mt-10 text-xs text-muted-foreground">
          Todos los planes incluyen 14 días de prueba gratuita. Sin tarjeta de crédito.
        </p>
      </div>
    </section>
  );
}
