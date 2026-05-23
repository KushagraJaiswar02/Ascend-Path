import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface VotePayload {
  targetId: string;
  targetType: 'post' | 'reply';
  voteType: 'upvote' | 'downvote';
}

export const useVote = (postId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetId, targetType, voteType }: VotePayload) => {
      const url = targetType === 'post' 
        ? `/posts/${targetId}/vote` 
        : `/posts/replies/${targetId}/vote`;
        
      const vote = voteType === 'upvote' ? 1 : -1;
      const { data } = await apiClient.post(url, { vote });
      return data;
    },
    onMutate: async (newVote) => {
      // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
      if (newVote.targetType === 'post') {
        // We could be voting from the post list or post detail
        await queryClient.cancelQueries({ queryKey: ['post', newVote.targetId] });
      } else if (newVote.targetType === 'reply' && postId) {
        await queryClient.cancelQueries({ queryKey: ['post', postId] });
      }

      // Snapshot the previous value in case we need to roll back
      // We aren't fully managing the rollback state manually in this boilerplate to keep it simple,
      // but typically we'd return { previousData } here.

      return { newVote };
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure server sync
      if (variables.targetType === 'post') {
        queryClient.invalidateQueries({ queryKey: ['post', variables.targetId] });
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      } else if (variables.targetType === 'reply' && postId) {
        queryClient.invalidateQueries({ queryKey: ['post', postId] });
      }
    },
  });
};
