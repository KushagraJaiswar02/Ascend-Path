import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  authorId: { _id: string; name: string; avatar?: string; role: string };
  upvotes: number;
  downvotes: number;
  viewCount: number;
  isSolved: boolean;
  createdAt: string;
  replyCount?: number;
}

interface PostsResponse {
  success: boolean;
  data: {
    posts: Post[];
    total: number;
    page: number;
    limit: number;
  };
}

export const usePosts = (page = 1, limit = 10, category?: string) => {
  return useQuery({
    queryKey: ['posts', { page, limit, category }],
    queryFn: async (): Promise<PostsResponse['data']> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(category && { category }),
      });
      const { data } = await apiClient.get(`/posts?${params.toString()}`);
      return data.data;
    },
    staleTime: 3 * 60 * 1000, // 3 min — invalidated explicitly after create/vote
  });
};
