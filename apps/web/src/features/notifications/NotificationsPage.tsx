import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, Bell, AlertTriangle, CheckCircle2, Info, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ColorBadge } from '@/components/common/StatusBadge';
import { useAuth } from '@/lib/auth/AuthContext';
import { queryKeys } from '@/lib/queryKeys';
import { Notification, NotificationType } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { Skeleton } from '../../components/common/SkeletonLoader';
import PageLayout from '../../components/layout/PageLayout';
import { toast } from 'sonner';
import { Empty } from '../../components/common/Empty';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { formatRelativeTimeLocal } from '../../lib/utils/dateUtils';
import { cn } from '@/lib/utils';

type NotificationQueryData = {
  notifications: Notification[];
  stats: {
    total: number;
    unread: number;
  };
};

const notificationConfig = (
  type: NotificationType
): { icon: typeof Bell; bgColor: string; iconColor: string; borderColor: string } => {
  switch (type) {
    case 'expiration_urgent':
    case 'expired':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-destructive/8',
        iconColor: 'text-destructive',
        borderColor: 'border-l-destructive',
      };
    case 'expiration_warning':
      return {
        icon: Clock,
        bgColor: 'bg-amber-50',
        iconColor: 'text-amber-600',
        borderColor: 'border-l-amber-400',
      };
    case 'success':
      return {
        icon: CheckCircle2,
        bgColor: 'bg-emerald-50',
        iconColor: 'text-emerald-600',
        borderColor: 'border-l-emerald-400',
      };
    case 'error':
      return {
        icon: AlertTriangle,
        bgColor: 'bg-destructive/8',
        iconColor: 'text-destructive',
        borderColor: 'border-l-destructive',
      };
    default:
      return {
        icon: Info,
        bgColor: 'bg-muted/40',
        iconColor: 'text-muted-foreground',
        borderColor: 'border-l-border',
      };
  }
};

const groupNotificationsByDate = (
  notifications: Notification[]
): { date: string; items: Notification[] }[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups: { [key: string]: Notification[] } = {
    today: [],
    week: [],
    older: [],
  };

  notifications.forEach((notif) => {
    const notifDate = new Date(notif.createdAt);
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());

    if (notifDay.getTime() === today.getTime()) {
      groups.today.push(notif);
    } else if (notifDay.getTime() > weekAgo.getTime()) {
      groups.week.push(notif);
    } else {
      groups.older.push(notif);
    }
  });

  const result = [];
  if (groups.today.length > 0) result.push({ date: 'Hoy', items: groups.today });
  if (groups.week.length > 0) result.push({ date: 'Esta semana', items: groups.week });
  if (groups.older.length > 0) result.push({ date: 'Anterior', items: groups.older });

  return result;
};

