import { AuditAction, AuditLog, AuditSeverity, IAuditLog } from './auditLog.model';
import { IReport, Report, ReportPriority, ReportReason, ReportStatus, TargetType } from './report.model';

export interface ReportListFilters {
  status?: ReportStatus;
  priority?: ReportPriority;
  targetType?: TargetType;
  reason?: ReportReason;
  assignedModerator?: string;
}

export const reportRepository = {
  async createReport(data: {
    reporterId: string;
    targetType: TargetType;
    targetId: string;
    reason: ReportReason;
    details?: string;
    description?: string;
    priority?: ReportPriority;
  }): Promise<IReport> {
    const report = new Report(data);
    return await report.save();
  },

  async listReports(filters: ReportListFilters, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.targetType) query.targetType = filters.targetType;
    if (filters.reason) query.reason = filters.reason;
    if (filters.assignedModerator) query.assignedModerator = filters.assignedModerator;

    const [reports, total] = await Promise.all([
      Report.find(query)
        .populate('reporterId', 'name email role avatar')
        .populate('assignedModerator', 'name email role avatar')
        .populate('resolvedBy', 'name email role avatar')
        .sort({ priority: -1, createdAt: 1 })
        .skip(skip)
        .limit(limit),
      Report.countDocuments(query),
    ]);

    return {
      reports,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalReports: total,
    };
  },

  async getPendingReports(page: number, limit: number) {
    return await this.listReports({ status: ReportStatus.PENDING }, page, limit);
  },

  async getReportById(reportId: string): Promise<IReport | null> {
    return await Report.findById(reportId)
      .populate('reporterId', 'name email role avatar')
      .populate('assignedModerator', 'name email role avatar')
      .populate('resolvedBy', 'name email role avatar');
  },

  async updateReport(reportId: string, updateData: Partial<IReport>): Promise<IReport | null> {
    return await Report.findByIdAndUpdate(reportId, updateData, { new: true, runValidators: true });
  },

  async updateReportStatus(reportId: string, status: ReportStatus, resolvedBy: string): Promise<IReport | null> {
    const updateData: Partial<IReport> = { status, resolvedBy: resolvedBy as any };
    if ([ReportStatus.ACTIONED, ReportStatus.DISMISSED, ReportStatus.REVIEWED].includes(status)) {
      updateData.resolvedAt = new Date();
    }

    return await this.updateReport(reportId, updateData);
  },

  async createAuditLog(data: {
    actorId: string;
    action: AuditAction;
    targetId: string;
    targetType: string;
    details: string;
    metadata?: Record<string, unknown>;
    severity?: AuditSeverity;
  }): Promise<IAuditLog> {
    const log = new AuditLog({
      actorId: data.actorId as any,
      action: data.action,
      targetId: data.targetId as any,
      targetType: data.targetType,
      details: data.details,
      metadata: data.metadata || {},
      severity: data.severity || AuditSeverity.INFO,
    });
    return await log.save();
  },

  async listAuditLogs(page: number, limit: number, filters: { action?: AuditAction; targetType?: string }) {
    const skip = (page - 1) * limit;
    const query: any = {};
    if (filters.action) query.action = filters.action;
    if (filters.targetType) query.targetType = filters.targetType;

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('actorId', 'name email role avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AuditLog.countDocuments(query),
    ]);

    return {
      logs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
    };
  },
};
