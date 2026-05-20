import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.post(`/notifications/${id}/read`);
      return data.data.notification;
    },
    onSuccess: () => {
      // Scope invalidation: only refresh the unread badge count and the paginated list.
      // Using exact: false invalidates all ['notifications', ...] keys efficiently
      // without needing to enumerate every page variant.
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      // Same scoped invalidation strategy
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unreadCount'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'], exact: false });
    },
  });

  return {
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
