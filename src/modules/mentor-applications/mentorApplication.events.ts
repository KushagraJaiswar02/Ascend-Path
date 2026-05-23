import { eventEmitter } from '../../utils/eventEmitter';
import { logger } from '../../utils/logger';
import { NotificationType } from '../notifications/notification.model';
import { notificationService } from '../notifications/notification.service';
import { socketService } from '../realtime/socket';

const notifyUser = async (recipientId: string, notification: any, domains: string[] = []) => {
  const unreadCount = await notificationService.getUnreadCount(recipientId);
  socketService.toUser(recipientId, 'new_notification', { notification, unreadCount });
  domains.forEach((domain) => socketService.toUser(recipientId, 'refresh_data', { domain }));
};

eventEmitter.on('MENTOR_APPLICATION_SUBMITTED', async (payload: {
  applicationId: string;
  userId: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.userId,
      type: NotificationType.MENTOR_APPLICATION_SUBMITTED,
      entityId: payload.applicationId,
      entityType: 'MentorApplication',
      title: 'Mentor application submitted',
      message: 'Your application is in the review queue. We will notify you when a moderator reviews it.',
      metadata: { applicationId: payload.applicationId },
    });
    await notifyUser(payload.userId, notification, ['dashboard', 'mentor_application']);
  } catch (error) {
    logger.error('Error handling MENTOR_APPLICATION_SUBMITTED event:', error);
  }
});

eventEmitter.on('MENTOR_APPLICATION_APPROVED', async (payload: {
  applicationId: string;
  userId: string;
  reviewerId: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.userId,
      actorId: payload.reviewerId,
      type: NotificationType.MENTOR_APPLICATION_APPROVED,
      entityId: payload.applicationId,
      entityType: 'MentorApplication',
      title: 'Mentor application approved',
      message: 'Your mentor profile is approved. Guide tools, discovery, sessions, and roadmap ownership are now unlocked.',
      metadata: { applicationId: payload.applicationId },
    });
    await notifyUser(payload.userId, notification, ['dashboard', 'guides', 'sessions', 'roadmaps']);
  } catch (error) {
    logger.error('Error handling MENTOR_APPLICATION_APPROVED event:', error);
  }
});

eventEmitter.on('MENTOR_APPLICATION_REJECTED', async (payload: {
  applicationId: string;
  userId: string;
  reviewerId: string;
  reason?: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.userId,
      actorId: payload.reviewerId,
      type: NotificationType.MENTOR_APPLICATION_REJECTED,
      entityId: payload.applicationId,
      entityType: 'MentorApplication',
      title: 'Mentor application reviewed',
      message: payload.reason ? `Your application was not approved yet. Reason: ${payload.reason}` : 'Your application was not approved yet.',
      metadata: { applicationId: payload.applicationId },
    });
    await notifyUser(payload.userId, notification, ['dashboard', 'mentor_application']);
  } catch (error) {
    logger.error('Error handling MENTOR_APPLICATION_REJECTED event:', error);
  }
});

eventEmitter.on('MENTOR_APPLICATION_CHANGES_REQUESTED', async (payload: {
  applicationId: string;
  userId: string;
  reviewerId: string;
  changeRequest?: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.userId,
      actorId: payload.reviewerId,
      type: NotificationType.MENTOR_APPLICATION_CHANGES_REQUESTED,
      entityId: payload.applicationId,
      entityType: 'MentorApplication',
      title: 'Mentor application needs updates',
      message: payload.changeRequest || 'A reviewer requested changes before your application can be approved.',
      metadata: { applicationId: payload.applicationId },
    });
    await notifyUser(payload.userId, notification, ['dashboard', 'mentor_application']);
  } catch (error) {
    logger.error('Error handling MENTOR_APPLICATION_CHANGES_REQUESTED event:', error);
  }
});

logger.info('[MentorApplicationEvents] Domain event subscribers registered successfully');
