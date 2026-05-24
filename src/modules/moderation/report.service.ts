import mongoose from 'mongoose';
import { reportRepository, ReportListFilters } from './report.repository';
import { Report, ModeratorDecision, ReportPriority, ReportReason, ReportStatus, TargetType, IReport } from './report.model';
import { AuditAction, AuditSeverity } from './auditLog.model';
import { userRepository } from '../users/user.repository';
import { User } from '../users/user.model';
import { Session } from '../sessions/session.model';
import { Post } from '../posts/post.model';
import { Reply } from '../posts/reply.model';
import { postService } from '../posts/post.service';
import { Review } from '../reviews/review.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { eventEmitter } from '../../utils/eventEmitter';

const highRiskReasons = new Set<ReportReason>([
  ReportReason.HARASSMENT,
  ReportReason.ABUSE,
  ReportReason.FAKE_MENTOR,
  ReportReason.MISINFORMATION,
]);

const inferPriority = (reason: ReportReason, requestedPriority?: ReportPriority) => {
  if (requestedPriority) return requestedPriority;
  return highRiskReasons.has(reason) ? ReportPriority.HIGH : ReportPriority.MEDIUM;
};

async function getTargetOwner(targetType: TargetType, targetId: string): Promise<string | null> {
  try {
    if (targetType === TargetType.POST) {
      const doc = await Post.findById(targetId) as any;
      return doc?.authorId?.toString() || null;
    }
    if (targetType === TargetType.REPLY) {
      const doc = await Reply.findById(targetId) as any;
      return doc?.authorId?.toString() || null;
    }
    if (targetType === TargetType.ROADMAP) {
      const doc = await CareerRoadmap.findById(targetId) as any;
      return doc?.curatorId?.toString() || doc?.createdBy?.toString() || null;
    }
    if (targetType === TargetType.SESSION) {
      const doc = await Session.findById(targetId) as any;
      return doc?.mentorId?.toString() || doc?.menteeId?.toString() || doc?.guideId?.toString() || doc?.explorerId?.toString() || null;
    }
    if (targetType === TargetType.USER || targetType === TargetType.GUIDE_PROFILE) {
      const doc = await User.findById(targetId) as any;
      return doc?._id?.toString() || null;
    }
    if (targetType === TargetType.REVIEW) {
      const doc = await Review.findById(targetId) as any;
      return doc?.authorId?.toString() || doc?.reviewerId?.toString() || null;
    }
  } catch (error) {
    console.error('Error fetching target owner:', error);
  }
  return null;
}

