import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { Session } from '../types';

export const useSessions = (topic?: string, isFree?: boolean) => {
  return useQuery({
    queryKey: ['sessions', 'open', { topic, isFree }],
    queryFn: async (): Promise<Session[]> => {
      const params = new URLSearchParams();
      if (topic) params.append('topic', topic);
      if (isFree !== undefined) params.append('isFree', isFree.toString());

      const { data } = await apiClient.get(`/sessions?${params.toString()}`);
      return data.data.sessions;
    },
    staleTime: 2 * 60 * 1000, // 2 min — session availability doesn't change by the second
  });
};
