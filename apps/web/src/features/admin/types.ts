// Admin domain types

export interface AdminStats {
  activeSchools: number;
  pendingPayments: number;
  rejectedPayments: number;
  monthlyRevenue: number;
}

export interface AdminSchoolRow {
  id: string;
  name: string;
  email: string;
  city: string;
  province: string;
  plan: string;
  subscriptionStatus: string;
  paymentMethod: string;
  createdAt: string;
}

export interface AdminPaymentRow {
  id: string;
  companyId: string;
  companyName: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  rejectionReason: string | null;
  receiptUrl: string | null;
  paymentMethod: 'bank_transfer' | 'card' | 'credit_card' | 'debit_card';
  cardBrand: string | null;
  cardLastFour: string | null;
}

export interface AdminSchoolDetail {
  id: string;
  name: string;
  cuit: string;
  address: string;
  city: string;
  province: string;
  locality: string;
  postalCode: string;
  phone: string;
  email: string;
  plan: string;
  subscriptionStatus: string;
  paymentMethod: string;
  bankTransferStatus: string | null;
  isSubscribed: boolean;
  trialEndsAt: string | null;
  subscriptionRenewalDate: string | null;
  createdAt: string;
  employees: { id: string; name: string; email: string; role: string }[];
  services: Record<string, boolean> | null;
}

export type AdminDocumentModule =
  | 'fire_extinguishers'
  | 'conservation_certificates'
  | 'self_protection_systems'
  | 'qr_documents'
  | 'events';

export const ADMIN_MODULE_LABELS: Record<AdminDocumentModule, string> = {
  fire_extinguishers: 'Extintores',
  conservation_certificates: 'Certificados de conservación',
  self_protection_systems: 'Sistemas de autoprotección',
  qr_documents: 'Documentos QR',
  events: 'Eventos',
};

export interface ActivityLogRow {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface MonthlyMetric {
  month: string; // "Ene", "Feb", etc.
  registrations: number;
  active: number;
  cancelled: number;
  revenue: number;
}

export interface MetricsSummary {
  totalActive: number;
  newRegistrations: number;
  retentionRate: number;
  monthlyRevenue: number;
}

export interface SubscriptionPlanRow {
  id: string;
  key: string;
  name: string;
  price: number; // centavos
  features: string[];
  isActive: boolean;
  sortOrder: number;
  description: string;
  tag: string | null;
  highlighted: boolean;
  createdAt: string;
}
