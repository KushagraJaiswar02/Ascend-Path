import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '../api';
import type { OnboardingPayload } from '../types';

export const useOnboardingRecommendations = () => {
  return useQuery({
    queryKey: ['onboarding', 'recommendations'],
    queryFn: onboardingApi.recommendations,
    retry: 1,
  });
};

export const useSubmitOnboarding = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OnboardingPayload) => onboardingApi.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};
