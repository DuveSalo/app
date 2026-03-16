import { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { Notification, NotificationType } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { Skeleton } from '../../components/common/SkeletonLoader';
import PageLayout from '../../components/layout/PageLayout';
import { toast } from 'sonner';
import { Empty } from '../../components/common/Empty';

type FilterType = 'all' | 'unread' | 'read';

const FILTER_BUTTONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
  { value: 'read', label: 'Leídas' },
];

const getBorderClass = (type: NotificationType): string => {
  switch (type) {
    case 'expiration_urgent':
    case 'expired':
      return 'border-l-destructive';
    case 'expiration_warning':
      return 'border-l-amber-400';
    case 'info':
    case 'system':
    default:
      return 'border-l-border';
  }
};

const formatRelativeTime = (dateString: string) => {
  const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffHours < 1) return 'Hace un momento';
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Ayer';
  return `Hace ${diffDays} días`;
};

const SkeletonNotifications = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="border border-border rounded-md p-4 border-l-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);

const NotificationsPage = () => {
  const { currentCompany } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [stats, setStats] = useState({ total: 0, unread: 0 });

  useEffect(() => {
    if (!currentCompany?.id) return;
    fetchNotifications();
  }, [currentCompany?.id, filter]);

  const fetchNotifications = async () => {
    if (!currentCompany?.id) return;
    setIsLoading(true);
    try {
      const filters: { isRead?: boolean } = {};
      if (filter === 'unread') filters.isRead = false;
      if (filter === 'read') filters.isRead = true;
      const [paginatedNotifs, statsData] = await Promise.all([
        notificationService.getNotifications(currentCompany.id, { ...filters, limit: 50 }),
        notificationService.getNotificationStats(currentCompany.id),
      ]);
      setNotifications(paginatedNotifs.items);
      setStats(statsData);
    } catch {
      toast.error('Error al cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n)));
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch {
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentCompany?.id) return;
    try {
      await notificationService.markAllAsRead(currentCompany.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch {
      toast.error('Error al marcar todas como leídas');
    }
  };

  const headerActions = stats.unread > 0 ? (
    <Button variant="ghost" onClick={handleMarkAllAsRead}>
      <CheckCheck className="w-4 h-4" />
      Marcar todo como leído
    </Button>
  ) : undefined;

  return (
    <PageLayout title="Notificaciones" headerActions={headerActions}>
      {/* Filter chips */}
      <div className="flex items-center gap-2 mb-4">
        {FILTER_BUTTONS.map(btn => (
          <Button
            key={btn.value}
            variant={filter === btn.value ? 'default' : 'outline'}
            size="default"
            onClick={() => setFilter(btn.value)}
            className="h-8 text-sm px-3"
          >
            {btn.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonNotifications />
      ) : notifications.length === 0 ? (
        <Empty
          icon="inbox"
          title={
            filter === 'all'
              ? 'No hay notificaciones'
              : filter === 'unread'
                ? 'No hay notificaciones sin leer'
                : 'No hay notificaciones leídas'
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              className={`border border-border rounded-md p-4 border-l-4 ${getBorderClass(notification.type)} cursor-pointer transition-colors hover:bg-muted/50 ${!notification.isRead ? 'bg-muted/30' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                    <span className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                      {notification.title}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground mt-1.5 block">
                    {formatRelativeTime(notification.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default NotificationsPage;
