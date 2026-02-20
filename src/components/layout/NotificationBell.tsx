import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Notification } from '../../types/notification';
import * as notificationService from '../../lib/api/services/notifications';
import { ROUTE_PATHS } from '../../constants/index';

const NotificationBell: React.FC = () => {
  const { currentCompany } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications and unread count
  useEffect(() => {
    if (!currentCompany?.id) return;

    const fetchData = async () => {
      try {
        const [notifs, count] = await Promise.all([
          notificationService.getNotifications(currentCompany.id, { limit: 5 }),
          notificationService.getUnreadCount(currentCompany.id),
        ]);
        setNotifications(notifs.items ?? []);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchData();

    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [currentCompany?.id]);

  const handleMarkAsRead = async (notificationId: string, e: React.MouseEvent) => {
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
    // Mark as read if not already
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

    // Navigate to link if provided
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
    const baseStyles = isRead ? 'bg-white' : 'bg-blue-50';

    switch (type) {
      case 'expiration_urgent':
      case 'expired':
        return `${baseStyles} border-l-4 border-l-red-500`;
      case 'expiration_warning':
        return `${baseStyles} border-l-4 border-l-amber-500`;
      default:
        return `${baseStyles} border-l-4 border-l-gray-300`;
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
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-xs font-semibold text-white bg-red-500 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todo como leído
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${getTypeStyles(notification.type, notification.isRead)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                          title="Marcar como leída"
                        >
                          <Check className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
            <button
              onClick={handleViewAll}
              className="flex items-center justify-center gap-1.5 w-full text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
