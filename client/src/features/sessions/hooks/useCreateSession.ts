import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/apiClient';

interface CreateSessionPayload {
  sessionType?: 'private_mentorship' | 'public_workshop';
  title: string;
  topic: string;
  description: string;
  domains?: string[];
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  scheduledAt: string;
  durationMinutes: number;
  price: number;
  capacity?: number;
  bannerImage?: string;
  thumbnail?: string;
  roadmapId?: string;
  registrationMode?: 'open' | 'approval' | 'invite_only';
  sessionCategory?: 'workshop' | 'ama' | 'roadmap_walkthrough' | 'study_event' | 'community_teaching';
  resources?: { title: string; url: string; type?: string }[];
  recordingUrl?: string;
}

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSessionPayload) => {
      const { data } = await apiClient.post('/sessions', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', 'open'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'public'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] });
    },
  });
};
