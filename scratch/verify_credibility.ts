/**
 * verify_credibility.ts
 * ─────────────────────
 * Integration verification script for the Career Credibility & Portfolio Ecosystem.
 * Tests all business rules, schema constraints, and API contract shapes.
 *
 * Run with: npx ts-node scratch/verify_credibility.ts
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
config();

import { User, Role } from '../src/modules/users/user.model';
import { PortfolioProject } from '../src/modules/portfolio/portfolioProject.model';
import { VerifiedAchievement } from '../src/modules/achievements/verifiedAchievement.model';
import { Endorsement } from '../src/modules/endorsements/endorsement.model';

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';

type TestResult = { name: string; pass: boolean; detail: string };
const results: TestResult[] = [];

function assert(name: string, condition: boolean, detail = '') {
  results.push({ name, pass: condition, detail: condition ? 'OK' : detail || 'FAILED' });
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB\n');

  // ── 1. User Professional Identity Fields ──────────────────────────────────
  const studentUser = await User.findOne({ email: 'aarav.student@ascendpath.dev' }).lean();
  assert('Student user exists', !!studentUser);
  assert('Student has username', !!studentUser?.username, `username: ${studentUser?.username}`);
  assert('Student has headline', !!studentUser?.headline);
  assert('Student has specialization', !!studentUser?.specialization);
  assert('Student profileVisibility is true', studentUser?.profileVisibility === true);

  const guideUser = await User.findOne({ email: 'meera.guide@ascendpath.dev' }).lean();
  assert('Guide user exists', !!guideUser);
  assert('Guide has username', !!guideUser?.username);
  assert('Guide has totalSessions > 0', (guideUser?.totalSessions || 0) > 0, `totalSessions: ${guideUser?.totalSessions}`);
  assert('Guide has averageRating > 0', (guideUser?.averageRating || 0) > 0, `averageRating: ${guideUser?.averageRating}`);

  // ── 2. Portfolio Projects ─────────────────────────────────────────────────
  const projects = await PortfolioProject.find({ userId: studentUser?._id }).lean();
  assert('Student has portfolio projects', projects.length >= 2, `count: ${projects.length}`);

  const mentorReviewed = projects.filter((p) => p.isMentorReviewed);
  assert('At least 1 mentor-reviewed project', mentorReviewed.length >= 1);
  assert('Mentor-reviewed project has reviewedBy', !!mentorReviewed[0]?.reviewedBy);
  assert('Mentor-reviewed project has mentorReviewNotes', !!mentorReviewed[0]?.mentorReviewNotes);
  assert('Projects have technologies', projects.every((p) => p.technologies.length > 0));
  assert('Projects have learningOutcomes', projects.every((p) => p.learningOutcomes.length > 0));

  // ── 3. Verified Achievements ──────────────────────────────────────────────
  const studentAchievements = await VerifiedAchievement.find({ userId: studentUser?._id }).lean();
  assert('Student has verified achievements', studentAchievements.length >= 3, `count: ${studentAchievements.length}`);

  const categories = new Set(studentAchievements.map((a) => a.category));
  assert('Achievements span multiple categories', categories.size >= 2, `categories: ${[...categories].join(', ')}`);

  const credentialIds = studentAchievements.map((a) => a.credentialId);
  const uniqueCredentials = new Set(credentialIds);
  assert('All credentialIds are unique', uniqueCredentials.size === credentialIds.length);
  assert('CredentialIds are 16-char hex', credentialIds.every((id) => /^[a-f0-9]{16}$/.test(id)));

  const types = new Set(studentAchievements.map((a) => a.type));
  assert('Has both certificate and badge types', types.has('certificate') && types.has('badge'));

  // ── 4. Endorsements ───────────────────────────────────────────────────────
  const endorsements = await Endorsement.find({ recipientId: studentUser?._id }).lean();
  assert('Student has endorsements', endorsements.length >= 2, `count: ${endorsements.length}`);

  const endorserIds = endorsements.map((e) => e.endorserId.toString());
  const uniqueEndorsers = new Set(endorserIds);
  assert('Endorsements are from different mentors', uniqueEndorsers.size === endorserIds.length);

  assert('All endorsements are approved', endorsements.every((e) => e.moderationStatus === 'approved'));

  const endorsementTypes = new Set(endorsements.map((e) => e.type));
  assert('Endorsement types include project and skill', endorsementTypes.has('project') && endorsementTypes.has('skill'));

  // ── 5. Schema Constraints ─────────────────────────────────────────────────
  // Test unique constraint: endorser-recipient pair
  const duplicateEndorsement = new Endorsement({
    endorserId: guideUser?._id,
    recipientId: studentUser?._id,
    type: 'general',
    message: 'Duplicate test endorsement — should fail',
  });
  let duplicateRejected = false;
  try {
    await duplicateEndorsement.save();
    // If it saved, clean it up
    await Endorsement.findByIdAndDelete(duplicateEndorsement._id);
  } catch (err: any) {
    duplicateRejected = err.code === 11000; // MongoDB duplicate key error
  }
  assert('Duplicate endorsement (same mentor→learner) is rejected', duplicateRejected);

  // ── 6. Public Profile Lookup ──────────────────────────────────────────────
  const byUsername = await User.findOne({ username: 'aarav-sharma', profileVisibility: true })
    .select('-passwordHash -email -falseReportStrikes -moderatorNotes -suspensionReason')
    .lean();
  assert('Public profile findable by username', !!byUsername);
  assert('Public profile excludes passwordHash', !('passwordHash' in (byUsername || {})));
  assert('Public profile excludes email', !('email' in (byUsername || {})));

  // ── 7. Guide Achievement ──────────────────────────────────────────────────
  const guideAchievements = await VerifiedAchievement.find({ userId: guideUser?._id }).lean();
  assert('Guide has specialization achievement', guideAchievements.some((a) => a.category === 'specialization'));

  // ── Print Results ─────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  CREDIBILITY ECOSYSTEM — VERIFICATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  const passed = results.filter((r) => r.pass);
  const failed = results.filter((r) => !r.pass);

  for (const r of results) {
    const icon = r.pass ? '✅' : '❌';
    const detail = r.detail !== 'OK' ? ` — ${r.detail}` : '';
    console.log(`  ${icon} ${r.name}${detail}`);
  }

  console.log(`\n───────────────────────────────────────────────────────────`);
  console.log(`  Total: ${results.length} | Passed: ${passed.length} | Failed: ${failed.length}`);
  console.log(`───────────────────────────────────────────────────────────\n`);

  await mongoose.disconnect();

  if (failed.length > 0) {
    process.exit(1);
  }
}

run().catch(async (err) => {
  console.error('Verification script failed:', err);
  await mongoose.disconnect();
  process.exit(1);
});
