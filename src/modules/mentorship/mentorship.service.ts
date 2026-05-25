import mongoose from 'mongoose';
import { eventEmitter } from '../../utils/eventEmitter';
import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { sessionRepository } from '../sessions/session.repository';
import { AttendanceStatus, SessionExecutionState, SessionStatus, SessionType } from '../sessions/session.model';
import { mentorshipRepository } from './mentorship.repository';
import {
  MentorshipConversationStatus,
  MentorshipMessageType,
  MentorshipStartedFrom,
  SessionEscalationStatus,
} from './mentorship.model';
import { CreateConversationInput, EscalationInput, EscalationResponseInput, SendMessageInput } from './mentorship.validation';

const id = (value: any) => value?._id?.toString?.() || value?.toString?.() || '';
const asObjectId = (value: string) => new mongoose.Types.ObjectId(value);
const isMentorRole = (role?: string) => [Role.GUIDE, Role.PATHFINDER].includes(role as Role);

export const mentorshipService = {
  async startConversation(userId: string, input: CreateConversationInput) {
    if (userId === input.mentorId) throw { statusCode: 400, message: 'You cannot start mentorship with yourself' };
    const mentor = await userRepository.findUserById(input.mentorId);
    if (!mentor || !isMentorRole(mentor.role)) throw { statusCode: 404, message: 'Mentor not found' };

    let conversation = await mentorshipRepository.findConversationBetween(input.mentorId, userId);
    if (!conversation) {
      conversation = await mentorshipRepository.createConversation({
        participants: [asObjectId(input.mentorId), asObjectId(userId)],
        mentorId: input.mentorId,
        menteeId: userId,
        startedFrom: input.startedFrom,
        linkedRoadmapId: input.linkedRoadmapId,
        linkedOpportunityId: input.linkedOpportunityId,
        linkedDomainId: input.linkedDomainId,
        unreadCounts: new Map([[input.mentorId, 0], [userId, 0]]),
        participantStates: [
          { userId: asObjectId(input.mentorId) },
          { userId: asObjectId(userId) },
        ],
      });
    }

    const message = await this.sendMessage(userId, conversation._id.toString(), {
      messageType: MentorshipMessageType.TEXT,
      content: input.message,
      attachments: [],
      linkedRoadmapId: input.linkedRoadmapId,
      linkedOpportunityId: input.linkedOpportunityId,
    }, true);

    eventEmitter.emit('MENTORSHIP_REQUEST_CREATED', {
      conversationId: conversation._id.toString(),
      messageId: message._id.toString(),
      mentorId: input.mentorId,
      menteeId: userId,
      message: input.message,
    });

    return this.getConversation(userId, conversation._id.toString());
  },

  async listConversations(userId: string, status?: string) {
    return mentorshipRepository.listConversations(userId, status);
  },

  async getConversation(userId: string, conversationId: string) {
    const conversation = await mentorshipRepository.getConversationForUser(conversationId, userId);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    const [messagesDescending, escalations] = await Promise.all([
      mentorshipRepository.listMessages(conversationId),
      mentorshipRepository.listEscalations(conversationId),
    ]);
    return {
      conversation,
      messages: messagesDescending.reverse(),
      escalations,
    };
  },

  async sendMessage(userId: string, conversationId: string, input: SendMessageInput, suppressEvent = false) {
    const conversation = await mentorshipRepository.getConversationForUser(conversationId, userId);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    if (conversation.status === MentorshipConversationStatus.BLOCKED) throw { statusCode: 403, message: 'This conversation is blocked' };

    const message = await mentorshipRepository.createMessage({
      conversationId,
      senderId: userId,
      messageType: input.messageType,
      content: input.content,
      attachments: input.attachments || [],
      linkedRoadmapId: input.linkedRoadmapId,
      linkedOpportunityId: input.linkedOpportunityId,
      readBy: [{ userId: asObjectId(userId), readAt: new Date() }],
    });
    await mentorshipRepository.updateConversationAfterMessage(conversation, message);

    const recipientId = conversation.participants.map(id).find((participantId: string) => participantId !== userId);
    if (!suppressEvent) {
      eventEmitter.emit('MENTORSHIP_MESSAGE_SENT', {
        conversationId,
        messageId: message._id.toString(),
        senderId: userId,
        recipientId,
        content: input.content,
        messageType: input.messageType,
      });
    }
    return message.populate('senderId', 'name role avatar');
  },

  async markRead(userId: string, conversationId: string) {
    const conversation = await mentorshipRepository.markRead(conversationId, userId);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    eventEmitter.emit('MENTORSHIP_MESSAGE_READ', { conversationId, userId });
    return conversation;
  },

  async archive(userId: string, conversationId: string) {
    const conversation = await mentorshipRepository.updateStatus(conversationId, userId, MentorshipConversationStatus.ARCHIVED);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    return conversation;
  },

  async block(userId: string, conversationId: string) {
    const conversation = await mentorshipRepository.updateStatus(conversationId, userId, MentorshipConversationStatus.BLOCKED);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    return conversation;
  },

  async pinAdvice(userId: string, conversationId: string, advice: string) {
    const conversation = await mentorshipRepository.pinAdvice(conversationId, userId, advice);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    return conversation;
  },

  async requestEscalation(userId: string, conversationId: string, input: EscalationInput) {
    const conversation = await mentorshipRepository.getConversationForUser(conversationId, userId);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    if (id(conversation.menteeId) !== userId) throw { statusCode: 403, message: 'Only the mentee can request a private escalation session' };

    const escalation = await mentorshipRepository.createEscalation({
      conversationId,
      mentorId: id(conversation.mentorId),
      menteeId: id(conversation.menteeId),
      requestedBy: userId,
      ...input,
    });
    await this.sendMessage(userId, conversationId, {
      messageType: MentorshipMessageType.SESSION_REQUEST,
      content: `Session request: ${input.topic}. ${input.objective}`,
      attachments: [],
    });
    eventEmitter.emit('SESSION_ESCALATION_REQUESTED', {
      conversationId,
      requestId: escalation._id.toString(),
      mentorId: id(conversation.mentorId),
      menteeId: userId,
      topic: input.topic,
    });
    return escalation;
  },

  async respondEscalation(userId: string, conversationId: string, requestId: string, input: EscalationResponseInput) {
    const conversation = await mentorshipRepository.getConversationForUser(conversationId, userId);
    if (!conversation) throw { statusCode: 404, message: 'Conversation not found' };
    if (id(conversation.mentorId) !== userId) throw { statusCode: 403, message: 'Only the mentor can respond to escalation requests' };

    const request = await mentorshipRepository.getEscalation(requestId, conversationId);
    if (!request) throw { statusCode: 404, message: 'Escalation request not found' };

    let status = SessionEscalationStatus.DECLINED;
    let sessionId: string | undefined;
    if (input.action === 'accept') {
      status = SessionEscalationStatus.ACCEPTED;
      const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000);
      const session = await sessionRepository.createSession({
        guideId: userId as any,
        clientId: id(conversation.menteeId) as any,
        sessionType: SessionType.PRIVATE_MENTORSHIP,
        title: request.topic,
        topic: request.topic,
        description: `Escalated from mentorship conversation. Objective: ${request.objective}`,
        scheduledAt,
        durationMinutes: input.durationMinutes,
        price: 0,
        status: SessionStatus.BOOKED,
        isPublic: false,
        attendanceStatus: AttendanceStatus.SCHEDULED,
        sessionExecutionState: SessionExecutionState.SCHEDULED,
        resources: [],
      } as any);
      sessionId = session._id.toString();
    } else if (input.action === 'alternate') status = SessionEscalationStatus.ALTERNATE_PROPOSED;
    else if (input.action === 'async') status = SessionEscalationStatus.ASYNC_CONTINUED;
    else if (input.action === 'workshop') status = SessionEscalationStatus.WORKSHOP_RECOMMENDED;

    const updated = await mentorshipRepository.updateEscalation(requestId, {
      status,
      mentorResponse: input.mentorResponse,
      proposedSlots: input.proposedSlots,
      sessionId,
    });
    if (sessionId) {
      await mentorshipRepository.updateConversationAfterMessage(conversation, {
        createdAt: new Date(),
        content: `Session approved for ${request.topic}`,
        senderId: asObjectId(userId),
      });
    }
    await this.sendMessage(userId, conversationId, {
      messageType: MentorshipMessageType.SESSION_REQUEST,
      content: input.mentorResponse || `Session request ${status.replace('_', ' ')}.`,
      attachments: [],
    });
    eventEmitter.emit(status === SessionEscalationStatus.ACCEPTED ? 'SESSION_ESCALATION_ACCEPTED' : 'SESSION_ESCALATION_DECLINED', {
      conversationId,
      requestId,
      sessionId,
      mentorId: userId,
      menteeId: id(conversation.menteeId),
      status,
    });
    return updated;
  },
};
