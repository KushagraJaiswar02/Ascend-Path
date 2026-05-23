import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from './api';

export const useAdminStats = () => {
  return useQuery({ queryKey: ['admin', 'stats'], queryFn: adminApi.getStats, refetchInterval: 30000 });
};

export const useAdminAnalytics = () => {
  return useQuery({ queryKey: ['admin', 'analytics'], queryFn: adminApi.getAnalytics });
};

export const usePlatformHealth = () => {
  return useQuery({ queryKey: ['admin', 'health'], queryFn: adminApi.getHealth, refetchInterval: 45000 });
};

export const useReports = (params: Record<string, string | number | undefined>) => {
  return useQuery({ queryKey: ['admin', 'reports', params], queryFn: () => adminApi.getReports(params), refetchInterval: 15000 });
};

export const useAdminUsers = (params: Record<string, string | number | undefined>) => {
  return useQuery({ queryKey: ['admin', 'users', params], queryFn: () => adminApi.getUsers(params) });
};

export const useAuditLogs = (params: Record<string, string | number | undefined>) => {
  return useQuery({ queryKey: ['admin', 'audit', params], queryFn: () => adminApi.getAuditLogs(params) });
};

export const useModerationActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin'] });
  };

  return {
    actionReport: useMutation({
      mutationFn: ({ reportId, payload }: { reportId: string; payload: { status: string; resolution?: string } }) =>
        adminApi.actionReport(reportId, payload),
      onSuccess: invalidate,
    }),
    assignReport: useMutation({
      mutationFn: (reportId: string) => adminApi.assignReport(reportId),
      onSuccess: invalidate,
    }),
    hideContent: useMutation({
      mutationFn: adminApi.hideContent,
      onSuccess: invalidate,
    }),
    suspendUser: useMutation({
      mutationFn: ({ userId, payload }: { userId: string; payload: { days: number; reason: string } }) =>
        adminApi.suspendUser(userId, payload),
      onSuccess: invalidate,
    }),
    adjustReputation: useMutation({
      mutationFn: ({ userId, payload }: { userId: string; payload: { delta: number; reason: string } }) =>
        adminApi.adjustReputation(userId, payload),
      onSuccess: invalidate,
    }),
    bulkAction: useMutation({
      mutationFn: adminApi.bulkAction,
      onSuccess: invalidate,
    }),
  };
};
