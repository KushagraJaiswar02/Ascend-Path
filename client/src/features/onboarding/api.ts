import { apiClient } from '../../services/apiClient';
import type { OnboardingPayload, RecommendationResponse } from './types';

export const onboardingApi = {
  async submit(payload: OnboardingPayload) {
    const { data } = await apiClient.post('/onboarding', payload);
    return data.data as { user: unknown; recommendations: RecommendationResponse };
  },

  async recommendations() {
    const { data } = await apiClient.get('/onboarding/recommendations');
    return data.data as RecommendationResponse;
  },
};
