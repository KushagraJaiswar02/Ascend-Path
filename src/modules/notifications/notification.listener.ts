import { eventEmitter } from '../../utils/eventEmitter';
import { notificationService } from './notification.service';
import { socketService } from '../realtime/socket';
import { NotificationType } from './notification.model';
import { logger } from '../../utils/logger';

// Helper to trigger socket notifications and data refreshes in parallel
const notifyUser = async (recipientId: string, eventPayload: any, domains: string[] = []) => {
  try {
    // 1. Fetch live unread count
    const unreadCount = await notificationService.getUnreadCount(recipientId);

    // 2. Emit new_notification packet to the isolated user room
    socketService.toUser(recipientId, 'new_notification', {
      notification: eventPayload,
      unreadCount,
    });

    // 3. Emit light-weight dashboard refresh triggers for specified domains
    for (const domain of domains) {
      socketService.toUser(recipientId, 'refresh_data', { domain });
    }
  } catch (error) {
    logger.error(`Failed to dispatch websocket updates to user ${recipientId}:`, error);
  }
};

// 1. PING_RECEIVED
eventEmitter.on('PING_RECEIVED', async (payload: {
  pingId: string;
  senderId: string;
  recipientId: string;
  message: string;
  senderName: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.recipientId,
      actorId: payload.senderId,
      type: NotificationType.PING_RECEIVED,
      entityId: payload.pingId,
      entityType: 'Ping',
      title: 'New Ping Received',
      message: `${payload.senderName || 'A learner'} sent you a new ping: "${payload.message}"`,
      metadata: { pingId: payload.pingId },
    });

    await notifyUser(payload.recipientId, notification, ['pings', 'dashboard']);
  } catch (err) {
    logger.error('Error handling PING_RECEIVED event:', err);
  }
});

// 2. PING_ANSWERED
eventEmitter.on('PING_ANSWERED', async (payload: {
  pingId: string;
  senderId: string;
  recipientId: string;
  answer: string;
  senderName: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.recipientId,
      actorId: payload.senderId,
      type: NotificationType.PING_ANSWERED,
      entityId: payload.pingId,
      entityType: 'Ping',
      title: 'Ping Answered',
      message: `${payload.senderName || 'Your guide'} has answered your ping: "${payload.answer}"`,
      metadata: { pingId: payload.pingId },
    });

    await notifyUser(payload.recipientId, notification, ['pings', 'dashboard']);
  } catch (err) {
    logger.error('Error handling PING_ANSWERED event:', err);
  }
});

// 3. SESSION_BOOKED
eventEmitter.on('SESSION_BOOKED', async (payload: {
  sessionId: string;
  clientId: string;
  guideId: string;
  title: string;
  clientName: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.guideId,
      actorId: payload.clientId,
      type: NotificationType.SESSION_BOOKED,
      entityId: payload.sessionId,
      entityType: 'Session',
      title: 'New Session Booked',
      message: `${payload.clientName || 'A learner'} booked a new session: "${payload.title}"`,
      metadata: { sessionId: payload.sessionId },
    });

    await notifyUser(payload.guideId, notification, ['sessions', 'dashboard']);
  } catch (err) {
    logger.error('Error handling SESSION_BOOKED event:', err);
  }
});

// 4. SESSION_ACCEPTED
eventEmitter.on('SESSION_ACCEPTED', async (payload: {
  sessionId: string;
  clientId: string;
  guideId: string;
  title: string;
  guideName: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.clientId,
      actorId: payload.guideId,
      type: NotificationType.SESSION_ACCEPTED,
      entityId: payload.sessionId,
      entityType: 'Session',
      title: 'Session Accepted',
      message: `${payload.guideName || 'A guide'} accepted your session booking: "${payload.title}"`,
      metadata: { sessionId: payload.sessionId },
    });

    await notifyUser(payload.clientId, notification, ['sessions', 'dashboard']);
  } catch (err) {
    logger.error('Error handling SESSION_ACCEPTED event:', err);
  }
});

// 5. SESSION_COMPLETED
eventEmitter.on('SESSION_COMPLETED', async (payload: {
  sessionId: string;
  clientId: string;
  guideId: string;
  title: string;
  guideName: string;
}) => {
  try {
    // Notify learner to leave review
    const notification = await notificationService.createNotification({
      recipientId: payload.clientId,
      actorId: payload.guideId,
      type: NotificationType.SESSION_COMPLETED,
      entityId: payload.sessionId,
      entityType: 'Session',
      title: 'Session Completed',
      message: `Your session "${payload.title}" with ${payload.guideName || 'your guide'} is complete. Share your feedback by writing a verified review!`,
      metadata: { sessionId: payload.sessionId },
    });

    await notifyUser(payload.clientId, notification, ['sessions', 'dashboard', 'reviews']);
    // Also trigger silent data refresh on guide dashboard so session finishes live
    socketService.toUser(payload.guideId, 'refresh_data', { domain: 'sessions' });
    socketService.toUser(payload.guideId, 'refresh_data', { domain: 'dashboard' });
  } catch (err) {
    logger.error('Error handling SESSION_COMPLETED event:', err);
  }
});

