import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';
import type { SessionReflection } from '../types';

interface ReflectionPayload {
  learnings: string;
  confidenceLevel: number;
  nextChallenge: string;
}

interface FollowupPayload {
  recommendedRoadmapSteps?: { roadmapId?: string; stepId?: string; title: string; reason?: string }[];
  recommendedResources?: { title: string; url: string; type?: string }[];
  recommendedProjects?: { title: string; description?: string; difficulty?: string }[];
  mentorNotes?: string;
  nextSessionSuggestion?: string;
}

export const useSessionReflection = (sessionId: string, enabled = true) => {
  return useQuery({
    queryKey: ['sessionReflection', sessionId],
    queryFn: async (): Promise<SessionReflection | null> => {
      const { data } = await apiClient.get(`/sessions/${sessionId}/reflection`);
      return data.data.reflection;
    },
    enabled: !!sessionId && enabled,
  });
};

export const useMyReflections = (limit = 10) => {
  return useQuery({
    queryKey: ['reflections', 'me', limit],
    queryFn: async (): Promise<SessionReflection[]> => {
      const { data } = await apiClient.get(`/me/reflections?limit=${limit}`);
      return data.data.reflections;
    },
    staleTime: 2 * 60 * 1000,
  });
};

export const useSubmitReflection = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReflectionPayload) => {
      const { data } = await apiClient.post(`/sessions/${sessionId}/reflection`, payload);
      return data.data.reflection as SessionReflection;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['sessionReflection', sessionId] });
      const previous = queryClient.getQueryData<SessionReflection | null>(['sessionReflection', sessionId]);
      queryClient.setQueryData<SessionReflection | null>(['sessionReflection', sessionId], (current) => {
        if (!current) return current;
        return {
          ...current,
          menteeReflection: { ...payload, submittedAt: new Date().toISOString() },
          status: current.mentorFollowup?.submittedAt ? 'completed' : 'mentee_submitted',
        };
      });
      return { previous };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(['sessionReflection', sessionId], context?.previous);
    },
    onSuccess: (reflection) => {
      queryClient.setQueryData(['sessionReflection', sessionId], reflection);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useSubmitMentorFollowup = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FollowupPayload) => {
      const { data } = await apiClient.patch(`/sessions/${sessionId}/followup`, payload);
      return data.data.reflection as SessionReflection;
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['sessionReflection', sessionId] });
      const previous = queryClient.getQueryData<SessionReflection | null>(['sessionReflection', sessionId]);
      queryClient.setQueryData<SessionReflection | null>(['sessionReflection', sessionId], (current) => {
        if (!current) return current;
        return {
          ...current,
          mentorFollowup: { ...payload, submittedAt: new Date().toISOString() } as SessionReflection['mentorFollowup'],
          status: current.menteeReflection?.submittedAt ? 'completed' : 'followup_added',
        };
      });
      return { previous };
    },
    onError: (_error, _payload, context) => {
      queryClient.setQueryData(['sessionReflection', sessionId], context?.previous);
    },
    onSuccess: (reflection) => {
      queryClient.setQueryData(['sessionReflection', sessionId], reflection);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['reflections', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};
