export const queryKeys = {
  // User-facing
  notifications: (companyId: string) => ['notifications', companyId] as const,
  notificationCount: (companyId: string) => ['notificationCount', companyId] as const,
  notificationStats: (companyId: string) => ['notificationStats', companyId] as const,
  subscription: (companyId: string) => ['subscription', companyId] as const,
  payments: (companyId: string) => ['payments', companyId] as const,
  plans: () => ['plans'] as const,
  dashboard: (companyId: string) => ['dashboard', companyId] as const,

  // Admin
  adminStats: () => ['admin', 'stats'] as const,
  adminSchools: () => ['admin', 'schools'] as const,
  adminRecentSchools: (limit: number) => ['admin', 'recentSchools', limit] as const,
  adminPayments: () => ['admin', 'payments'] as const,
  adminPendingPayments: () => ['admin', 'pendingPayments'] as const,
  adminRecentSales: (limit: number) => ['admin', 'recentSales', limit] as const,
  adminActivity: () => ['admin', 'activity'] as const,
  adminMetricsSummary: () => ['admin', 'metricsSummary'] as const,
  adminMonthlyMetrics: () => ['admin', 'monthlyMetrics'] as const,
  adminPlans: () => ['admin', 'plans'] as const,
} as const;