export const reportService = {
  async submitReport(data: {
    reporterId: string;
    targetType: TargetType;
    targetId: string;
    reasonCategory: ReportReason;
    detailedReason: string;
    evidenceLinks?: string[];
    screenshots?: string[];
    priority?: ReportPriority;

    // Backwards compatibility params
    reason?: ReportReason;
    details?: string;
    description?: string;
  }) {
    const finalReason = data.reasonCategory || data.reason || ReportReason.OTHER;
    const finalDetailedReason = data.detailedReason || data.details || data.description || '';

    // 1. Self-reporting check
    const ownerId = await getTargetOwner(data.targetType, data.targetId);
    if (ownerId && ownerId === data.reporterId) {
      throw new Error('Self-reporting is not allowed. You cannot report your own content or profile.');
    }

    // 2. Duplicate-report check
    const existingReport = await Report.findOne({
      reporterId: data.reporterId,
      targetId: data.targetId,
      targetType: data.targetType,
      status: ReportStatus.PENDING,
    });
    if (existingReport) {
      throw new Error('You have already submitted a pending report for this item.');
    }

    // 3. Cooldown check
    const lastReport = await Report.findOne({ reporterId: data.reporterId }).sort({ createdAt: -1 });
    if (lastReport) {
      const timeSinceLast = Date.now() - new Date(lastReport.createdAt).getTime();
      const cooldownMs = 30 * 1000; // 30 seconds
      if (timeSinceLast < cooldownMs) {
        const secondsLeft = Math.ceil((cooldownMs - timeSinceLast) / 1000);
        throw new Error(`Please wait ${secondsLeft} seconds before submitting another report.`);
      }
    }

    const metadata: Record<string, any> = {};
    if (data.targetType === TargetType.REPLY) {
      const reply = await Reply.findById(data.targetId) as any;
      if (reply) {
        metadata.postId = reply.postId?.toString() || '';
      }
    }

    // Save report
    const report = new Report({
      reporterId: data.reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: finalReason,
      reasonCategory: finalReason,
      detailedReason: finalDetailedReason,
      details: finalDetailedReason,
      description: finalDetailedReason,
      evidenceLinks: data.evidenceLinks || [],
      screenshots: data.screenshots || [],
      priority: inferPriority(finalReason, data.priority),
      status: ReportStatus.PENDING,
      moderatorDecision: ModeratorDecision.PENDING,
      metadata,
    });

    const saved = await report.save();

    // Trigger system realtime / notification listeners
    eventEmitter.emit('REPORT_SUBMITTED', { report: saved });

    return saved;
  },

  async listReports(filters: ReportListFilters, page: number, limit: number) {
    return await reportRepository.listReports(filters, page, limit);
  },

  async getMyReports(reporterId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Report.find({ reporterId })
        .populate('assignedModerator', 'name email role avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments({ reporterId }),
    ]);

    return {
      reports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total,
    };
  },

  async getReportById(reportId: string) {
    const report = await reportRepository.getReportById(reportId);
    if (!report) throw new Error('Report not found');
    return report;
  },

  async assignReport(reportId: string, moderatorId: string, actorId: string) {
    const report = await this.getReportById(reportId);
    const updated = await reportRepository.updateReport(reportId, {
      status: ReportStatus.ASSIGNED,
      assignedModerator: moderatorId as any,
    });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.REPORT_ASSIGN,
      targetId: report.targetId.toString(),
      targetType: report.targetType,
      details: `Assigned report ${reportId}`,
      metadata: { reportId, moderatorId },
    });

    return updated;
  },

  async actionReport(
    reportId: string,
    status: ReportStatus,
    actorId: string,
    resolution?: string,
    moderatorDecision?: ModeratorDecision,
    falseReportStrike?: boolean,
    moderatorNotes?: string
  ) {
    const report = await this.getReportById(reportId);

    let finalStatus = status;
    let finalDecision = moderatorDecision || ModeratorDecision.PENDING;

    if (finalDecision === ModeratorDecision.FALSE_REPORT || falseReportStrike) {
      finalStatus = ReportStatus.DISMISSED;
      finalDecision = ModeratorDecision.FALSE_REPORT;
    } else if (finalDecision === ModeratorDecision.DISMISSED) {
      finalStatus = ReportStatus.DISMISSED;
    } else if (finalDecision === ModeratorDecision.ACTION_TAKEN) {
      finalStatus = ReportStatus.ACTIONED;
    } else if (finalDecision === ModeratorDecision.UNDER_REVIEW) {
      finalStatus = ReportStatus.ASSIGNED;
    }

    const updatedData: Partial<IReport> = {
      status: finalStatus,
      moderatorDecision: finalDecision,
      moderatorNotes: moderatorNotes || report.moderatorNotes,
      resolvedBy: actorId as any,
      resolution: resolution || report.resolution,
      resolvedAt: new Date(),
      reviewedBy: actorId as any,
      reviewedAt: new Date(),
    };

    if (finalDecision === ModeratorDecision.FALSE_REPORT || falseReportStrike) {
      updatedData.falseReportStrike = true;
    }

    const updated = await reportRepository.updateReport(reportId, updatedData);

    // Apply False Report Strike Penalty
    if (finalDecision === ModeratorDecision.FALSE_REPORT || falseReportStrike) {
      const reporterUser = await User.findById(report.reporterId);
      if (reporterUser) {
        reporterUser.falseReportStrikes = (reporterUser.falseReportStrikes || 0) + 1;
        reporterUser.isSuspended = true;
        reporterUser.suspensionReason = 'Malicious / fake reporting (strike applied)';
        reporterUser.suspensionSource = 'Moderation System';
        reporterUser.suspendedUntil = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 48 hours

        await reporterUser.save();

        // Emit realtime/notification events
        eventEmitter.emit('FALSE_REPORT_PENALTY_APPLIED', {
          userId: reporterUser._id,
          reportId: report._id,
          suspendedUntil: reporterUser.suspendedUntil,
        });

        eventEmitter.emit('USER_SUSPENDED', {
          userId: reporterUser._id,
          reason: 'Malicious / fake reporting (strike applied)',
          suspendedUntil: reporterUser.suspendedUntil,
        });

        // Audit Logging
        await reportRepository.createAuditLog({
          actorId,
          action: AuditAction.SUSPEND,
          targetId: reporterUser._id.toString(),
          targetType: 'user',
          details: `Suspended user ${reporterUser._id} for 2 days due to malicious false reporting on report ${reportId}`,
          metadata: { reportId, reporterId: reporterUser._id, suspendedUntil: reporterUser.suspendedUntil },
          severity: AuditSeverity.CRITICAL,
        });
      }
    }

    const action = finalStatus === ReportStatus.DISMISSED ? AuditAction.REPORT_DISMISS : AuditAction.REPORT_RESOLVE;
    await reportRepository.createAuditLog({
      actorId,
      action,
      targetId: report.targetId.toString(),
      targetType: report.targetType,
      details: resolution || `Report ${reportId} resolved as ${finalDecision}`,
      metadata: { reportId, status: finalStatus, moderatorDecision: finalDecision },
      severity: finalDecision === ModeratorDecision.FALSE_REPORT ? AuditSeverity.WARNING : AuditSeverity.INFO,
    });

    eventEmitter.emit('REPORT_REVIEWED', {
      reportId: report._id.toString(),
      reporterId: report.reporterId.toString(),
      moderatorId: actorId,
      status: finalStatus,
      moderatorDecision: finalDecision,
      targetType: report.targetType,
      targetId: report.targetId.toString(),
    });

    return updated;
  },

  async reviewReport(reportId: string, actorId: string, notes?: string) {
    const report = await this.getReportById(reportId);
    const updated = await reportRepository.updateReport(reportId, {
      status: ReportStatus.ASSIGNED,
      moderatorDecision: ModeratorDecision.UNDER_REVIEW,
      moderatorNotes: notes || report.moderatorNotes,
      assignedModerator: actorId as any,
    });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.REPORT_RESOLVE,
      targetId: report.targetId.toString(),
      targetType: report.targetType,
      details: `Moved report ${reportId} under review`,
      metadata: { reportId },
    });

    return updated;
  },

  async escalateReport(reportId: string, actorId: string, notes?: string) {
    const report = await this.getReportById(reportId);
    const updated = await reportRepository.updateReport(reportId, {
      moderatorDecision: ModeratorDecision.ESCALATED,
      priority: ReportPriority.CRITICAL,
      moderatorNotes: notes || report.moderatorNotes,
    });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.REPORT_RESOLVE,
      targetId: report.targetId.toString(),
      targetType: report.targetType,
      details: `Escalated report ${reportId} to critical priority`,
      metadata: { reportId },
      severity: AuditSeverity.WARNING,
    });

    return updated;
  },

  async addModeratorNote(reportId: string, actorId: string, note: string) {
    const report = await this.getReportById(reportId);
    const updated = await reportRepository.updateReport(reportId, { moderatorNotes: note });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.REPORT_RESOLVE,
      targetId: report.targetId.toString(),
      targetType: report.targetType,
      details: `Updated moderator notes for report ${reportId}`,
      metadata: { reportId },
    });

    return updated;
  },

  async warnUser(userId: string, reason: string, actorId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.WARN,
      targetId: userId,
      targetType: TargetType.USER,
      details: `Warned for: ${reason}`,
      severity: AuditSeverity.WARNING,
    });

    eventEmitter.emit('WARNING_ISSUED', { userId, reason, type: 'warning' });
    return { success: true };
  },

  async muteUser(userId: string, hours: number, actorId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    const mutedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    await userRepository.updateUser(userId, { mutedUntil });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.MUTE,
      targetId: userId,
      targetType: TargetType.USER,
      details: `Muted for ${hours} hours`,
      metadata: { hours, mutedUntil },
      severity: AuditSeverity.WARNING,
    });

    eventEmitter.emit('WARNING_ISSUED', {
      userId,
      reason: `Temporary mute issued for ${hours} hours.`,
      type: 'mute',
    });
    return { success: true, mutedUntil };
  },

  async suspendUser(userId: string, days: number, actorId: string, reason: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    const suspendedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    await userRepository.updateUser(userId, {
      suspendedUntil,
      isSuspended: true,
      suspensionReason: reason,
      suspensionSource: 'Moderator Action',
    });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.SUSPEND,
      targetId: userId,
      targetType: TargetType.USER,
      details: `Suspended for ${days} days`,
      metadata: { days, suspendedUntil, reason },
      severity: AuditSeverity.CRITICAL,
    });

    eventEmitter.emit('USER_SUSPENDED', {
      userId,
      reason,
      suspendedUntil,
    });

    return { success: true, suspendedUntil };
  },

  async adjustReputation(userId: string, delta: number, actorId: string, reason: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    await userRepository.updateUser(userId, {
      respectPoints: Math.max(0, user.respectPoints + delta),
      fameScore: Math.max(0, user.fameScore + delta),
    });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.REPUTATION_ADJUST,
      targetId: userId,
      targetType: TargetType.USER,
      details: `Adjusted reputation by ${delta}`,
      metadata: { delta, reason },
      severity: AuditSeverity.WARNING,
    });

    return { success: true };
  },

  async hideContent(targetType: TargetType, targetId: string, actorId: string, reason: string) {
    const update = { moderationStatus: 'hidden', hiddenAt: new Date() };
    const targetDoc = await this.updateModeratedTarget(targetType, targetId, update) as any;

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.HIDE_CONTENT,
      targetId,
      targetType,
      details: `Hid ${targetType}`,
      metadata: { reason },
      severity: AuditSeverity.WARNING,
    });

    // Automatically resolve all pending reports for this target
    const pendingReports = await Report.find({
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
      status: ReportStatus.PENDING,
    });

    for (const rep of pendingReports) {
      await this.actionReport(
        rep._id.toString(),
        ReportStatus.ACTIONED,
        actorId,
        reason || 'Content hidden by moderation',
        ModeratorDecision.ACTION_TAKEN,
        false,
        reason
      );
    }

    // Give a strike notification to the author
    const authorId = await getTargetOwner(targetType, targetId);
    if (authorId) {
      eventEmitter.emit('WARNING_ISSUED', {
        userId: authorId,
        reason: reason || `Your ${targetType} was hidden by moderation for violating community standards.`,
        type: 'warning',
      });
    }

    return { success: true };
  },

  async softDeleteContent(targetType: TargetType, targetId: string, actorId: string, reason: string) {
    const update = { moderationStatus: 'deleted', deletedAt: new Date() };
    const targetDoc = await this.updateModeratedTarget(targetType, targetId, update) as any;

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.CONTENT_DELETE,
      targetId,
      targetType,
      details: `Soft deleted ${targetType}`,
      metadata: { reason },
      severity: AuditSeverity.CRITICAL,
    });

    // Automatically resolve all pending reports for this target
    const pendingReports = await Report.find({
      targetId: new mongoose.Types.ObjectId(targetId),
      targetType,
      status: ReportStatus.PENDING,
    });

    for (const rep of pendingReports) {
      await this.actionReport(
        rep._id.toString(),
        ReportStatus.ACTIONED,
        actorId,
        reason || 'Content deleted by moderation',
        ModeratorDecision.ACTION_TAKEN,
        false,
        reason
      );
    }

    // Give a strike notification to the author
    const authorId = await getTargetOwner(targetType, targetId);
    if (authorId) {
      eventEmitter.emit('WARNING_ISSUED', {
        userId: authorId,
        reason: reason || `Your ${targetType} was removed by moderation for violating community standards.`,
        type: 'warning',
      });
    }

    return { success: true };
  },

  async overrideAcceptedAnswer(postId: string, replyId: string, actorId: string, reason: string) {
    const post = await postService.acceptAnswer(actorId, postId, replyId, {
      moderatorOverride: true,
      reason,
    });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.ACCEPT_ANSWER_OVERRIDE,
      targetId: postId,
      targetType: TargetType.POST,
      details: 'Moderator overrode accepted answer',
      metadata: { postId, replyId, reason },
      severity: AuditSeverity.WARNING,
    });

    return { success: true, post };
  },

  async clearAcceptedAnswer(postId: string, actorId: string, reason: string) {
    const post = await postService.unacceptAnswer(actorId, postId, {
      moderatorOverride: true,
      reason,
    });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.CLEAR_ACCEPTED_ANSWER,
      targetId: postId,
      targetType: TargetType.POST,
      details: 'Moderator removed accepted answer and solved status',
      metadata: { postId, reason },
      severity: AuditSeverity.WARNING,
    });

    return { success: true, post };
  },

  async bulkAction(actorId: string, reportIds: string[], action: 'assign' | 'dismiss' | 'resolve', payload: any) {
    const session = await mongoose.startSession();
    const results: unknown[] = [];

    try {
      await session.withTransaction(async () => {
        for (const reportId of reportIds) {
          if (action === 'assign') {
            results.push(await this.assignReport(reportId, payload.moderatorId || actorId, actorId));
          } else {
            const status = action === 'dismiss' ? ReportStatus.DISMISSED : ReportStatus.REVIEWED;
            results.push(await this.actionReport(reportId, status, actorId, payload.resolution));
          }
        }
      });
    } finally {
      await session.endSession();
    }

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.BULK_ACTION,
      targetId: reportIds[0],
      targetType: 'report',
      details: `Bulk ${action} applied to ${reportIds.length} reports`,
      metadata: { reportIds, action, payload },
      severity: AuditSeverity.WARNING,
    });

    return { success: true, count: results.length };
  },

  async updateModeratedTarget(targetType: TargetType, targetId: string, update: Record<string, unknown>) {
    if (targetType === TargetType.POST) return await Post.findByIdAndUpdate(targetId, update, { new: true });
    if (targetType === TargetType.REPLY) return await Reply.findByIdAndUpdate(targetId, update, { new: true });
    if (targetType === TargetType.REVIEW) {
      const reviewUpdate =
        update.moderationStatus === 'hidden'
          ? { moderationStatus: 'hidden', flagReason: 'Hidden by moderation' }
          : { moderationStatus: 'hidden', flagReason: 'Deleted by moderation' };
      return await Review.findByIdAndUpdate(targetId, reviewUpdate, { new: true });
    }
    if (targetType === TargetType.ROADMAP) return await CareerRoadmap.findByIdAndUpdate(targetId, update, { new: true });
    if (targetType === TargetType.GUIDE_PROFILE || targetType === TargetType.USER) {
      return await userRepository.updateUser(targetId, { profileVisibility: false });
    }

    throw new Error(`Unsupported moderation target: ${targetType}`);
  },
};
