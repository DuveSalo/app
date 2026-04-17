import { queryKeys } from '@/lib/queryKeys';

export type TableConfig = {
  table: string;
  filterColumn: string | null;
  getQueryKeys: (companyId: string | null) => readonly (readonly unknown[])[];
};

export const USER_TABLES: TableConfig[] = [
  {
    table: 'fire_extinguishers',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [
      queryKeys.fireExtinguishers.list(companyId!),
      queryKeys.dashboard(companyId!),
    ],
  },
  {
    table: 'conservation_certificates',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [
      queryKeys.certificates.list(companyId!),
      queryKeys.dashboard(companyId!),
    ],
  },
  {
    table: 'self_protection_systems',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [
      queryKeys.systems.list(companyId!),
      queryKeys.dashboard(companyId!),
    ],
  },
  {
    table: 'qr_documents',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [
      queryKeys.qrDocuments.list(companyId!),
      queryKeys.dashboard(companyId!),
    ],
  },
  {
    table: 'events',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [
      queryKeys.events.list(companyId!),
      queryKeys.dashboard(companyId!),
    ],
  },
  {
    table: 'manual_payments',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [queryKeys.payments(companyId!)],
  },
  {
    table: 'subscriptions',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [queryKeys.subscription(companyId!)],
  },
  {
    table: 'notifications',
    filterColumn: 'company_id',
    getQueryKeys: (companyId) => [
      queryKeys.notifications(companyId!),
      queryKeys.notificationCount(companyId!),
    ],
  },
];

export const ADMIN_TABLES: TableConfig[] = [
  {
    table: 'companies',
    filterColumn: null,
    getQueryKeys: () => [
      queryKeys.adminSchools(),
      queryKeys.adminRecentSchools(10),
      queryKeys.adminStats(),
    ],
  },
  {
    table: 'manual_payments',
    filterColumn: null,
    getQueryKeys: () => [
      queryKeys.adminPayments(),
      queryKeys.adminPendingPayments(),
      queryKeys.adminRecentSales(10),
      queryKeys.adminStats(),
    ],
  },
  {
    table: 'subscriptions',
    filterColumn: null,
    getQueryKeys: () => [queryKeys.adminStats()],
  },
];
