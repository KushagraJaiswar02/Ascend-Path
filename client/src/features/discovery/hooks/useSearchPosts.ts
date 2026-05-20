import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { SearchPostsParams } from '../types';

export const useSearchPosts = (params: SearchPostsParams, enabled = true) => {
  return useQuery({
    queryKey: ['search', 'posts', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/search/posts', { params });
      return data;
    },
    enabled,
    staleTime: 60 * 1000,
  });
};
