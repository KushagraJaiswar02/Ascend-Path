import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { Post } from './usePosts';

export interface Reply {
  _id: string;
  postId: string;
  authorId: { _id: string; name: string; avatar?: string; role: string };
  content: string;
  upvotes: number;
  downvotes: number;
  isSolution: boolean;
  isAccepted?: boolean;
  createdAt: string;
}

export const useAcceptAnswer = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (replyId: string) => {
      const { data } = await apiClient.post(`/posts/${postId}/accept/${replyId}`);
      return data.data.post as Post;
    },
    onMutate: async (replyId) => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousData = queryClient.getQueryData<{ post: Post; replies: Reply[] }>(['post', postId]);

      queryClient.setQueryData<{ post: Post; replies: Reply[] }>(['post', postId], (currentData) => {
        if (!currentData) return currentData;
        const replies = currentData.replies
          .map((reply) => ({ ...reply, isAccepted: reply._id === replyId, isSolution: reply._id === replyId }))
          .sort((a, b) => {
            if (a._id === replyId) return -1;
            if (b._id === replyId) return 1;
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });

        return {
          post: {
            ...currentData.post,
            isSolved: true,
            isResolved: true,
            acceptedReplyId: replyId,
            solutionReplyId: replyId,
            resolvedAt: new Date().toISOString(),
          },
          replies,
        };
      });

      return { previousData };
    },
    onError: (_err, _replyId, context) => {
      if (context?.previousData) queryClient.setQueryData(['post', postId], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUnacceptAnswer = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.delete(`/posts/${postId}/accept`);
      return data.data.post as Post;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['post', postId] });
      const previousData = queryClient.getQueryData<{ post: Post; replies: Reply[] }>(['post', postId]);

      queryClient.setQueryData<{ post: Post; replies: Reply[] }>(['post', postId], (currentData) => {
        if (!currentData) return currentData;
        return {
          post: {
            ...currentData.post,
            isSolved: false,
            isResolved: false,
            acceptedReplyId: undefined,
            solutionReplyId: undefined,
            resolvedAt: undefined,
          },
          replies: currentData.replies.map((reply) => ({ ...reply, isAccepted: false, isSolution: false })),
        };
      });

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) queryClient.setQueryData(['post', postId], context.previousData);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};


export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async (): Promise<{ post: Post; replies: Reply[] }> => {
      // Fetch post and replies in parallel
      const [postRes, repliesRes] = await Promise.all([
        apiClient.get(`/posts/${postId}`),
        apiClient.get(`/posts/${postId}/replies`),
      ]);
      
      return {
        post: postRes.data.data.post,
        replies: repliesRes.data.data.replies,
      };
    },
    enabled: !!postId, // Only fetch if postId exists
    staleTime: 3 * 60 * 1000, // invalidated explicitly after reply/vote
  });
};

export const useRegisterPostView = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post(`/posts/${postId}/view`);
      return data.data.viewCount as number;
    },
    onSuccess: (viewCount) => {
      queryClient.setQueryData<{ post: Post; replies: Reply[] }>(['post', postId], (currentData) => {
        if (!currentData) return currentData;
        return {
          ...currentData,
          post: {
            ...currentData.post,
            viewCount,
          },
        };
      });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
