import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { SearchGuidesParams } from '../types';

export const useSearchGuides = (params: SearchGuidesParams, enabled = true) => {
  return useQuery({
    queryKey: ['search', 'guides', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/search/guides', { params });
      return data;
    },
    enabled,
    staleTime: 60 * 1000, // 1 min — search results can tolerate brief staleness
  });
};
