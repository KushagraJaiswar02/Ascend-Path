import { apiClient } from '../../services/apiClient';
import type { RecommendationResponseV2, RecommendationTarget } from './types';

export const recommendationApi = {
  async mine(params?: { context?: string; limit?: number; refresh?: boolean }) {
    const { data } = await apiClient.get('/recommendations/me', {
      params: {
        context: params?.context,
        limit: params?.limit,
        refresh: params?.refresh ? 'true' : undefined,
      },
    });
    return data.data as RecommendationResponseV2;
  },

  async interaction(input: {
    targetType: RecommendationTarget;
    targetId: string;
    interactionType: 'viewed' | 'clicked' | 'ignored' | 'enrolled' | 'booked' | 'completed' | 'saved';
    context?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { data } = await apiClient.post('/recommendations/interactions', input);
    return data.data;
  },
};
