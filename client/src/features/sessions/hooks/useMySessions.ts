import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { Session } from '../types';

export const useMySessions = () => {
  return useQuery({
    queryKey: ['sessions', 'me'],
    queryFn: async (): Promise<Session[]> => {
      const { data } = await apiClient.get('/sessions/me');
      return data.data.sessions;
    },
    staleTime: 2 * 60 * 1000, // invalidated explicitly after book/cancel
  });
};
