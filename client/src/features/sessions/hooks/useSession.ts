import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { Session } from '../types';

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['session', id],
    queryFn: async (): Promise<Session> => {
      const { data } = await apiClient.get(`/sessions/${id}`);
      return data.data.session;
    },
    enabled: !!id,
  });
};
