import { Report, IReport, ReportStatus, TargetType, ReportReason } from './report.model';
import { AuditLog, IAuditLog, AuditAction } from './auditLog.model';

export const reportRepository = {
  async createReport(data: {
    reporterId: string;
    targetType: TargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
  }): Promise<IReport> {
    const report = new Report(data);
    return await report.save();
  },

  async getPendingReports(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const reports = await Report.find({ status: ReportStatus.PENDING })
      .populate('reporterId', 'name email role')
      .sort({ createdAt: 1 }) // Oldest first
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ status: ReportStatus.PENDING });

    return {
      reports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total,
    };
  },

  async getReportById(reportId: string): Promise<IReport | null> {
    return await Report.findById(reportId);
  },

  async updateReportStatus(reportId: string, status: ReportStatus, resolvedBy: string): Promise<IReport | null> {
    return await Report.findByIdAndUpdate(
      reportId,
      { status, resolvedBy: resolvedBy as any },
      { new: true }
    );
  },

  async createAuditLog(
    actorId: string,
    action: AuditAction,
    targetId: string,
    details: string
  ): Promise<IAuditLog> {
    const log = new AuditLog({
      actorId: actorId as any,
      action,
      targetId: targetId as any,
      details,
    });
    return await log.save();
  },
};
