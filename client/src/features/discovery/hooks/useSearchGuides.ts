import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { SearchGuidesParams } from '../types';

export const useSearchGuides = (params: SearchGuidesParams, enabled = true) => {
  return useQuery({
    queryKey: ['search', 'guides', params],
    queryFn: async () => {
      const { data } = await apiClient.get('/guides', { params });
      return data.data; // Returns { total, page, totalPages, guides }
    },
    enabled,
    staleTime: 60 * 1000,
  });
};
