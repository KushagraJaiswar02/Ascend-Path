import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { RoadmapCommunity, RoadmapMomentumItem, TrendingRoadmapSignal } from '../types';

export const useRoadmapCommunity = (roadmapId?: string) => {
  return useQuery({
    queryKey: ['roadmapCommunity', roadmapId],
    queryFn: async (): Promise<RoadmapCommunity> => {
      const { data } = await apiClient.get(`/roadmaps/${roadmapId}/community`);
      return data.data.community;
    },
    enabled: !!roadmapId,
    staleTime: 60 * 1000,
  });
};

export const useTrendingRoadmaps = (limit = 6) => {
  return useQuery({
    queryKey: ['roadmaps', 'trending', limit],
    queryFn: async (): Promise<TrendingRoadmapSignal[]> => {
      const { data } = await apiClient.get(`/roadmaps/trending?limit=${limit}`);
      return data.data.roadmaps;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useMyRoadmapMomentum = () => {
  return useQuery({
    queryKey: ['me', 'roadmaps', 'momentum'],
    queryFn: async (): Promise<RoadmapMomentumItem[]> => {
      const { data } = await apiClient.get('/me/roadmaps/momentum');
      return data.data.momentum;
    },
    staleTime: 2 * 60 * 1000,
  });
};
