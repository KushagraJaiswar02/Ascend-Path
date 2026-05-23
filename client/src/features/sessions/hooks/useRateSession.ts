import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface RateSessionPayload {
  sessionId: string;
  rating: number;
  review?: string;
}

export const useRateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, rating, review }: RateSessionPayload) => {
      const { data } = await apiClient.post(`/sessions/${sessionId}/rate`, { rating, review });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['session', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['reputation'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
};
