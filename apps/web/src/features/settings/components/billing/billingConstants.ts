import { formatDateLocal } from '@/lib/utils/dateUtils';

export const CARD_BRANDS: Record<string, string> = {
  visa: 'Visa',
  master: 'Mastercard',
  amex: 'American Express',
  naranja: 'Naranja',
  cabal: 'Cabal',
  maestro: 'Maestro',
  debvisa: 'Visa Debito',
  debmaster: 'Mastercard Debito',
  argencard: 'Argencard',
  cencosud: 'Cencosud',
  diners: 'Diners Club',
  tarshop: 'Tarjeta Shopping',
  cmr: 'CMR Falabella',
  cordial: 'Cordial',
  cordobesa: 'Cordobesa',
};

export const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  approval_pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  suspended: { label: 'Suspendida', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelada', className: 'bg-red-50 text-red-700 border-red-200' },
  expired: { label: 'Expirada', className: 'bg-muted text-muted-foreground border-border' },
};

export const PAYMENT_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  approved: { label: 'Aprobado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  pending: { label: 'Pendiente', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  rejected: { label: 'Rechazado', className: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Reembolsado', className: 'bg-info/10 text-info border-info/30' },
  failed: { label: 'Fallido', className: 'bg-red-50 text-red-700 border-red-200' },
};

export const formatBillingDate = (dateStr: string | null) =>
  formatDateLocal(dateStr, { day: '2-digit', month: '2-digit', year: 'numeric' });
