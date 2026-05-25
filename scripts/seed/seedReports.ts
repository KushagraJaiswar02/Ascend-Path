import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { Post } from '../../src/modules/posts/post.model';
import { Report, TargetType, ReportReason, ReportStatus, ReportPriority, ModeratorDecision } from '../../src/modules/moderation/report.model';
import { AuditLog, AuditAction, AuditSeverity } from '../../src/modules/moderation/auditLog.model';
import { connectDb, SeededRandom } from './helper';

export const seedReports = async () => {
  await connectDb();

  console.log('🚨 Wiping and seeding 30+ Moderation Queue reports and 50+ Audit Logs...');
  await Report.deleteMany({});
  await AuditLog.deleteMany({});

  const rng = new SeededRandom(4444);

  const guides = await User.find({ role: Role.GUIDE });
  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });
  const moderators = await User.find({ role: Role.MODERATOR });
  const admin = await User.findOne({ email: 'admin@ascendpath.dev' });

  if (!moderators.length || !learners.length || !admin) {
    console.error('❌ Named users not found. Please run seedUsers first.');
    return;
  }

  const elena = await User.findOne({ email: 'frontend_mentor@ascendpath.dev' });
  const timmy = await User.findOne({ email: 'confused_beginner@ascendpath.dev' });
  const leo = await User.findOne({ email: 'struggling_learner@ascendpath.dev' });
  const mod = moderators[0];

  // Seed 30 Bulk Reports
  const reasons = Object.values(ReportReason);
  const targets = Object.values(TargetType);
  const priorities = Object.values(ReportPriority);
  const statuses = Object.values(ReportStatus);

  for (let i = 0; i < 30; i++) {
    const reporter = rng.pick(learners);
    const targetUser = rng.pick(learners);
    const modAssignee = rng.chance(0.5) ? rng.pick(moderators) : undefined;

    if (reporter._id.toString() === targetUser._id.toString()) continue;

    await Report.create({
      reporterId: reporter._id,
      targetType: TargetType.USER,
      targetId: targetUser._id,
      reason: rng.pick(reasons),
      reasonCategory: rng.pick(reasons),
      detailedReason: `Flagged item - Case #${i + 1}. User appears to violate community guidelines.`,
      status: rng.pick(statuses),
      priority: rng.pick(priorities),
      assignedModerator: modAssignee?._id,
      moderatorDecision: rng.pick(Object.values(ModeratorDecision))
    });
  }

  // Seed 50 Bulk Audit Logs
  const auditActions = Object.values(AuditAction);
  const severities = Object.values(AuditSeverity);

  for (let i = 0; i < 50; i++) {
    const actor = rng.chance(0.5) ? admin : rng.pick(moderators);
    const target = rng.pick(learners);

    await AuditLog.create({
      actorId: actor._id,
      action: rng.pick(auditActions),
      targetId: target._id,
      targetType: 'user',
      details: `Administrative operations audit - Case AP-${rng.nextInt(1000, 9999)}.`,
      severity: rng.pick(severities)
    });
  }

  console.log('✅ 30+ moderation reports and 50+ audit logs seeded successfully!');
};

if (require.main === module) {
  seedReports()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
