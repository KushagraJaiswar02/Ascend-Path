import mongoose from 'mongoose';
import {
  MentorshipConversation,
  MentorshipConversationStatus,
  MentorshipMessage,
  SessionEscalationRequest,
} from './mentorship.model';

const asId = (id: string) => new mongoose.Types.ObjectId(id);

export const mentorshipRepository = {
  async findConversationBetween(mentorId: string, menteeId: string) {
    return MentorshipConversation.findOne({ mentorId, menteeId });
  },

  async createConversation(data: any) {
    return MentorshipConversation.create(data);
  },

  async getConversationForUser(conversationId: string, userId: string) {
    return MentorshipConversation.findOne({ _id: conversationId, participants: userId })
      .populate('mentorId menteeId', 'name role avatar headline mentorProfileStatus')
      .populate('activeSessionId', 'title topic scheduledAt status attendanceStatus meetingUrl');
  },

  async listConversations(userId: string, status?: string) {
    const query: any = { participants: userId };
    if (status) query.status = status;
    else query.status = { $ne: MentorshipConversationStatus.BLOCKED };
    return MentorshipConversation.find(query)
      .populate('mentorId menteeId', 'name role avatar headline mentorProfileStatus')
      .populate('activeSessionId', 'title topic scheduledAt status attendanceStatus')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .limit(80);
  },

  async createMessage(data: any) {
    return MentorshipMessage.create(data);
  },

  async listMessages(conversationId: string, before?: string, limit = 40) {
    const query: any = { conversationId };
    if (before) query.createdAt = { $lt: new Date(before) };
    return MentorshipMessage.find(query)
      .populate('senderId', 'name role avatar')
      .sort({ createdAt: -1 })
      .limit(limit);
  },

  async updateConversationAfterMessage(conversation: any, message: any) {
    const updates: any = {
      lastMessageAt: message.createdAt,
      lastMessagePreview: message.content.slice(0, 220),
    };
    const unreadCounts = new Map(conversation.unreadCounts || []);
    conversation.participants.forEach((participantId: any) => {
      const key = participantId.toString();
      if (key !== message.senderId.toString()) unreadCounts.set(key, Number(unreadCounts.get(key) || 0) + 1);
    });
    updates.unreadCounts = unreadCounts;
    return MentorshipConversation.findByIdAndUpdate(conversation._id, updates, { new: true });
  },

  async markRead(conversationId: string, userId: string) {
    const conversation = await MentorshipConversation.findOne({ _id: conversationId, participants: userId });
    if (!conversation) return null;
    conversation.unreadCounts.set(userId, 0);
    const existing = conversation.participantStates.find((state: any) => state.userId.toString() === userId);
    if (existing) existing.lastReadAt = new Date();
    else conversation.participantStates.push({ userId: asId(userId), lastReadAt: new Date() } as any);
    await conversation.save();
    await MentorshipMessage.updateMany(
      { conversationId, 'readBy.userId': { $ne: asId(userId) } },
      { $push: { readBy: { userId: asId(userId), readAt: new Date() } } }
    );
    return conversation;
  },

  async updateStatus(conversationId: string, userId: string, status: MentorshipConversationStatus) {
    return MentorshipConversation.findOneAndUpdate({ _id: conversationId, participants: userId }, { status }, { new: true });
  },

  async pinAdvice(conversationId: string, userId: string, advice: string) {
    const conversation = await MentorshipConversation.findOne({ _id: conversationId, participants: userId });
    if (!conversation) return null;
    const existing = conversation.participantStates.find((state: any) => state.userId.toString() === userId);
    if (existing) existing.pinnedAdvice = advice;
    else conversation.participantStates.push({ userId: asId(userId), pinnedAdvice: advice } as any);
    return conversation.save();
  },

  async createEscalation(data: any) {
    return SessionEscalationRequest.create(data);
  },

  async getEscalation(requestId: string, conversationId: string) {
    return SessionEscalationRequest.findOne({ _id: requestId, conversationId });
  },

  async updateEscalation(requestId: string, updates: any) {
    return SessionEscalationRequest.findByIdAndUpdate(requestId, updates, { new: true });
  },

  async listEscalations(conversationId: string) {
    return SessionEscalationRequest.find({ conversationId }).sort({ createdAt: -1 }).limit(10);
  },
};
