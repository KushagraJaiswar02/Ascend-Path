import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { reportRepository } from '../moderation/report.repository';
import { AuditAction } from '../moderation/auditLog.model';
import { Post } from '../posts/post.model';
import { Session } from '../sessions/session.model';
import { Report, ReportStatus } from '../moderation/report.model';

export const adminService = {
  async assignRole(userId: string, role: Role, architectId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    await userRepository.updateUser(userId, { role });

    await reportRepository.createAuditLog(
      architectId,
      AuditAction.ROLE_CHANGE,
      userId,
      `Changed role to ${role}`
    );

    return { success: true, message: `Role ${role} assigned to user` };
  },

  async verifyGuide(userId: string, architectId: string) {
    return await this.assignRole(userId, Role.GUIDE, architectId);
  },

  async banUser(userId: string, architectId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (user.role === Role.ARCHITECT) {
      throw new Error('Cannot ban an Architect');
    }

    await userRepository.updateUser(userId, { isBanned: true });

    await reportRepository.createAuditLog(
      architectId,
      AuditAction.BAN,
      userId,
      `Permanently banned user`
    );

    return { success: true, message: 'User banned successfully' };
  },

  async unbanUser(userId: string, architectId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    await userRepository.updateUser(userId, { isBanned: false });

    await reportRepository.createAuditLog(
      architectId,
      AuditAction.UNBAN,
      userId,
      `Unbanned user`
    );

    return { success: true, message: 'User unbanned successfully' };
  },

  async getPlatformStats() {
    // Simplified stats for dashboard
    const [totalUsers, totalPosts, totalSessions, pendingReports] = await Promise.all([
      userRepository.countUsers(), // Assumes this exists or I will add it
      Post.countDocuments(),
      Session.countDocuments(),
      Report.countDocuments({ status: ReportStatus.PENDING }),
    ]);

    return {
      totalUsers,
      totalPosts,
      totalSessions,
      pendingReports,
    };
  },
};
