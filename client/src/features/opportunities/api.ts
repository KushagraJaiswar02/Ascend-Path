import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../services/apiClient';
import type { Opportunity, Application, ApplicationStatus } from './types';

export const useOpportunities = (filters: {
  q?: string;
  opportunityType?: string;
  difficulty?: string;
  remoteStatus?: string;
  domainId?: string;
  goalId?: string;
  sortByReady?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async (): Promise<{ opportunities: Opportunity[]; total: number; page: number; limit: number }> => {
      const response = await apiClient.get('/opportunities', { params: filters });
      return response.data.data;
    },
  });
};

export const useOpportunity = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['opportunity', id],
    queryFn: async (): Promise<{
      opportunity: Opportunity;
      readinessScore: number;
      readinessGaps: string[];
      application: Application | null;
    }> => {
      const response = await apiClient.get(`/opportunities/${id}`);
      return response.data.data;
    },
    enabled: !!id && enabled,
  });
};

export const useApplicationsBoard = () => {
  return useQuery({
    queryKey: ['applicationsBoard'],
    queryFn: async (): Promise<Application[]> => {
      const response = await apiClient.get('/opportunities/me/applications');
      return response.data.data;
    },
  });
};

export const useApplyOpportunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opportunityId: string): Promise<Application> => {
      const response = await apiClient.post(`/opportunities/${opportunityId}/apply`);
      return response.data.data;
    },
    onSuccess: (_, opportunityId) => {
      queryClient.invalidateQueries({ queryKey: ['applicationsBoard'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', opportunityId] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useUpdateApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      appId,
      status,
      notes,
      mentorGuidance,
      interviewReflections,
      connectedProjects,
      connectedAchievements,
    }: {
      appId: string;
      status?: ApplicationStatus;
      notes?: string;
      mentorGuidance?: string;
      interviewReflections?: string;
      connectedProjects?: string[];
      connectedAchievements?: string[];
    }): Promise<Application> => {
      const response = await apiClient.put(`/opportunities/applications/${appId}`, {
        status,
        notes,
        mentorGuidance,
        interviewReflections,
        connectedProjects,
        connectedAchievements,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applicationsBoard'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', data.opportunityId?._id] });
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });
};

export const useAddReminder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ appId, date, note }: { appId: string; date: Date; note: string }) => {
      const response = await apiClient.post(`/opportunities/applications/${appId}/reminders`, {
        date: date.toISOString(),
        note,
      });
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applicationsBoard'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', data.opportunityId?._id] });
    },
  });
};

export const useAdminOpportunities = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['adminOpportunities', page, limit],
    queryFn: async (): Promise<{ opportunities: Opportunity[]; total: number }> => {
      const response = await apiClient.get('/admin/opportunities', { params: { page, limit } });
      return response.data.data;
    },
  });
};

export const useVerifyOpportunity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      opportunityId,
      verificationStatus,
      isFeatured,
    }: {
      opportunityId: string;
      verificationStatus: 'approved' | 'rejected';
      isFeatured?: boolean;
    }): Promise<Opportunity> => {
      const response = await apiClient.put(`/admin/opportunities/${opportunityId}/verify`, {
        verificationStatus,
        isFeatured,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOpportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
};
