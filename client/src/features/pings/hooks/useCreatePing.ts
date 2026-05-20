import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface CreatePingPayload {
  receiverId: string;
  question: string;
  context?: string;
}

export const useCreatePing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePingPayload) => {
      const { data } = await apiClient.post('/pings', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pings', 'sent'] });
    },
  });
};
