import { apiClient } from '@/services/apiClient';
import type { MentorshipConversation, MentorshipMessage, SessionEscalationRequest } from './types';

export const mentorshipApi = {
  async listConversations() {
    const { data } = await apiClient.get('/mentorship/conversations');
    return data.data.conversations as MentorshipConversation[];
  },

  async getConversation(id: string) {
    const { data } = await apiClient.get(`/mentorship/conversations/${id}`);
    return data.data as {
      conversation: MentorshipConversation;
      messages: MentorshipMessage[];
      escalations: SessionEscalationRequest[];
    };
  },

  async startConversation(payload: {
    mentorId: string;
    message: string;
    startedFrom?: string;
    linkedRoadmapId?: string;
    linkedOpportunityId?: string;
  }) {
    const { data } = await apiClient.post('/mentorship/conversations', payload);
    return data.data as { conversation: MentorshipConversation; messages: MentorshipMessage[] };
  },

  async sendMessage(conversationId: string, content: string) {
    const { data } = await apiClient.post(`/mentorship/conversations/${conversationId}/messages`, { content, messageType: 'text' });
    return data.data.message as MentorshipMessage;
  },

  async markRead(conversationId: string) {
    const { data } = await apiClient.post(`/mentorship/conversations/${conversationId}/read`);
    return data.data.conversation as MentorshipConversation;
  },

  async pinAdvice(conversationId: string, advice: string) {
    const { data } = await apiClient.post(`/mentorship/conversations/${conversationId}/pin-advice`, { advice });
    return data.data.conversation as MentorshipConversation;
  },

  async requestEscalation(conversationId: string, payload: {
    topic: string;
    objective: string;
    roadmapArea?: string;
    urgency: 'low' | 'normal' | 'high';
    preferredSlots: string[];
    expectedHelpType: string;
  }) {
    const { data } = await apiClient.post(`/mentorship/conversations/${conversationId}/escalations`, payload);
    return data.data.request as SessionEscalationRequest;
  },

  async respondEscalation(conversationId: string, requestId: string, payload: {
    action: 'accept' | 'decline' | 'alternate' | 'async' | 'workshop';
    mentorResponse?: string;
    proposedSlots?: string[];
    scheduledAt?: string;
    durationMinutes?: number;
  }) {
    const { data } = await apiClient.post(`/mentorship/conversations/${conversationId}/escalations/${requestId}/respond`, payload);
    return data.data.request as SessionEscalationRequest;
  },
};
