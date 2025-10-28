'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUnreadNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead, useDeleteNotification } from '@/lib/hooks/useNotifications';
import { Button, Badge } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { data: notifications = [], isLoading } = useUnreadNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'ai_insight':
        return <Info className="h-5 w-5 text-accent" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Уведомления</h3>
                {unreadCount > 0 && (
                  <Badge variant="default">{unreadCount}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-accent hover:text-accent/80 flex items-center gap-1"
                    disabled={markAllAsRead.isPending}
                  >
                    <CheckCheck className="h-4 w-4" />
                    Все прочитано
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-100 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>Нет новых уведомлений</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 hover:bg-gray-50 transition border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.isRead ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm">{notification.title}</h4>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                                locale: ru,
                              })}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>

                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="text-sm text-accent hover:underline mt-2 inline-block"
                              onClick={() => {
                                handleMarkAsRead(notification.id, {} as any);
                                setIsOpen(false);
                              }}
                            >
                              Подробнее →
                            </Link>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="text-xs text-accent hover:text-accent/80 flex items-center gap-1"
                                disabled={markAsRead.isPending}
                              >
                                <Check className="h-3 w-3" />
                                Прочитано
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(notification.id, e)}
                              className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                              disabled={deleteNotification.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                              Удалить
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Link
                  href="/notifications"
                  className="text-sm text-accent hover:underline text-center block"
                  onClick={() => setIsOpen(false)}
                >
                  Посмотреть все уведомления
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
