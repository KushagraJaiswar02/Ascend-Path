import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { companionApi } from '../api';

export const useCompanionHome = () => {
  return useQuery({
    queryKey: ['companion', 'home'],
    queryFn: companionApi.home,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

export const useSubmitGrowthCheckIn = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companionApi.submitCheckIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: companionApi.createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion'] });
    },
  });
};
