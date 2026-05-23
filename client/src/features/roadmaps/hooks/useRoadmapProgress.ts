import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export const useRoadmap = (idOrSlug: string, enabled = true) => {
  return useQuery({
    queryKey: ['roadmap', idOrSlug],
    queryFn: async () => {
      const { data } = await apiClient.get(`/roadmaps/${idOrSlug}`);
      return data.data.roadmap;
    },
    enabled: !!idOrSlug && enabled,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyActiveRoadmaps = (enabled = true) => {
  return useQuery({
    queryKey: ['my-roadmaps'],
    queryFn: async () => {
      const { data } = await apiClient.get('/me/roadmaps');
      return data.data; // List of user progress records joined with roadmap details
    },
    enabled,
  });
};

export const useMyRoadmapProgress = (roadmapId: string, enabled = true) => {
  return useQuery({
    queryKey: ['my-progress', roadmapId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/me/roadmaps/${roadmapId}/progress`);
        return data.data.progress;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null; // Return null if not enrolled (404)
        }
        throw error;
      }
    },
    enabled: !!roadmapId && enabled,
    retry: (failureCount, error: any) => {
      // Don't retry if the user is simply not enrolled
      if (error.response?.status === 404) return false;
      return failureCount < 1;
    },
  });
};

export const useEnrollInRoadmap = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roadmapId: string) => {
      const { data } = await apiClient.post(`/roadmaps/${roadmapId}/enroll`);
      return data.data.progress;
    },
    onSuccess: (_, roadmapId) => {
      queryClient.invalidateQueries({ queryKey: ['my-roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress', roadmapId] });
      queryClient.invalidateQueries({ queryKey: ['roadmap', roadmapId] });
    },
  });
};

export const useToggleStepComplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { stepId: string; roadmapId: string }) => {
      const { data } = await apiClient.post(`/steps/${vars.stepId}/complete`);
      return data.data.progress;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress', variables.roadmapId] });
    },
  });
};

export const useToggleStepUncomplete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { stepId: string; roadmapId: string }) => {
      const { data } = await apiClient.post(`/steps/${vars.stepId}/uncomplete`);
      return data.data.progress;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-roadmaps'] });
      queryClient.invalidateQueries({ queryKey: ['my-progress', variables.roadmapId] });
    },
  });
};

export const useUpdateProgressDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      roadmapId: string;
      notes?: Record<string, string>;
      bookmarkedSteps?: string[];
    }) => {
      const { data } = await apiClient.patch(`/roadmaps/${vars.roadmapId}/progress-details`, {
        notes: vars.notes,
        bookmarkedSteps: vars.bookmarkedSteps,
      });
      return data.data.progress;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-progress', variables.roadmapId] });
    },
  });
};
