import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';

export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'warning' | 'error' | 'success' | 'ai_insight';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
}

// API functions
const notificationApi = {
  getAll: (params?: { isRead?: boolean; type?: string; limit?: number }) =>
    apiClient.get<Notification[]>('/notifications', { params }),

  getUnread: () =>
    apiClient.get<Notification[]>('/notifications/unread'),

  getStats: () =>
    apiClient.get<NotificationStats>('/notifications/stats'),

  markAsRead: (id: number) =>
    apiClient.put<Notification>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    apiClient.put<void>('/notifications/read-all'),

  delete: (id: number) =>
    apiClient.delete<void>(`/notifications/${id}`),

  deleteAll: () =>
    apiClient.delete<void>('/notifications'),
};

// Hooks
export function useNotifications(params?: { isRead?: boolean; type?: string; limit?: number }) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationApi.getAll(params),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationApi.getUnread(),
    refetchInterval: 15000, // Poll more frequently for unread
  });
}

export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => notificationApi.getStats(),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => notificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteAllNotifications() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
