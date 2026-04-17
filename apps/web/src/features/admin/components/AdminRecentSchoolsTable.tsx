import { Building2, MapPin, Tag, CalendarDays, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateLocal } from '@/lib/utils/dateUtils';
import type { AdminSchoolRow, AdminPaymentRow } from '../types';
import { SubscriptionStatusBadge } from './SubscriptionStatusBadge';

interface AdminRecentSchoolsTableProps {
  schools: AdminSchoolRow[];
  pendingPayments?: AdminPaymentRow[];
  onViewPayment?: (payment: AdminPaymentRow) => void;
}

export function AdminRecentSchoolsTable({
  schools,
  pendingPayments = [],
  onViewPayment,
}: AdminRecentSchoolsTableProps) {
  if (schools.length === 0) {
    return (
      <section>
        <h2 className="text-base font-medium mb-3">Escuelas recientes</h2>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg">
          <Building2 className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm">No hay escuelas recientes</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-base font-medium mb-3">Escuelas recientes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {schools.map((school) => {
          const isPending = school.subscriptionStatus === 'pending';
          const matchingPayment = isPending
            ? pendingPayments.find((p) => p.companyId === school.id)
            : undefined;

          return (
            <div key={school.id} className="border rounded-lg bg-card p-4 flex flex-col gap-3">
              {/* Header: icon + name + status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex-shrink-0 h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium text-sm leading-tight truncate">{school.name}</span>
                </div>
                <SubscriptionStatusBadge status={school.subscriptionStatus} />
              </div>

              {/* Email */}
              {school.email && (
                <p className="text-xs text-muted-foreground truncate -mt-1">{school.email}</p>
              )}

              {/* Metadata row */}
              <div className="flex flex-col gap-1.5 pt-2 border-t">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">
                    {[school.city, school.province].filter(Boolean).join(', ') || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Tag className="h-3 w-3 flex-shrink-0" />
                    <span>{school.plan || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarDays className="h-3 w-3" />
                    <span>{formatDateLocal(school.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Action button for pending schools */}
              {matchingPayment && onViewPayment && (
                <Button
                  variant="default"
                  size="default"
                  className="w-full mt-1"
                  onClick={() => onViewPayment(matchingPayment)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Revisar pago
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
