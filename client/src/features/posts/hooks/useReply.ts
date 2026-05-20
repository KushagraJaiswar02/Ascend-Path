import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface CreateReplyPayload {
  postId: string;
  content: string;
}

export const useReply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateReplyPayload) => {
      const { data } = await apiClient.post(`/posts/${payload.postId}/replies`, { content: payload.content });
      return data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific post's query to refetch replies
      queryClient.invalidateQueries({ queryKey: ['post', variables.postId] });
    },
  });
};
