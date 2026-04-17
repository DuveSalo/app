import type { ExpirationStatus } from '@/types/expirable';

export type DashboardItem = {
  id: string;
  name: string;
  type: string;
  expirationDate: string;
  modulePath: string;
  status: ExpirationStatus;
};
