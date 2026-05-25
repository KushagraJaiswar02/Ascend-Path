import crypto from 'crypto';
import mongoose from 'mongoose';
import { achievementRepository } from './achievement.repository';
import { IVerifiedAchievement, VerifiedAchievementCategory } from './verifiedAchievement.model';
import { careerCompanionService } from '../companion/careerCompanion.service';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';

export const achievementService = {
  async getAchievementsByUser(userId: string): Promise<IVerifiedAchievement[]> {
    return await achievementRepository.findAchievementsByUserId(userId);
  },

  async verifyCredential(credentialId: string): Promise<IVerifiedAchievement | null> {
    return await achievementRepository.findAchievementByCredentialId(credentialId);
  },

  async issueAchievement(
    userId: string,
    data: {
      type: 'certificate' | 'badge';
      category: VerifiedAchievementCategory;
      title: string;
      description: string;
      metadata?: any;
    }
  ): Promise<IVerifiedAchievement> {
    const salt = crypto.randomBytes(4).toString('hex');
    const credentialId = crypto
      .createHash('sha256')
      .update(`${userId}-${data.category}-${Date.now()}-${salt}`)
      .digest('hex')
      .slice(0, 16)
      .toUpperCase();

    const achievement = await achievementRepository.createAchievement({
      ...data,
      userId: new mongoose.Types.ObjectId(userId),
      credentialId,
    });

    // Log achievement in the Career Companion Timeline
    await careerCompanionService.recordTimelineEvent(userId, {
      type: 'achievement',
      title: `Earned Credential: ${achievement.title}`,
      summary: `Awarded a verified ${achievement.type} for ${achievement.description}`,
      entityId: achievement._id.toString(),
      entityType: 'VerifiedAchievement',
      visibility: 'mentor_summary',
    }).catch(() => null);

    // Send contextual notification
    await notificationService.createNotification({
      recipientId: userId,
      type: NotificationType.SESSION_ACCEPTED, // fallback type
      title: `Credential Unlocked: ${achievement.title}`,
      message: `Congratulations! You earned a verified ${achievement.type}: "${achievement.title}".`,
      entityId: achievement._id.toString(),
      entityType: 'VerifiedAchievement',
    }).catch(() => null);

    return achievement;
  },
};
