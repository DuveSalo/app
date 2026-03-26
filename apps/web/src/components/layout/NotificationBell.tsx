import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Notification } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { NetworkError } from '../../lib/utils/errors';
import { ROUTE_PATHS } from '../../constants/index';

const NotificationBell = () => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = useCallback(async () => {
    if (!currentCompany?.id) return;
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getNotifications(currentCompany.id, { limit: 5 }),
        notificationService.getUnreadCount(currentCompany.id),
      ]);
      setNotifications(notifs.items ?? []);
      setUnreadCount(count);
    } catch (error) {
      if (!(error instanceof NetworkError)) {
        console.error('Error fetching notifications:', error);
      }
    }
  }, [currentCompany?.id]);

  // Initial fetch + Supabase Realtime subscription
  useEffect(() => {
    if (!currentCompany?.id) return;

    fetchData();

    const channel = supabase
      .channel(`notifications:${currentCompany.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `company_id=eq.${currentCompany.id}`,
        },
        () => {
          fetchData();
        },
      )
      .subscribe();

    // Fallback safety net in case Realtime connection drops
    const fallbackInterval = setInterval(fetchData, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallbackInterval);
    };
  }, [currentCompany?.id, fetchData]);

  const handleMarkAsRead = async (notificationId: string, e: ReactMouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentCompany?.id) return;
    setIsLoading(true);
    try {
      await notificationService.markAllAsRead(currentCompany.id);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    if (notification.link) {
      setIsOpen(false);
      navigate(notification.link);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    navigate(ROUTE_PATHS.NOTIFICATIONS);
  };

  const getTypeStyles = (type: string, isRead: boolean) => {
    const baseStyles = isRead ? 'bg-background' : 'bg-muted';

    switch (type) {
      case 'expiration_urgent':
      case 'expired':
        return `${baseStyles} border-l-4 border-l-destructive`;
      case 'expiration_warning':
        return `${baseStyles} border-l-4 border-l-amber-400`;
      default:
        return `${baseStyles} border-l-4 border-l-border`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-md hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-foreground" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-semibold text-white bg-destructive rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-background border border-border shadow-lg z-50 overflow-hidden animate-dropdown-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
            <h3 className="text-sm font-medium text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todo como leído
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer hover:bg-muted transition-colors ${getTypeStyles(notification.type, notification.isRead)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1 hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-muted">
            <button
              onClick={handleViewAll}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground font-medium transition-colors focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-1 outline-none"
            >
              Ver todas las notificaciones
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
