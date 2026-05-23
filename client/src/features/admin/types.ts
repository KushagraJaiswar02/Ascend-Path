export interface PlatformOverview {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  totalGuides: number;
  verifiedGuides: number;
  bannedUsers: number;
  suspendedUsers: number;
  totalPosts: number;
  totalSessions: number;
  pendingReports: number;
  totalRoadmaps: number;
}

export interface GrowthDataPoint {
  date: string;
  count: number;
}

export interface TopMentor {
  _id: string;
  name: string;
  avatar?: string;
  domains: string[];
  averageRating: number;
  totalSessions: number;
  totalReviews: number;
  fameScore: number;
}

export interface EngagementMetrics {
  postsCreated: number;
  sessionsBooked: number;
  reviewsWritten: number;
  postsDelta: number;
  sessionsDelta: number;
  reviewsDelta: number;
}

export interface ModerationWorkload {
  pending: number;
  assigned: number;
  resolvedLastWeek: number;
  avgResolutionTimeMs: number;
}

export interface PlatformHealth {
  banRate: number;
  suspensionRate: number;
  averageGuideRating: number;
  reportConversionRate: number;
  hiddenContentCount: number;
}

export interface RetentionMetrics {
  last7: number;
  last30: number;
  last90: number;
  total: number;
}

export type ReportStatus = 'pending' | 'assigned' | 'reviewed' | 'actioned' | 'dismissed';
export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type TargetType = 'post' | 'reply' | 'user' | 'review' | 'roadmap' | 'guide_profile';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'misinformation'
  | 'inappropriate'
  | 'abuse'
  | 'fake_mentor'
  | 'plagiarism'
  | 'low_quality'
  | 'other';

export interface Report {
  _id: string;
  reporterId: { _id: string; name: string; email: string; avatar?: string };
  targetType: TargetType;
  targetId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  priority: ReportPriority;
  assignedModerator?: { _id: string; name: string; avatar?: string };
  resolvedBy?: { _id: string; name: string };
  resolution?: string;
  moderatorNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AuditAction =
  | 'warn'
  | 'mute'
  | 'unmute'
  | 'ban'
  | 'unban'
  | 'suspend'
  | 'unsuspend'
  | 'role_change'
  | 'reputation_adjust'
  | 'delete_post'
  | 'hide_content'
  | 'unhide_content'
  | 'content_delete'
  | 'verify_guide'
  | 'unverify_guide'
  | 'report_resolve'
  | 'report_dismiss'
  | 'report_assign'
  | 'bulk_action';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLog {
  _id: string;
  actorId: { _id: string; name: string; email: string; role: string; avatar?: string };
  action: AuditAction;
  targetId: string;
  targetType: string;
  details: string;
  metadata?: Record<string, unknown>;
  severity: AuditSeverity;
  createdAt: string;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  fameScore: number;
  respectPoints: number;
  isBanned: boolean;
  suspendedUntil?: string;
  reportCount: number;
  totalSessions: number;
  averageRating: number;
  isVerified: boolean;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUser {
  bio?: string;
  domains: string[];
  avatar?: string;
  moderatorNotes?: string;
  reportsAgainst: Report[];
  auditHistory: AuditLog[];
}

export interface ReportStats {
  total: number;
  pending: number;
  assigned: number;
  actioned: number;
  dismissed: number;
  critical: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  total: number;
}
