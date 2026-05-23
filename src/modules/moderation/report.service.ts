import mongoose from 'mongoose';
import { reportRepository, ReportListFilters } from './report.repository';
import { ReportPriority, ReportReason, ReportStatus, TargetType } from './report.model';
import { AuditAction, AuditSeverity } from './auditLog.model';
import { userRepository } from '../users/user.repository';
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

export const reportService = {
  async submitReport(data: {
    reporterId: string;
    targetType: TargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
    description?: string;
    priority?: ReportPriority;
  }) {
    return await reportRepository.createReport({
      ...data,
      priority: inferPriority(data.reason, data.priority),
    });
  },

  async listReports(filters: ReportListFilters, page: number, limit: number) {
    return await reportRepository.listReports(filters, page, limit);
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

  async actionReport(reportId: string, status: ReportStatus, actorId: string, resolution?: string) {
    const report = await this.getReportById(reportId);
    const updated = await reportRepository.updateReport(reportId, {
      status,
      resolvedBy: actorId as any,
      resolution,
      resolvedAt: [ReportStatus.ACTIONED, ReportStatus.DISMISSED, ReportStatus.REVIEWED].includes(status)
        ? new Date()
        : undefined,
    });

    const action = status === ReportStatus.DISMISSED ? AuditAction.REPORT_DISMISS : AuditAction.REPORT_RESOLVE;
    await reportRepository.createAuditLog({
      actorId,
      action,
      targetId: report.targetId.toString(),
      targetType: report.targetType,
      details: resolution || `Report ${reportId} moved to ${status}`,
      metadata: { reportId, status },
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
    await userRepository.updateUser(userId, { suspendedUntil, moderatorNotes: reason });

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.SUSPEND,
      targetId: userId,
      targetType: TargetType.USER,
      details: `Suspended for ${days} days`,
      metadata: { days, suspendedUntil, reason },
      severity: AuditSeverity.CRITICAL,
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
    await this.updateModeratedTarget(targetType, targetId, update);

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.HIDE_CONTENT,
      targetId,
      targetType,
      details: `Hid ${targetType}`,
      metadata: { reason },
      severity: AuditSeverity.WARNING,
    });

    return { success: true };
  },

  async softDeleteContent(targetType: TargetType, targetId: string, actorId: string, reason: string) {
    const update = { moderationStatus: 'deleted', deletedAt: new Date() };
    await this.updateModeratedTarget(targetType, targetId, update);

    await reportRepository.createAuditLog({
      actorId,
      action: AuditAction.CONTENT_DELETE,
      targetId,
      targetType,
      details: `Soft deleted ${targetType}`,
      metadata: { reason },
      severity: AuditSeverity.CRITICAL,
    });

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
