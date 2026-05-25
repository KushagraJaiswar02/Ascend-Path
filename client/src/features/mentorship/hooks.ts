import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mentorshipApi } from './api';

export const useMentorshipConversations = () =>
  useQuery({
    queryKey: ['mentorship', 'conversations'],
    queryFn: mentorshipApi.listConversations,
    staleTime: 60 * 1000,
  });

export const useMentorshipConversation = (id?: string) =>
  useQuery({
    queryKey: ['mentorship', 'conversation', id],
    queryFn: () => mentorshipApi.getConversation(id!),
    enabled: !!id,
    staleTime: 30 * 1000,
  });

export const useSendMentorshipMessage = (conversationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => mentorshipApi.sendMessage(conversationId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship'] });
    },
  });
};

export const useRequestEscalation = (conversationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Parameters<typeof mentorshipApi.requestEscalation>[1]) => mentorshipApi.requestEscalation(conversationId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const useRespondEscalation = (conversationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, payload }: { requestId: string; payload: Parameters<typeof mentorshipApi.respondEscalation>[2] }) =>
      mentorshipApi.respondEscalation(conversationId!, requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship'] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export const usePinAdvice = (conversationId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (advice: string) => mentorshipApi.pinAdvice(conversationId!, advice),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mentorship'] }),
  });
};
