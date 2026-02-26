import { useState, useEffect } from 'react';
import { CheckCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Notification, NotificationType } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/common/Toast';
import { StatusBadge } from '../../components/common/StatusBadge';

type FilterType = 'all' | 'unread' | 'read';

const FILTER_BUTTONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leidas' },
  { value: 'read', label: 'Leidas' },
];

const NotificationsPage = () => {
  const { currentCompany } = useAuth();
  const { showSuccess, showError } = useToast();
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
      showError('Error al cargar las notificaciones');
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
      showError('Error al marcar como leida');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentCompany?.id) return;
    try {
      await notificationService.markAllAsRead(currentCompany.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      showSuccess('Todas las notificaciones marcadas como leidas');
    } catch {
      showError('Error al marcar todas como leidas');
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
    return `Hace ${diffDays} dias`;
  };

  const getNotificationBadge = (type: NotificationType) => {
    switch (type) {
      case 'expiration_warning':
        return <StatusBadge status="expiring" />;
      case 'expiration_urgent':
      case 'expired':
        return <StatusBadge status="expired" />;
      case 'info':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md">
            Info
          </span>
        );
      case 'system':
        return (
          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium text-neutral-500 bg-neutral-50 border border-neutral-200 rounded-md">
            Sistema
          </span>
        );
      default:
        return <StatusBadge status="valid" />;
    }
  };

  const headerActions = stats.unread > 0 ? (
    <button
      type="button"
      onClick={handleMarkAllAsRead}
      className="flex items-center gap-2 h-9 px-5 border border-neutral-200 rounded-md text-sm font-medium text-neutral-900 hover:bg-neutral-50 transition-colors focus:outline-none"
    >
      <CheckCheck className="w-4 h-4 text-neutral-400" />
      Marcar todo como leido
    </button>
  ) : undefined;

  return (
    <PageLayout
      title="Notificaciones"
      subtitle={`${stats.unread} no leidas de ${stats.total} totales`}
      headerActions={headerActions}
    >
      <div className="h-full flex flex-col">
        {/* Filter chips */}
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          {FILTER_BUTTONS.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 text-sm rounded-md transition-colors focus:outline-none ${
                filter === btn.value
                  ? 'bg-neutral-900 text-white font-medium'
                  : 'text-neutral-500 font-light border border-neutral-200 hover:bg-neutral-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-sm font-light text-neutral-500">
                {filter === 'all' ? 'No hay notificaciones' : filter === 'unread' ? 'No hay notificaciones sin leer' : 'No hay notificaciones leidas'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col w-full">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                  className={`flex items-center justify-between cursor-pointer transition-colors rounded-md ${!notification.isRead ? 'bg-neutral-50 hover:bg-neutral-100' : 'hover:bg-neutral-50'}`}
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0 px-5 py-4 border-b border-neutral-200">
                    {/* Unread dot */}
                    {!notification.isRead ? (
                      <div className="w-2 h-2 bg-neutral-900 rounded-full mt-1.5 flex-shrink-0" />
                    ) : (
                      <div className="w-2 h-2 flex-shrink-0" />
                    )}

                    {/* Info */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <span className={`text-sm text-neutral-900 ${!notification.isRead ? 'font-bold' : 'font-light'}`}>
                        {notification.title}
                      </span>
                      <span className="text-sm font-light text-neutral-500">
                        {notification.message}
                      </span>
                      <div className="flex items-center gap-3 mt-1">
                        {getNotificationBadge(notification.type)}
                        <span className="text-xs font-light text-neutral-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Right chevron */}
                    <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0 ml-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

export default NotificationsPage;
