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

const notifySessionParticipants = (
  payload: { clientId: string; guideId: string },
  eventName: string,
  eventPayload: any
) => {
  [payload.clientId, payload.guideId].filter(Boolean).forEach((userId) => {
    socketService.toUser(userId, eventName, eventPayload);
    socketService.toUser(userId, 'refresh_data', { domain: 'sessions' });
    socketService.toUser(userId, 'refresh_data', { domain: 'dashboard' });
  });
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

eventEmitter.on('SESSION_STARTED', async (payload: {
  sessionId: string;
  clientId: string;
  guideId: string;
  title: string;
  startedAt: Date;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.clientId,
      actorId: payload.guideId,
      type: NotificationType.SESSION_ACCEPTED,
      entityId: payload.sessionId,
      entityType: 'Session',
      title: 'Session Room Open',
      message: `Your mentor opened "${payload.title}". You can join now.`,
      metadata: { sessionId: payload.sessionId, startedAt: payload.startedAt },
    });

    await notifyUser(payload.clientId, notification, ['sessions', 'dashboard']);
    notifySessionParticipants(payload, 'session_execution_updated', {
      type: 'SESSION_STARTED',
      sessionId: payload.sessionId,
      startedAt: payload.startedAt,
    });
  } catch (err) {
    logger.error('Error handling SESSION_STARTED event:', err);
  }
});

eventEmitter.on('PARTICIPANT_JOINED', async (payload: {
  sessionId: string;
  clientId: string;
  guideId: string;
  participantId: string;
  participantRole: string;
  mentorJoinedAt?: Date;
  menteeJoinedAt?: Date;
  attendanceStatus: string;
}) => {
  notifySessionParticipants(payload, 'session_execution_updated', {
    type: 'PARTICIPANT_JOINED',
    sessionId: payload.sessionId,
    participantId: payload.participantId,
    participantRole: payload.participantRole,
    mentorJoinedAt: payload.mentorJoinedAt,
    menteeJoinedAt: payload.menteeJoinedAt,
    attendanceStatus: payload.attendanceStatus,
  });
});

eventEmitter.on('SESSION_ENDED', async (payload: {
  sessionId: string;
  clientId: string;
  guideId: string;
  endedAt: Date;
  actualDurationMinutes: number;
  attendanceStatus: string;
}) => {
  notifySessionParticipants(payload, 'session_execution_updated', {
    type: 'SESSION_ENDED',
    sessionId: payload.sessionId,
    endedAt: payload.endedAt,
    actualDurationMinutes: payload.actualDurationMinutes,
    attendanceStatus: payload.attendanceStatus,
  });
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
    notifySessionParticipants(payload, 'session_execution_updated', {
      type: 'SESSION_COMPLETED',
      sessionId: payload.sessionId,
      actualDurationMinutes: (payload as any).actualDurationMinutes,
      attendanceVerified: (payload as any).attendanceVerified,
    });
  } catch (err) {
    logger.error('Error handling SESSION_COMPLETED event:', err);
  }
});

// 6. SESSION_REFLECTION_REQUESTED
eventEmitter.on('SESSION_REFLECTION_REQUESTED', async (payload: {
  sessionId: string;
  reflectionId: string;
  menteeId: string;
  mentorId: string;
  title: string;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.menteeId,
      actorId: payload.mentorId,
      type: NotificationType.SESSION_REFLECTION_REQUESTED,
      entityId: payload.sessionId,
      entityType: 'Session',
      title: 'Capture Your Session Learnings',
      message: `Reflect on "${payload.title}" while the guidance is still fresh.`,
      metadata: { sessionId: payload.sessionId, reflectionId: payload.reflectionId },
    });

    await notifyUser(payload.menteeId, notification, ['sessions', 'dashboard', 'reflections']);
  } catch (err) {
    logger.error('Error handling SESSION_REFLECTION_REQUESTED event:', err);
  }
});

// 7. SESSION_REFLECTION_SUBMITTED
eventEmitter.on('SESSION_REFLECTION_SUBMITTED', async (payload: {
  sessionId: string;
  reflectionId: string;
  menteeId: string;
  mentorId: string;
  title: string;
  confidenceLevel: number;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.mentorId,
      actorId: payload.menteeId,
      type: NotificationType.SESSION_REFLECTION_SUBMITTED,
      entityId: payload.sessionId,
      entityType: 'Session',
      title: 'Reflection Submitted',
      message: `Your mentee reflected on "${payload.title}" and rated confidence ${payload.confidenceLevel}/5.`,
      metadata: { sessionId: payload.sessionId, reflectionId: payload.reflectionId },
    });

    await notifyUser(payload.mentorId, notification, ['sessions', 'dashboard', 'reflections']);
  } catch (err) {
    logger.error('Error handling SESSION_REFLECTION_SUBMITTED event:', err);
  }
});

