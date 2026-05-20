import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export const useCancelSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await apiClient.post(`/sessions/${sessionId}/cancel`);
      return data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'open'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
    },
  });
};
