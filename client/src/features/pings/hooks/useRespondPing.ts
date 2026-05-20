import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface RespondPingPayload {
  pingId: string;
  response: string;
}

export const useRespondPing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pingId, response }: RespondPingPayload) => {
      const { data } = await apiClient.post(`/pings/${pingId}/respond`, { response });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pings', 'inbox'] });
    },
  });
};
