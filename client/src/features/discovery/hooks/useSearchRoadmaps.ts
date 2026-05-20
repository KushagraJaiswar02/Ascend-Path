import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { SearchRoadmapsParams } from '../types';

export const useSearchRoadmaps = (params: SearchRoadmapsParams, enabled = true) => {
  return useQuery({
    queryKey: ['search', 'roadmaps', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/search/roadmaps', { params });
      return data;
    },
    enabled,
    staleTime: 60 * 1000,
  });
};
