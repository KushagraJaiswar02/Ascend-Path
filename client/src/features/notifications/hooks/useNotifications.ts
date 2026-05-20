import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';
import type { Notification } from '../types';

interface NotificationsData {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

export const useNotifications = (page = 1, limit = 10) => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', { page, limit }],
    queryFn: async (): Promise<NotificationsData> => {
      const { data } = await apiClient.get(`/notifications?page=${page}&limit=${limit}`);
      return data.data;
    },
    enabled: isAuthenticated,
    // No polling here — the full list is only fetched when the dropdown opens.
    // The unread count badge (useUnreadNotifications) handles the 10s polling.
    staleTime: 30 * 1000, // 30s — fresh enough for interactive use
  });
};
