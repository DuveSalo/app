import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Notification } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { NetworkError } from '../../lib/utils/errors';
import { ROUTE_PATHS } from '../../constants/index';
import { formatRelativeTimeLocal } from '../../lib/utils/dateUtils';

const NotificationBell = () => {
  const { currentCompany } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const applyReadState = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) => {
        if (notification.id !== notificationId || notification.isRead) {
          return notification;
        }

        return { ...notification, isRead: true };
      })
    );

    setUnreadCount((prev) => Math.max(0, prev - 1));
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

  const markNotificationAsRead = useCallback(
    async (notification: Notification) => {
      if (notification.isRead) return;

      applyReadState(notification.id);

      try {
        await notificationService.markAsRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
        void fetchData();
      }
    },
    [applyReadState, fetchData]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!currentCompany?.id) return;

    void fetchData();

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
          void fetchData();
        }
      )
      .subscribe();

    const fallbackInterval = setInterval(() => {
      void fetchData();
    }, 30000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(fallbackInterval);
    };
  }, [currentCompany?.id, fetchData]);

  const handleMarkAllAsRead = async () => {
    if (!currentCompany?.id) return;

    setIsLoading(true);
    const previousNotifications = notifications;
    const previousUnreadCount = unreadCount;

    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    setUnreadCount(0);

    try {
      await notificationService.markAllAsRead(currentCompany.id);
    } catch (error) {
      console.error('Error marking all as read:', error);
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-foreground" strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-semibold text-destructive-foreground bg-destructive rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-background border border-border shadow-lg z-50 overflow-hidden animate-dropdown-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted">
            <h3 className="text-sm font-medium text-foreground">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todo como leido
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => {
                  const itemStyles = `flex-1 min-w-0 px-4 py-3 text-left transition-colors hover:bg-muted ${getTypeStyles(notification.type, notification.isRead)}`;
                  const itemContent = (
                    <>
                      <p
                        className={`text-sm ${
                          notification.isRead
                            ? 'text-muted-foreground'
                            : 'text-foreground font-medium'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRelativeTimeLocal(notification.createdAt)}
                      </p>
                    </>
                  );

                  return (
                    <div key={notification.id} className="flex items-start gap-2">
                      {notification.link ? (
                        <Link
                          to={notification.link}
                          onClick={() => {
                            void markNotificationAsRead(notification);
                            setIsOpen(false);
                          }}
                          className={itemStyles}
                        >
                          {itemContent}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            void markNotificationAsRead(notification);
                          }}
                          className={itemStyles}
                        >
                          {itemContent}
                        </button>
                      )}

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => {
                            void markNotificationAsRead(notification);
                          }}
                          className="mt-3 mr-3 p-1 rounded-lg hover:bg-muted transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none"
                          aria-label={`Marcar "${notification.title}" como leida`}
                        >
                          <Check className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-border bg-muted">
            <Link
              to={ROUTE_PATHS.NOTIFICATIONS}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-muted-foreground hover:text-foreground font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 outline-none rounded-lg"
            >
              Ver todas las notificaciones
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
