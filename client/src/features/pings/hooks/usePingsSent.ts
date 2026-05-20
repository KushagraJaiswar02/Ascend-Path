import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { Ping } from '../types';

export const usePingsSent = () => {
  return useQuery({
    queryKey: ['pings', 'sent'],
    queryFn: async (): Promise<Ping[]> => {
      const { data } = await apiClient.get('/pings/sent');
      return data.data.pings;
    },
    staleTime: 2 * 60 * 1000,
  });
};
