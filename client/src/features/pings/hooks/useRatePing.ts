import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface RatePingPayload {
  pingId: string;
  rating: number;
}

export const useRatePing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pingId, rating }: RatePingPayload) => {
      const { data } = await apiClient.post(`/pings/${pingId}/rate`, { rating });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pings', 'sent'] });
    },
  });
};
