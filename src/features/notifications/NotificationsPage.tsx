import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Notification, NotificationType, NotificationCategory } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/common/Toast';

type FilterType = 'all' | 'unread' | 'read';

const FILTER_BUTTONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'No leídas' },
  { value: 'read', label: 'Leídas' },
];

const TYPE_BADGE_STYLES: Record<string, string> = {
  expiration_urgent: 'bg-red-50 text-red-700',
  expired: 'bg-red-50 text-red-700',
  expiration_warning: 'bg-amber-50 text-amber-700',
  system: 'bg-gray-100 text-gray-700',
  info: 'bg-blue-50 text-blue-700',
};

const TYPE_BADGE_LABELS: Record<string, string> = {
  expiration_urgent: 'Urgente',
  expired: 'Vencido',
  expiration_warning: 'Por vencer',
  system: 'Sistema',
  info: 'Info',
};

const NotificationsPage: React.FC = () => {
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
    } catch (error) {
      console.error('Error fetching notifications:', error);
      showError('Error al cargar las notificaciones');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setStats(prev => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
    } catch (error) {
      showError('Error al marcar como leída');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentCompany?.id) return;

    try {
      await notificationService.markAllAsRead(currentCompany.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setStats(prev => ({ ...prev, unread: 0 }));
      showSuccess('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      showError('Error al marcar todas como leídas');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setStats(prev => ({ ...prev, total: prev.total - 1 }));
      showSuccess('Notificación eliminada');
    } catch (error) {
      showError('Error al eliminar la notificación');
    }
  };

  const handleDeleteAllRead = async () => {
    if (!currentCompany?.id) return;

    try {
      await notificationService.deleteReadNotifications(currentCompany.id);
      setNotifications(prev => prev.filter(n => !n.isRead));
      await fetchNotifications();
      showSuccess('Notificaciones leídas eliminadas');
    } catch (error) {
      showError('Error al eliminar las notificaciones');
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'expiration_urgent':
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'expiration_warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeBadge = (type: NotificationType) => {
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE_STYLES[type] || TYPE_BADGE_STYLES.info}`}>
        {TYPE_BADGE_LABELS[type] || type}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    // Parse date as local time to avoid timezone issues
    const dateStr = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageLayout
      title="Notificaciones"
      subtitle={`${stats.unread} no leídas de ${stats.total} totales`}
      actions={
        <div className="flex items-center gap-2">
          {stats.unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-1.5" />
              Marcar todo como leído
            </Button>
          )}
          {notifications.some(n => n.isRead) && (
            <Button variant="ghost" size="sm" onClick={handleDeleteAllRead}>
              <Trash2 className="w-4 h-4 mr-1.5" />
              Eliminar leídas
            </Button>
          )}
        </div>
      }
    >
      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {FILTER_BUTTONS.map(btn => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === btn.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <Card padding="xl">
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all'
                ? 'No hay notificaciones'
                : filter === 'unread'
                ? 'No hay notificaciones sin leer'
                : 'No hay notificaciones leídas'}
            </h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'Te notificaremos cuando haya algo importante'
                : 'Cambia el filtro para ver otras notificaciones'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map(notification => (
            <Card
              key={notification.id}
              padding="none"
              className={`overflow-hidden transition-all ${
                !notification.isRead ? 'ring-1 ring-blue-200 bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-4 p-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className={`text-sm ${notification.isRead ? 'text-gray-700' : 'text-gray-900 font-semibold'}`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {getTypeBadge(notification.type)}
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">
                      {formatDate(notification.createdAt)}
                    </span>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
};

export default NotificationsPage;
