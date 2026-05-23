import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '../../../services/apiClient';
import { useRealtime } from '../../../components/RealtimeDashboardProvider';
import type { SessionExecution } from '../types';

const invalidateExecution = (queryClient: ReturnType<typeof useQueryClient>, sessionId: string) => {
  queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
  queryClient.invalidateQueries({ queryKey: ['sessionExecution', sessionId] });
  queryClient.invalidateQueries({ queryKey: ['sessions', 'me'] });
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
};

const postExecutionAction = async (sessionId: string, action: 'start' | 'join' | 'end' | 'complete') => {
  const { data } = await apiClient.post(`/sessions/${sessionId}/${action}`);
  return data.data.execution as SessionExecution;
};

export const useSessionExecution = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { socket } = useRealtime();

  const executionQuery = useQuery({
    queryKey: ['sessionExecution', sessionId],
    queryFn: async (): Promise<SessionExecution> => {
      const { data } = await apiClient.get(`/sessions/${sessionId}/execution`);
      return data.data.execution;
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      const state = query.state.data?.sessionExecutionState;
      return state && ['started', 'participants_joined', 'active', 'ended'].includes(state) ? 15000 : false;
    },
  });

  useEffect(() => {
    if (!socket || !sessionId) return;

    const handleExecutionUpdate = (payload: { sessionId: string }) => {
      if (payload.sessionId === sessionId) {
        invalidateExecution(queryClient, sessionId);
      }
    };

    socket.on('session_execution_updated', handleExecutionUpdate);
    return () => {
      socket.off('session_execution_updated', handleExecutionUpdate);
    };
  }, [queryClient, sessionId, socket]);

  const start = useMutation({
    mutationFn: () => postExecutionAction(sessionId, 'start'),
    onSuccess: () => invalidateExecution(queryClient, sessionId),
  });

  const join = useMutation({
    mutationFn: () => postExecutionAction(sessionId, 'join'),
    onSuccess: () => invalidateExecution(queryClient, sessionId),
  });

  const end = useMutation({
    mutationFn: () => postExecutionAction(sessionId, 'end'),
    onSuccess: () => invalidateExecution(queryClient, sessionId),
  });

  const complete = useMutation({
    mutationFn: () => postExecutionAction(sessionId, 'complete'),
    onSuccess: () => invalidateExecution(queryClient, sessionId),
  });

  return {
    ...executionQuery,
    start,
    join,
    end,
    complete,
  };
};
