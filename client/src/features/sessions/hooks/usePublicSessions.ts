import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { Session } from '../types';

interface PublicSessionsParams {
  domain?: string;
  difficulty?: string;
  guideId?: string;
  page?: number;
  limit?: number;
}

export const usePublicSessions = (params: PublicSessionsParams = {}) => {
  return useQuery({
    queryKey: ['sessions', 'public', params],
    queryFn: async (): Promise<Session[]> => {
      const search = new URLSearchParams();
      if (params.domain) search.append('domain', params.domain);
      if (params.difficulty) search.append('difficulty', params.difficulty);
      if (params.guideId) search.append('guideId', params.guideId);
      if (params.page) search.append('page', params.page.toString());
      if (params.limit) search.append('limit', params.limit.toString());

      const { data } = await apiClient.get(`/sessions/public?${search.toString()}`);
      return data.data.sessions;
    },
    staleTime: 60 * 1000,
  });
};

export const useRegisterPublicSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await apiClient.post(`/sessions/${sessionId}/register`);
      return data.data.session as Session;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });
};
