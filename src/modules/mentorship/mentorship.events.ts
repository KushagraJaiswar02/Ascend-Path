import { eventEmitter } from '../../utils/eventEmitter';
import { logger } from '../../utils/logger';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { socketService } from '../realtime/socket';

const notifyUser = async (recipientId: string, eventPayload: any, domains: string[] = []) => {
  const unreadCount = await notificationService.getUnreadCount(recipientId);
  socketService.toUser(recipientId, 'new_notification', { notification: eventPayload, unreadCount });
  domains.forEach((domain) => socketService.toUser(recipientId, 'refresh_data', { domain }));
};

eventEmitter.on('MENTORSHIP_REQUEST_CREATED', async (payload: any) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.mentorId,
      actorId: payload.menteeId,
      type: NotificationType.MENTORSHIP_REQUEST_RECEIVED,
      entityId: payload.conversationId,
      entityType: 'MentorshipConversation',
      title: 'New mentorship question',
      message: `A learner asked for guidance: "${payload.message.slice(0, 120)}"`,
      metadata: { conversationId: payload.conversationId, messageId: payload.messageId },
    });
    await notifyUser(payload.mentorId, notification, ['mentorship', 'dashboard']);
    socketService.toUser(payload.mentorId, 'MENTORSHIP_REQUEST_CREATED', payload);
  } catch (err) {
    logger.error('Error handling MENTORSHIP_REQUEST_CREATED event:', err);
  }
});

eventEmitter.on('MENTORSHIP_MESSAGE_SENT', async (payload: any) => {
  if (!payload.recipientId) return;
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.recipientId,
      actorId: payload.senderId,
      type: NotificationType.MENTORSHIP_MESSAGE_RECEIVED,
      entityId: payload.conversationId,
      entityType: 'MentorshipConversation',
      title: payload.messageType === 'session-request' ? 'Mentorship session update' : 'New mentor message',
      message: payload.content.slice(0, 160),
      metadata: { conversationId: payload.conversationId, messageId: payload.messageId },
    });
    await notifyUser(payload.recipientId, notification, ['mentorship', 'dashboard']);
    socketService.toUser(payload.recipientId, 'MENTORSHIP_MESSAGE_SENT', payload);
  } catch (err) {
    logger.error('Error handling MENTORSHIP_MESSAGE_SENT event:', err);
  }
});

eventEmitter.on('MENTORSHIP_MESSAGE_READ', async (payload: any) => {
  socketService.toUser(payload.userId, 'MENTORSHIP_MESSAGE_READ', payload);
});

eventEmitter.on('SESSION_ESCALATION_REQUESTED', async (payload: any) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.mentorId,
      actorId: payload.menteeId,
      type: NotificationType.SESSION_ESCALATION_REQUESTED,
      entityId: payload.requestId,
      entityType: 'SessionEscalationRequest',
      title: '1:1 session requested',
      message: `A learner wants to escalate this mentorship thread: "${payload.topic}"`,
      metadata: { conversationId: payload.conversationId, requestId: payload.requestId },
    });
    await notifyUser(payload.mentorId, notification, ['mentorship', 'sessions', 'dashboard']);
    socketService.toUser(payload.mentorId, 'SESSION_ESCALATION_REQUESTED', payload);
  } catch (err) {
    logger.error('Error handling SESSION_ESCALATION_REQUESTED event:', err);
  }
});

eventEmitter.on('SESSION_ESCALATION_ACCEPTED', async (payload: any) => {
  const notification = await notificationService.createNotification({
    recipientId: payload.menteeId,
    actorId: payload.mentorId,
    type: NotificationType.SESSION_ESCALATION_ACCEPTED,
    entityId: payload.requestId,
    entityType: 'SessionEscalationRequest',
    title: 'Mentor approved your 1:1 session',
    message: 'Your conversation has been escalated into a private mentorship session.',
    metadata: payload,
  });
  await notifyUser(payload.menteeId, notification, ['mentorship', 'sessions', 'dashboard']);
  socketService.toUser(payload.menteeId, 'SESSION_ESCALATION_ACCEPTED', payload);
});

eventEmitter.on('SESSION_ESCALATION_DECLINED', async (payload: any) => {
  const notification = await notificationService.createNotification({
    recipientId: payload.menteeId,
    actorId: payload.mentorId,
    type: NotificationType.SESSION_ESCALATION_DECLINED,
    entityId: payload.requestId,
    entityType: 'SessionEscalationRequest',
    title: 'Mentor responded to your 1:1 request',
    message: 'Your mentor suggested the next best support path for this thread.',
    metadata: payload,
  });
  await notifyUser(payload.menteeId, notification, ['mentorship', 'sessions', 'dashboard']);
  socketService.toUser(payload.menteeId, 'SESSION_ESCALATION_DECLINED', payload);
});
