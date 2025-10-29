'use client';

import { useState } from 'react';
import { Filter, Trash2, CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  useDeleteAllNotifications,
  useMarkNotificationAsRead,
  useDeleteNotification,
} from '@/lib/hooks/useNotifications';
import { Button, Card, Badge } from '@/components/ui';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import Link from 'next/link';

type FilterType = 'all' | 'unread' | 'info' | 'warning' | 'error' | 'success' | 'ai_insight';

export function NotificationList() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const { data: notifications = [], isLoading } = useNotifications(
    filter === 'unread' ? { isRead: false } : filter !== 'all' ? { type: filter } : undefined
  );
  
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteAll = useDeleteAllNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const deleteNotification = useDeleteNotification();

  const filterOptions = [
    { value: 'all', label: 'Все' },
    { value: 'unread', label: 'Непрочитанные' },
    { value: 'info', label: 'Информация' },
    { value: 'warning', label: 'Предупреждения' },
    { value: 'error', label: 'Ошибки' },
    { value: 'success', label: 'Успех' },
    { value: 'ai_insight', label: 'AI Инсайты' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'ai_insight': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="error">Высокий</Badge>;
      case 'medium': return <Badge variant="default">Средний</Badge>;
      default: return <Badge variant="info">Низкий</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Уведомления</h1>
          <p className="text-gray-600 mt-1">
            {notifications.length} {notifications.length === 1 ? 'уведомление' : 'уведомлений'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Прочитать все
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteAll.mutate()}
            disabled={deleteAll.isPending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Удалить все
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">Фильтр:</span>
          {filterOptions.map((option) => (
            <Button
              key={option.value}
              variant={filter === option.value ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(option.value as FilterType)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Notifications */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Нет уведомлений для отображения</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`p-6 ${
                  !notification.isRead ? 'border-l-4 border-l-accent bg-blue-50/30' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      {getPriorityBadge(notification.priority)}
                      {!notification.isRead && (
                        <Badge variant="info">Новое</Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{notification.title}</h3>
                    <p className="text-gray-700 mb-3">{notification.message}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                      {notification.readAt && (
                        <span>
                          Прочитано{' '}
                          {formatDistanceToNow(new Date(notification.readAt), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </span>
                      )}
                    </div>

                    {notification.actionUrl && (
                      <Link
                        href={notification.actionUrl}
                        className="text-accent hover:underline mt-3 inline-block"
                      >
                        Подробнее →
                      </Link>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {!notification.isRead && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => markAsRead.mutate(notification.id)}
                        disabled={markAsRead.isPending}
                      >
                        Прочитано
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteNotification.mutate(notification.id)}
                      disabled={deleteNotification.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
