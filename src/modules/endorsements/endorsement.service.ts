import mongoose from 'mongoose';
import { endorsementRepository } from './endorsement.repository';
import { IEndorsement, EndorsementType } from './endorsement.model';
import { User } from '../users/user.model';
import { careerCompanionService } from '../companion/careerCompanion.service';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';

export const endorsementService = {
  async createEndorsement(
    endorserId: string,
    data: {
      recipientId: string;
      type: EndorsementType;
      skillName?: string;
      roadmapId?: string;
      projectId?: string;
      message: string;
    }
  ): Promise<IEndorsement> {
    // Validate endorser is a mentor or admin — no peer-boosting allowed
    const endorser = await User.findById(endorserId).lean();
    if (!endorser) throw { statusCode: 404, message: 'Endorser not found' };
    if (!['guide', 'admin', 'super_admin'].includes(endorser.role)) {
      throw { statusCode: 403, message: 'Only mentors and admins can issue endorsements' };
    }

    // Validate recipient exists
    const recipient = await User.findById(data.recipientId).lean();
    if (!recipient) throw { statusCode: 404, message: 'Recipient user not found' };

    // Prevent self-endorsement
    if (endorserId === data.recipientId) {
      throw { statusCode: 400, message: 'Cannot endorse yourself' };
    }

    // Prevent duplicate endorsements from the same mentor to the same learner
    const alreadyEndorsed = await endorsementRepository.existsEndorsement(endorserId, data.recipientId);
    if (alreadyEndorsed) {
      throw {
        statusCode: 409,
        message: 'You have already endorsed this learner. Only one endorsement per mentor–learner pair is allowed.',
      };
    }

    const endorsement = await endorsementRepository.createEndorsement({
      endorserId: new mongoose.Types.ObjectId(endorserId) as any,
      recipientId: new mongoose.Types.ObjectId(data.recipientId) as any,
      type: data.type,
      skillName: data.skillName,
      roadmapId: data.roadmapId ? (new mongoose.Types.ObjectId(data.roadmapId) as any) : undefined,
      projectId: data.projectId ? (new mongoose.Types.ObjectId(data.projectId) as any) : undefined,
      message: data.message,
      moderationStatus: 'approved',
    });

    // Log to Career Companion Timeline
    await careerCompanionService
      .recordTimelineEvent(data.recipientId, {
        type: 'achievement',
        title: `Mentor Endorsement Received`,
        summary: `${endorser.name} endorsed you: "${data.message.slice(0, 120)}"`,
        entityId: endorsement._id.toString(),
        entityType: 'Endorsement',
        visibility: 'mentor_summary',
      })
      .catch(() => null);

    // Notify the recipient
    await notificationService
      .createNotification({
        recipientId: data.recipientId,
        type: NotificationType.SESSION_ACCEPTED, // using available type as fallback
        title: 'You received a mentor endorsement!',
        message: `${endorser.name} has endorsed you with a ${data.type} endorsement.`,
        entityId: endorsement._id.toString(),
        entityType: 'Endorsement',
      })
      .catch(() => null);

    return endorsement;
  },

  async getEndorsementsForUser(userId: string): Promise<IEndorsement[]> {
    return await endorsementRepository.findEndorsementsByRecipient(userId);
  },

  async getMyIssuedEndorsements(endorserId: string): Promise<IEndorsement[]> {
    return await endorsementRepository.findEndorsementsByEndorser(endorserId);
  },

  async moderateEndorsement(
    adminId: string,
    endorsementId: string,
    status: 'approved' | 'flagged' | 'hidden'
  ): Promise<IEndorsement> {
    const admin = await User.findById(adminId).lean();
    if (!admin || !['admin', 'super_admin', 'moderator'].includes(admin.role)) {
      throw { statusCode: 403, message: 'Only admins and moderators can moderate endorsements' };
    }
    const updated = await endorsementRepository.updateModerationStatus(endorsementId, status);
    if (!updated) throw { statusCode: 404, message: 'Endorsement not found' };
    return updated;
  },
};
