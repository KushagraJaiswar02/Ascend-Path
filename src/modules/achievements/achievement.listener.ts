import { eventEmitter } from '../../utils/eventEmitter';
import { achievementService } from './achievement.service';
import { VerifiedAchievement } from './verifiedAchievement.model';
import { User } from '../users/user.model';
import { logger } from '../../utils/logger';
import { socketService } from '../realtime/socket';

// Helper to notify frontend to reload achievements
const refreshAchievements = (userId: string) => {
  try {
    socketService.toUser(userId, 'refresh_data', { domain: 'achievements' });
    socketService.toUser(userId, 'refresh_data', { domain: 'dashboard' });
  } catch (error) {
    logger.error(`Failed to refresh achievements data for user ${userId}:`, error);
  }
};

// 1. Listen for ROADMAP_COMPLETED
eventEmitter.on('ROADMAP_COMPLETED', async (payload: {
  roadmapId: string;
  userId: string;
  title: string;
}) => {
  try {
    const { roadmapId, userId, title } = payload;

    // Check if the user already has a certificate for this roadmap
    const existing = await VerifiedAchievement.findOne({
      userId,
      category: 'roadmap_completion',
      'metadata.roadmapId': roadmapId,
    });

    if (existing) {
      logger.info(`Achievement already exists for roadmap ${roadmapId} completed by user ${userId}`);
      return;
    }

    // Issue certificate
    await achievementService.issueAchievement(userId, {
      type: 'certificate',
      category: 'roadmap_completion',
      title: `Roadmap Certified: ${title}`,
      description: `Successfully completed all required learning blocks and projects in the "${title}" pathway.`,
      metadata: { roadmapId, completedAt: new Date() },
    });

    refreshAchievements(userId);
  } catch (err) {
    logger.error('Error auto-issuing roadmap completion certificate:', err);
  }
});

// 2. Listen for SESSION_COMPLETED
eventEmitter.on('SESSION_COMPLETED', async (payload: {
  sessionId: string;
  clientId: string;
  guideId: string;
  title: string;
}) => {
  try {
    const { clientId } = payload;
    if (!clientId) return;

    // Fetch user to count sessions
    const user = await User.findById(clientId);
    if (!user) return;

    const totalSessions = user.totalSessions || 0;

    // Define milestones
    const milestones = [
      {
        count: 1,
        title: 'First Step in Guidance',
        description: 'Completed your first verified mentorship session on AscendPath.',
      },
      {
        count: 5,
        title: 'Mentorship Growth Milestone',
        description: 'Successfully attended 5 verified mentor guidance sessions.',
      },
      {
        count: 10,
        title: 'Mentorship Champion Milestone',
        description: 'Consistently completed 10 verified mentor sessions to guide your career path.',
      },
    ];

    for (const milestone of milestones) {
      if (totalSessions >= milestone.count) {
        // Check if this badge has already been issued
        const existing = await VerifiedAchievement.findOne({
          userId: clientId,
          category: 'mentorship_milestone',
          title: milestone.title,
        });

        if (!existing) {
          await achievementService.issueAchievement(clientId, {
            type: 'badge',
            category: 'mentorship_milestone',
            title: milestone.title,
            description: milestone.description,
            metadata: { milestoneSessionCount: milestone.count },
          });

          refreshAchievements(clientId);
        }
      }
    }
  } catch (err) {
    logger.error('Error auto-issuing session completion milestone badge:', err);
  }
});

logger.info('🏆 [AchievementListener] Verified achievement milestones automated subscribers registered');