// 6. REVIEW_RECEIVED
eventEmitter.on('REVIEW_RECEIVED', async (payload: {
  reviewId: string;
  reviewerId: string;
  guideId: string;
  rating: number;
  reviewerName: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.guideId,
      actorId: payload.reviewerId,
      type: NotificationType.REVIEW_RECEIVED,
      entityId: payload.reviewId,
      entityType: 'Review',
      title: 'New Review Received',
      message: `${payload.reviewerName || 'A user'} left you a verified ${payload.rating}-star review.`,
      metadata: { reviewId: payload.reviewId, rating: payload.rating },
    });

    await notifyUser(payload.guideId, notification, ['reviews', 'dashboard']);
  } catch (err) {
    logger.error('Error handling REVIEW_RECEIVED event:', err);
  }
});

// 7. ROADMAP_COMPLETED
eventEmitter.on('ROADMAP_COMPLETED', async (payload: {
  roadmapId: string;
  userId: string;
  title: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.userId,
      type: NotificationType.ROADMAP_COMPLETED,
      entityId: payload.roadmapId,
      entityType: 'Roadmap',
      title: 'Roadmap Completed! 🎉',
      message: `Congratulations! You have fully completed the roadmap "${payload.title}". Awesome job!`,
      metadata: { roadmapId: payload.roadmapId },
    });

    await notifyUser(payload.userId, notification, ['roadmap', 'dashboard']);
  } catch (err) {
    logger.error('Error handling ROADMAP_COMPLETED event:', err);
  }
});

// 8. STEP_COMPLETED
eventEmitter.on('STEP_COMPLETED', async (payload: {
  roadmapId: string;
  stepId: string;
  userId: string;
  stepTitle: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.userId,
      type: NotificationType.STEP_COMPLETED,
      entityId: payload.stepId,
      entityType: 'Step',
      title: 'Step Completed',
      message: `You marked step "${payload.stepTitle}" as completed. Keep up the momentum!`,
      metadata: { roadmapId: payload.roadmapId, stepId: payload.stepId },
    });

    await notifyUser(payload.userId, notification, ['roadmap']);
  } catch (err) {
    logger.error('Error handling STEP_COMPLETED event:', err);
  }
});

// 9. POST_REPLY
eventEmitter.on('POST_REPLY', async (payload: {
  postId: string;
  replyId: string;
  authorId: string;
  recipientId: string;
  postTitle: string;
  authorName: string;
}) => {
  try {
    // Avoid notifying themselves
    if (payload.authorId === payload.recipientId) return;

    const notification = await notificationService.createNotification({
      recipientId: payload.recipientId,
      actorId: payload.authorId,
      type: NotificationType.POST_REPLY,
      entityId: payload.postId,
      entityType: 'Post',
      title: 'New Reply on Post',
      message: `${payload.authorName || 'Someone'} replied to your post "${payload.postTitle}"`,
      metadata: { postId: payload.postId, replyId: payload.replyId },
    });

    await notifyUser(payload.recipientId, notification, ['forums']);
  } catch (err) {
    logger.error('Error handling POST_REPLY event:', err);
  }
});

// 10. POST_UPVOTED
eventEmitter.on('POST_UPVOTED', async (payload: {
  postId: string;
  upvoterId: string;
  recipientId: string;
  postTitle: string;
  upvoterName: string;
}) => {
  try {
    if (payload.upvoterId === payload.recipientId) return;

    const notification = await notificationService.createNotification({
      recipientId: payload.recipientId,
      actorId: payload.upvoterId,
      type: NotificationType.POST_UPVOTED,
      entityId: payload.postId,
      entityType: 'Post',
      title: 'Post Upvoted',
      message: `Your post "${payload.postTitle}" was upvoted by ${payload.upvoterName || 'another user'}.`,
      metadata: { postId: payload.postId },
    });

    await notifyUser(payload.recipientId, notification, ['forums']);
  } catch (err) {
    logger.error('Error handling POST_UPVOTED event:', err);
  }
});

// 11. GUIDE_FOLLOWED
eventEmitter.on('GUIDE_FOLLOWED', async (payload: {
  guideId: string;
  followerId: string;
  followerName: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.guideId,
      actorId: payload.followerId,
      type: NotificationType.GUIDE_FOLLOWED,
      entityId: payload.followerId,
      entityType: 'User',
      title: 'New Follower! 👤',
      message: `${payload.followerName || 'A learner'} started following your guide profile.`,
      metadata: { followerId: payload.followerId },
    });

    await notifyUser(payload.guideId, notification, ['dashboard']);
  } catch (err) {
    logger.error('Error handling GUIDE_FOLLOWED event:', err);
  }
});

// 12. WARNING_ISSUED
eventEmitter.on('WARNING_ISSUED', async (payload: {
  userId: string;
  reason: string;
  type: 'warning' | 'mute';
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.userId,
      type: NotificationType.WARNING_ISSUED,
      title: `Account Notice: ${payload.type === 'mute' ? 'Muted' : 'Warned'}`,
      message: `A moderator issued a ${payload.type} to your account. Reason: "${payload.reason}"`,
      metadata: { reason: payload.reason, type: payload.type },
    });

    await notifyUser(payload.userId, notification, ['dashboard']);
  } catch (err) {
    logger.error('Error handling WARNING_ISSUED event:', err);
  }
});

logger.info('🔔 [NotificationListener] Central domain event subscribers registered successfully');
