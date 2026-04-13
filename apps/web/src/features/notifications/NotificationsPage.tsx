import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';
import { Notification, NotificationType } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { Skeleton } from '../../components/common/SkeletonLoader';
import PageLayout from '../../components/layout/PageLayout';
import { toast } from 'sonner';
import { Empty } from '../../components/common/Empty';
import { formatRelativeTimeLocal } from '../../lib/utils/dateUtils';

type FilterType = 'all' | 'unread' | 'read';

type NotificationQueryData = {
  notifications: Notification[];
  stats: {
    total: number;
    unread: number;
  };
};

const FILTER_BUTTONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
  { value: 'read', label: 'Leídas' },
];

const isFilterType = (value: unknown): value is FilterType =>
  value === 'all' || value === 'unread' || value === 'read';

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

const SkeletonNotifications = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="border border-border rounded-lg p-4 border-l-4 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-3 w-24" />
      </div>
    ))}
  </div>
);

const NotificationsPage = () => {
  const { currentCompany } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const companyId = currentCompany?.id ?? '';
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [...queryKeys.notifications(companyId), filter],
    queryFn: async (): Promise<NotificationQueryData> => {
      const filters: { isRead?: boolean } = {};

      if (filter === 'unread') filters.isRead = false;
      if (filter === 'read') filters.isRead = true;

      const [paginatedNotifs, statsData] = await Promise.all([
        notificationService.getNotifications(companyId, { ...filters, limit: 50 }),
        notificationService.getNotificationStats(companyId),
      ]);

      return { notifications: paginatedNotifs.items, stats: statsData };
    },
    enabled: !!companyId,
  });

  const notifications = data?.notifications ?? [];
  const stats = data?.stats ?? { total: 0, unread: 0 };

  const updateNotificationCaches = useCallback(
    (updater: (current: NotificationQueryData, filterKey: FilterType) => NotificationQueryData) => {
      const notificationQueries = queryClient.getQueriesData<NotificationQueryData>({
        queryKey: queryKeys.notifications(companyId),
      });

      notificationQueries.forEach(([queryKey, current]) => {
        if (!current) return;

        const filterKey = isFilterType(queryKey[2]) ? queryKey[2] : 'all';
        queryClient.setQueryData(queryKey, updater(current, filterKey));
      });
    },
    [companyId, queryClient]
  );

  const markNotificationAsRead = async (notification: Notification) => {
    if (notification.isRead) return;

    updateNotificationCaches((current, filterKey) => {
      const alreadyRead = current.notifications.every((item) =>
        item.id === notification.id ? item.isRead : true
      );

      if (alreadyRead) {
        return current;
      }

      const nextNotifications = current.notifications
        .map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
        .filter((item) => (filterKey === 'unread' ? !item.isRead : true));

      return {
        notifications: nextNotifications,
        stats: {
          ...current.stats,
          unread: Math.max(0, current.stats.unread - 1),
        },
      };
    });

    queryClient.setQueryData<number>(queryKeys.notificationCount(companyId), (current = 0) =>
      Math.max(0, current - 1)
    );

    try {
      await notificationService.markAsRead(notification.id);
    } catch {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications(companyId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.notificationCount(companyId) }),
      ]);
      toast.error('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!companyId) return;

    const previousQueries = queryClient.getQueriesData<NotificationQueryData>({
      queryKey: queryKeys.notifications(companyId),
    });
    const previousCount = queryClient.getQueryData<number>(queryKeys.notificationCount(companyId));

    updateNotificationCaches((current, filterKey) => ({
      notifications:
        filterKey === 'unread'
          ? []
          : current.notifications.map((notification) => ({
              ...notification,
              isRead: true,
            })),
      stats: {
        ...current.stats,
        unread: 0,
      },
    }));
    queryClient.setQueryData(queryKeys.notificationCount(companyId), 0);

    try {
      await notificationService.markAllAsRead(companyId);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch {
      previousQueries.forEach(([queryKey, previousValue]) => {
        queryClient.setQueryData(queryKey, previousValue);
      });
      queryClient.setQueryData(queryKeys.notificationCount(companyId), previousCount);
      toast.error('Error al marcar todas como leídas');
    }
  };

  const headerActions =
    stats.unread > 0 ? (
      <Button variant="ghost" onClick={handleMarkAllAsRead}>
        <CheckCheck className="w-4 h-4" />
        Marcar todo como leido
      </Button>
    ) : undefined;

  return (
    <PageLayout title="Notificaciones" headerActions={headerActions}>
      <div className="flex items-center gap-2 mb-4">
        {FILTER_BUTTONS.map((btn) => (
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
          {notifications.map((notification) => {
            const containerClass = `border border-border rounded-lg border-l-4 ${getBorderClass(notification.type)} ${!notification.isRead ? 'bg-muted/30' : ''}`;
            const content = (
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                  )}
                  <span className={`text-sm ${!notification.isRead ? 'font-medium' : ''}`}>
                    {notification.title}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  {formatRelativeTimeLocal(notification.createdAt)}
                </span>
              </div>
            );

            return (
              <div key={notification.id} className={`${containerClass} flex items-start gap-2 p-2`}>
                {notification.link ? (
                  <Link
                    to={notification.link}
                    onClick={() => {
                      void markNotificationAsRead(notification);
                    }}
                    className="flex-1 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      void markNotificationAsRead(notification);
                    }}
                    className="flex-1 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    {content}
                  </button>
                )}

                {!notification.isRead && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="mt-2 mr-1"
                    onClick={() => {
                      void markNotificationAsRead(notification);
                    }}
                    aria-label={`Marcar "${notification.title}" como leída`}
                  >
                    <Check className="w-4 h-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </PageLayout>
  );
};

export default NotificationsPage;
