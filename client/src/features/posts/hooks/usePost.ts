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
  createdAt: string;
}


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
