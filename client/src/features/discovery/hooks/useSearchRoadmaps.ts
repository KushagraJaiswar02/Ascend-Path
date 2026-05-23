import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export const useSearchRoadmaps = (params: any, enabled = true) => {
  return useQuery({
    queryKey: ['search', 'roadmaps', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/roadmaps', { params });
      // Map backend pagination fields to client naming structure
      return {
        roadmaps: data.data?.roadmaps || [],
        total: data.data?.totalRoadmaps || 0,
        page: data.data?.currentPage || 1,
        totalPages: data.data?.totalPages || 1,
      };
    },
    enabled,
    staleTime: 60 * 1000,
  });
};

