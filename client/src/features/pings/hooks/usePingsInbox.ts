import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { Ping } from '../types';

export const usePingsInbox = () => {
  return useQuery({
    queryKey: ['pings', 'inbox'],
    queryFn: async (): Promise<Ping[]> => {
      const { data } = await apiClient.get('/pings/inbox');
      return data.data.pings;
    },
    staleTime: 2 * 60 * 1000, // invalidated explicitly after respond/create
  });
};