// 8. MENTOR_FOLLOWUP_ADDED
eventEmitter.on('MENTOR_FOLLOWUP_ADDED', async (payload: {
  sessionId: string;
  reflectionId: string;
  menteeId: string;
  mentorId: string;
  title: string;
  recommendationCount: number;
}) => {
  try {
    const notification = await notificationService.createNotification({
      recipientId: payload.menteeId,
      actorId: payload.mentorId,
      type: NotificationType.MENTOR_FOLLOWUP_ADDED,
      entityId: payload.sessionId,
      entityType: 'Session',
      title: 'Mentor Follow-Up Added',
      message: `Your mentor added ${payload.recommendationCount || 'new'} next-step recommendations for "${payload.title}".`,
      metadata: { sessionId: payload.sessionId, reflectionId: payload.reflectionId },
    });

    await notifyUser(payload.menteeId, notification, ['sessions', 'dashboard', 'roadmap', 'reflections']);
  } catch (err) {
    logger.error('Error handling MENTOR_FOLLOWUP_ADDED event:', err);
  }
});

// 9. REVIEW_RECEIVED
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

eventEmitter.on('ROADMAP_STEP_COMPLETED', async (payload: {
  roadmapId: string;
  stepId: string;
  userId: string;
  stepTitle: string;
  progressPercentage: number;
}) => {
  try {
    socketService.toUser(payload.userId, 'roadmap_community_updated', {
      type: 'ROADMAP_STEP_COMPLETED',
      roadmapId: payload.roadmapId,
      stepId: payload.stepId,
      progressPercentage: payload.progressPercentage,
    });
    socketService.toUser(payload.userId, 'refresh_data', { domain: 'roadmap' });
    socketService.toUser(payload.userId, 'refresh_data', { domain: 'dashboard' });
  } catch (err) {
    logger.error('Error handling ROADMAP_STEP_COMPLETED event:', err);
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

// 11. ANSWER_ACCEPTED
eventEmitter.on('ANSWER_ACCEPTED', async (payload: {
  postId: string;
  replyId: string;
  actorId: string;
  recipientId: string;
  postTitle: string;
  actorName: string;
}) => {
  try {
    if (payload.actorId === payload.recipientId) return;

    const notification = await notificationService.createNotification({
      recipientId: payload.recipientId,
      actorId: payload.actorId,
      type: NotificationType.ANSWER_ACCEPTED,
      entityId: payload.postId,
      entityType: 'Post',
      title: 'Answer Accepted',
      message: `${payload.actorName || 'The post author'} accepted your answer on "${payload.postTitle}".`,
      metadata: { postId: payload.postId, replyId: payload.replyId },
    });

    await notifyUser(payload.recipientId, notification, ['forums', 'dashboard', 'reputation']);
  } catch (err) {
    logger.error('Error handling ANSWER_ACCEPTED event:', err);
  }
});

// 12. POST_RESOLVED
eventEmitter.on('POST_RESOLVED', async (payload: {
  postId: string;
  replyId?: string;
  actorId: string;
  recipientId: string;
  postTitle: string;
  acceptedAuthorName?: string;
  cleared?: boolean;
  moderatorOverride?: boolean;
}) => {
  try {
    const title = payload.cleared ? 'Solved Status Removed' : 'Post Resolved';
    const message = payload.cleared
      ? `The solved status was removed from "${payload.postTitle}".`
      : `"${payload.postTitle}" was marked resolved with an answer from ${payload.acceptedAuthorName || 'a contributor'}.`;

    const notification = await notificationService.createNotification({
      recipientId: payload.recipientId,
      actorId: payload.actorId,
      type: NotificationType.POST_RESOLVED,
      entityId: payload.postId,
      entityType: 'Post',
      title,
      message,
      metadata: {
        postId: payload.postId,
        replyId: payload.replyId,
        cleared: !!payload.cleared,
        moderatorOverride: !!payload.moderatorOverride,
      },
    });

    await notifyUser(payload.recipientId, notification, ['forums', 'dashboard']);
  } catch (err) {
    logger.error('Error handling POST_RESOLVED event:', err);
  }
});

// 13. GUIDE_FOLLOWED
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
