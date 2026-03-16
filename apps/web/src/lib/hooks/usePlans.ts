import { useState, useEffect } from 'react';
import type { Plan } from '@/types/company';
import { getActivePlans } from '@/lib/api/services/plans';
import { mapPlanFromDb } from '@/lib/api/mappers';

const TRIAL_PLAN: Plan = {
  id: 'trial',
  name: 'Prueba Gratis',
  price: '$0',
  priceNumber: 0,
  priceSuffix: '/14 días',
  features: ['Acceso completo', 'Sin tarjeta', '14 días'],
};

// Module-level cache to avoid refetching on re-renders
let cachedPlans: Plan[] | null = null;

export function usePlans(opts?: { includeTrial?: boolean }) {
  const [plans, setPlans] = useState<Plan[]>(cachedPlans ?? []);
  const [isLoading, setIsLoading] = useState(!cachedPlans);

  useEffect(() => {
    if (cachedPlans) return;
    let cancelled = false;

    getActivePlans()
      .then((rows) => {
        if (cancelled) return;
        const mapped = rows.map(mapPlanFromDb);
        cachedPlans = mapped;
        setPlans(mapped);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const result = opts?.includeTrial ? [TRIAL_PLAN, ...plans] : plans;
  return { plans: result, isLoading };
}
