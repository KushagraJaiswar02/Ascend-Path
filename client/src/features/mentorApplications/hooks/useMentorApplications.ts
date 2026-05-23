import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mentorApplicationApi } from '../api';
import type { MentorApplicationPayload, MentorApplicationStatus } from '../types';

export const useMyMentorApplication = () => {
  return useQuery({
    queryKey: ['mentor-application', 'me'],
    queryFn: mentorApplicationApi.getMine,
    retry: 1,
  });
};

export const useSubmitMentorApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: MentorApplicationPayload) => mentorApplicationApi.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-application'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useUpdateMentorApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<MentorApplicationPayload>) => mentorApplicationApi.updateMine(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-application'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useAdminMentorApplications = (params: { status?: MentorApplicationStatus; search?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin', 'mentor-applications', params],
    queryFn: () => mentorApplicationApi.listAdmin(params),
    refetchInterval: 20000,
  });
};

export const useMentorApplicationReviewActions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { status: MentorApplicationStatus; rejectionReason?: string; changeRequest?: string; internalNotes?: string } }) =>
      mentorApplicationApi.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'mentor-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'analytics'] });
    },
  });
};