const SkeletonNotifications = () => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, groupIdx) => (
      <div key={groupIdx}>
        <Skeleton className="h-5 w-24 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, itemIdx) => (
            <div key={itemIdx} className="border border-border rounded-lg p-4 space-y-2">
              <div className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const NotificationsPage = () => {
  const { currentCompany } = useAuth();
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const companyId = currentCompany?.id ?? '';
  const queryClient = useQueryClient();
  const hasAutoMarkedRef = useRef(false);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.notifications(companyId),
    queryFn: async (): Promise<NotificationQueryData> => {
      const [paginatedNotifs, statsData] = await Promise.all([
        notificationService.getNotifications(companyId, { limit: 50 }),
        notificationService.getNotificationStats(companyId),
      ]);

      return {
        notifications: paginatedNotifs.items,
        stats: statsData,
      };
    },
    enabled: !!companyId,
  });

  const notifications = data?.notifications ?? [];

  // Auto-mark as read on page enter (Gmail-style): server is updated,
  // but the local cache keeps isRead untouched so the user still sees
  // which ones were new during this visit.
  useEffect(() => {
    if (!data || !companyId || hasAutoMarkedRef.current) return;

    hasAutoMarkedRef.current = true;

    if (data.stats.unread === 0) return;

    void (async () => {
      try {
        await notificationService.markAllAsRead(companyId);
        queryClient.setQueryData<number>(queryKeys.notificationCount(companyId), 0);
      } catch {
        hasAutoMarkedRef.current = false;
      }
    })();
  }, [data, companyId, queryClient]);

  // On unmount, drop the cached notifications query so the next visit
  // fetches fresh data from the server (where everything is already read).
  useEffect(() => {
    return () => {
      if (companyId) {
        queryClient.removeQueries({ queryKey: queryKeys.notifications(companyId) });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deleteNotification = async (notification: Notification) => {
    try {
      await notificationService.deleteNotification(notification.id);

      queryClient.setQueryData<NotificationQueryData>(
        queryKeys.notifications(companyId),
        (current) =>
          current
            ? {
                notifications: current.notifications.filter((n) => n.id !== notification.id),
                stats: {
                  total: Math.max(0, current.stats.total - 1),
                  unread: !notification.isRead
                    ? Math.max(0, current.stats.unread - 1)
                    : current.stats.unread,
                },
              }
            : current
      );

      if (!notification.isRead) {
        queryClient.setQueryData<number>(queryKeys.notificationCount(companyId), (current = 0) =>
          Math.max(0, current - 1)
        );
      }

      toast.success('Notificación eliminada');
      setNotificationToDelete(null);
    } catch {
      toast.error('Error al eliminar la notificación');
    }
  };

  const handleDeleteClick = (notification: Notification, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setNotificationToDelete(notification);
  };

  const groupedNotifications = groupNotificationsByDate(notifications);

  return (
    <PageLayout title="Notificaciones">
      {isLoading ? (
        <SkeletonNotifications />
      ) : notifications.length === 0 ? (
        <Empty
          icon="inbox"
          title="Sin notificaciones"
          description="Aquí aparecerán las actualizaciones de tu escuela"
        />
      ) : (
        <div className="space-y-6">
          {groupedNotifications.map((group) => (
            <div key={group.date}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-3">
                {group.date}
              </h3>
              <div className="space-y-2">
                {group.items.map((notification) => {
                  const config = notificationConfig(notification.type);
                  const Icon = config.icon;

                  const content = (
                    <div className="flex items-start gap-3 p-4 pr-12">
                      <div
                        className={cn(
                          'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                          config.bgColor
                        )}
                      >
                        <Icon className={cn('w-5 h-5', config.iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'text-sm truncate',
                              !notification.isRead
                                ? 'font-semibold text-foreground'
                                : 'font-medium text-foreground'
                            )}
                          >
                            {notification.title}
                          </span>
                          {!notification.isRead && (
                            <ColorBadge
                              variant="blue"
                              label="Nuevo"
                              showIcon={false}
                              className="flex-shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <span className="text-xs text-muted-foreground mt-2 block">
                          {formatRelativeTimeLocal(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  );

                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        'relative border rounded-lg transition-colors duration-150 group',
                        config.borderColor,
                        !notification.isRead ? 'bg-muted/40' : 'bg-background',
                        'hover:bg-muted'
                      )}
                    >
                      {notification.link ? (
                        <Link
                          to={notification.link}
                          className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                        >
                          {content}
                        </Link>
                      ) : (
                        <div className="block rounded-lg">{content}</div>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => handleDeleteClick(notification, e)}
                        title="Eliminar notificación"
                        aria-label={`Eliminar "${notification.title}"`}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-150 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!notificationToDelete}
        onClose={() => setNotificationToDelete(null)}
        onConfirm={() => {
          if (notificationToDelete) {
            void deleteNotification(notificationToDelete);
          }
        }}
        title="¿Eliminar notificación?"
        message="Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </PageLayout>
  );
};

export default NotificationsPage;
