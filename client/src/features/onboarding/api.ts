import { apiClient } from '../../services/apiClient';
import type { DashboardExperiencePayload, OnboardingPayload, RecommendationResponse } from './types';

export const onboardingApi = {
  async submit(payload: OnboardingPayload) {
    const { data } = await apiClient.post('/onboarding', payload);
    return data.data as { user: unknown; recommendations: RecommendationResponse };
  },

  async recommendations() {
    const { data } = await apiClient.get('/onboarding/recommendations');
    return data.data as RecommendationResponse;
  },

  async dashboardExperience() {
    const { data } = await apiClient.get('/onboarding/dashboard-experience');
    return data.data as DashboardExperiencePayload;
  },
};
