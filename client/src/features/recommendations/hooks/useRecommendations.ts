import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { recommendationApi } from '../api';

export const useRecommendations = (context = 'dashboard', limit = 6) => {
  return useQuery({
    queryKey: ['recommendations', context, limit],
    queryFn: () => recommendationApi.mine({ context, limit }),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useRecommendationInteraction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recommendationApi.interaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    },
  });
};
