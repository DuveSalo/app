export const queryKeys = {
  // User-facing
  notifications: (companyId: string) => ['notifications', companyId] as const,
  notificationCount: (companyId: string) => ['notificationCount', companyId] as const,
  notificationStats: (companyId: string) => ['notificationStats', companyId] as const,
  subscription: (companyId: string) => ['subscription', companyId] as const,
  payments: (companyId: string) => ['payments', companyId] as const,
  plans: () => ['plans'] as const,
  dashboard: (companyId: string) => ['dashboard', companyId] as const,

  // Domain modules
  fireExtinguishers: {
    all: ['fireExtinguishers'] as const,
    list: (companyId: string) => ['fireExtinguishers', companyId] as const,
    detail: (id: string) => ['fireExtinguishers', 'detail', id] as const,
  },
  certificates: {
    all: ['certificates'] as const,
    list: (companyId: string) => ['certificates', companyId] as const,
    detail: (id: string) => ['certificates', 'detail', id] as const,
  },
  systems: {
    all: ['systems'] as const,
    list: (companyId: string) => ['systems', companyId] as const,
    detail: (id: string) => ['systems', 'detail', id] as const,
  },
  events: {
    all: ['events'] as const,
    list: (companyId: string) => ['events', companyId] as const,
    detail: (id: string) => ['events', 'detail', id] as const,
  },
  qrDocuments: {
    all: ['qrDocuments'] as const,
    list: (companyId: string, type?: string) =>
      type ? (['qrDocuments', companyId, type] as const) : (['qrDocuments', companyId] as const),
    detail: (id: string) => ['qrDocuments', 'detail', id] as const,
  },

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
