import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

export interface GuideProfileData {
  guide: {
    _id: string;
    name: string;
    role: string;
    respectPoints: number;
    fameScore: number;
    guideRank: string;
    bio?: string;
    skills: string[];
    interests: string[];
    avatar?: string;
    isVerified: boolean;
    socialLinks?: {
      github?: string;
      linkedin?: string;
      website?: string;
    };
    availability?: {
      text: string;
      schedule: { day: string; slots: string[] }[];
    };
    totalSessions: number;
    averageRating: number;
    totalReviews: number;
    profileVisibility: boolean;
    onboardingCompleted: boolean;
    createdAt: string;
  };
  reviews: any[];
  roadmaps: any[];
  openSessions: any[];
  roadmapCount: number;
}

/**
 * Hook to fetch the full guide profile assets (metadata, reviews, roadmaps, slots).
 */
export const useGuideProfile = (id: string) => {
  return useQuery<GuideProfileData>({
    queryKey: ['guideProfile', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/guides/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 mins
  });
};

/**
 * Mutation hook to submit a ping request to a Guide.
 */
export const usePingGuideMutation = () => {
  return useMutation({
    mutationFn: async (payload: { toUserId: string; question: string; context?: string }) => {
      const { data } = await apiClient.post('/pings', payload);
      return data;
    },
  });
};

/**
 * Mutation hook to book an available study session slot.
 */
export const useBookSessionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { data } = await apiClient.post(`/sessions/${sessionId}/book`);
      return data;
    },
    onSuccess: () => {
      // Invalidate open session queries to immediately reflect booking
      queryClient.invalidateQueries({ queryKey: ['guideProfile'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

/**
 * Mutation hook for a guide to update their own profile configuration.
 */
export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await apiClient.patch('/guides/profile', payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['guideProfile', data._id] });
    },
  });
};
