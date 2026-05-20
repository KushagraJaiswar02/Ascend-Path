import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface CreatePostPayload {
  title: string;
  content: string;
  category: string;
  tags?: string[];
}

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePostPayload) => {
      const { data } = await apiClient.post('/posts', payload);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate all post queries to refetch lists
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
