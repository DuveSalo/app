import { useQuery } from '@tanstack/react-query';
import type { Plan } from '@/types/company';
import { getActivePlans } from '@/lib/api/services/plans';
import { mapPlanFromDb } from '@/lib/api/mappers';
import { queryKeys } from '@/lib/queryKeys';

const TRIAL_PLAN: Plan = {
  id: 'trial',
  name: 'Prueba Gratis',
  price: '$0',
  priceNumber: 0,
  priceSuffix: '/14 días',
  features: ['Acceso completo', 'Sin tarjeta', '14 días'],
};

export function usePlans(opts?: { includeTrial?: boolean }) {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: queryKeys.plans(),
    queryFn: async () => {
      const rows = await getActivePlans();
      return rows.map(mapPlanFromDb);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });

  const result = opts?.includeTrial ? [TRIAL_PLAN, ...plans] : plans;
  return { plans: result, isLoading };
}

/** @deprecated Use queryClient.invalidateQueries({ queryKey: queryKeys.plans() }) instead */
export function invalidatePlansCache(): void {
  // Keep for backwards compat — callers should migrate to useQueryClient
}
