import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import { useAuthStore } from '../../../store/useAuthStore';

export const useUnreadNotifications = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async (): Promise<number> => {
      const { data } = await apiClient.get('/notifications/unread');
      return data.data.unreadCount;
    },
    enabled: isAuthenticated,
    refetchInterval: 10000, // Poll every 10 seconds
    staleTime: 5000,
  });
};
