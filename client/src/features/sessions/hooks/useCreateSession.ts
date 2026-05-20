import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface CreateSessionPayload {
  topic: string;
  description: string;
  scheduledAt: string;
  duration: number;
  price: number;
}

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSessionPayload) => {
      const { data } = await apiClient.post('/sessions', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'open'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] });
    },
  });
};
