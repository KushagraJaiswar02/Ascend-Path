require('ts-node/register');
require('dotenv').config();

const mongoose = require('mongoose');
const { User, Role } = require('../src/modules/users/user.model');
const { Session, SessionStatus } = require('../src/modules/sessions/session.model');
const { Review } = require('../src/modules/reviews/review.model');
const { ReputationAuditLog } = require('../src/modules/reputation/reputationAudit.model');
const { reputationService } = require('../src/modules/reputation/reputation.service');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const seedTag = 'review-seed';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for verified reviews seeding...');

  // 1. Clear previous reviews & audits
  await Promise.all([
    Review.deleteMany({ reviewText: { $regex: seedTag } }),
    ReputationAuditLog.deleteMany({}),
  ]);

  // 2. Find guides & students
  const guides = await User.find({ role: Role.GUIDE });
  const student = await User.findOne({ role: Role.EXPLORER });

  if (guides.length === 0 || !student) {
    console.error('Seeding aborted: Make sure to run guide profile seeding first so guides/students exist!');
    await mongoose.disconnect();
    return;
  }

  const now = new Date();

  // 3. Seed reviews for Sarah Connor
  const sarah = guides.find(g => g.name === 'Sarah Connor') || guides[0];
  console.log(`Adding reviews and audits for ${sarah.name}...`);

  // Let's find completed sessions for Sarah that don't have reviews, or create some
  let sarahSessions = await Session.find({ guideId: sarah._id, status: SessionStatus.COMPLETED });
  if (sarahSessions.length < 3) {
    const s1 = await Session.create({
      guideId: sarah._id,
      clientId: student._id,
      title: 'Kubernetes Ingress Controllers deeply explored',
      topic: 'Kubernetes',
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      price: 150,
      status: SessionStatus.COMPLETED,
    });
    const s2 = await Session.create({
      guideId: sarah._id,
      clientId: student._id,
      title: 'VPC Peering & Subnets configuration',
      topic: 'AWS Network',
      scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      price: 100,
      status: SessionStatus.COMPLETED,
    });
    sarahSessions = [s1, s2];
  }

  // Create Review documents
  const r1 = await Review.create({
    reviewerId: student._id,
    guideId: sarah._id,
    sessionId: sarahSessions[0]._id,
    rating: 5,
    reviewText: `Superb learning experience! Highly recommend Sarah for cloud network orchestration. (${seedTag})`,
    tags: ['Helpful', 'Deep Technical Knowledge', 'Good Communication'],
    sentiment: 'positive',
    isVerified: true,
    moderationStatus: 'approved',
  });

  const r2 = await Review.create({
    reviewerId: student._id,
    guideId: sarah._id,
    sessionId: sarahSessions[1]._id,
    rating: 4,
    reviewText: `Very detailed and practical. Explained VPC boundaries very well. (${seedTag})`,
    tags: ['Practical', 'Helpful'],
    sentiment: 'positive',
    isVerified: true,
    moderationStatus: 'approved',
  });

  // Link back to Session documents
  await Session.findByIdAndUpdate(sarahSessions[0]._id, { reviewId: r1._id, rating: 5, review: r1.reviewText });
  await Session.findByIdAndUpdate(sarahSessions[1]._id, { reviewId: r2._id, rating: 4, review: r2.reviewText });

  // 4. Seed reviews for Dev Kapoor
  const dev = guides.find(g => g.name === 'Dev Kapoor') || guides[0];
  console.log(`Adding reviews and audits for ${dev.name}...`);

  let devSessions = await Session.find({ guideId: dev._id, status: SessionStatus.COMPLETED });
  if (devSessions.length < 2) {
    const s1 = await Session.create({
      guideId: dev._id,
      clientId: student._id,
      title: 'Advanced Mongoose Aggregation pipelines design',
      topic: 'MongoDB',
      scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      price: 200,
      status: SessionStatus.COMPLETED,
    });
    devSessions = [s1];
  }

  const r3 = await Review.create({
    reviewerId: student._id,
    guideId: dev._id,
    sessionId: devSessions[0]._id,
    rating: 5,
    reviewText: `Dev is an absolute wizard with database aggregations. Guided me through heavy pipeline performance optimizations seamlessly! (${seedTag})`,
    tags: ['Deep Technical Knowledge', 'Practical'],
    sentiment: 'positive',
    isVerified: true,
    moderationStatus: 'approved',
  });

  await Session.findByIdAndUpdate(devSessions[0]._id, { reviewId: r3._id, rating: 5, review: r3.reviewText });

  // 5. Recalculate Fame scores
  console.log('Calculating dynamic weighted Fame scores and Guide ranks...');
  await reputationService.recalculateFameScore(sarah._id.toString());
  await reputationService.recalculateFameScore(dev._id.toString());

  // 6. Print out calculations & audit log entries
  const updatedSarah = await User.findById(sarah._id);
  const updatedDev = await User.findById(dev._id);
  const audits = await ReputationAuditLog.find({}).sort({ createdAt: -1 });

  console.log('\n=========================================');
  console.log('REPUTATION SYNCHRONIZATION RESULTS:');
  console.log(`1. Guide: ${updatedSarah.name}`);
  console.log(`   Fame Score: ${updatedSarah.fameScore} / 100`);
  console.log(`   Guide Rank: ${updatedSarah.guideRank}`);
  console.log(`   Avg Rating: ${updatedSarah.averageRating} stars`);
  console.log(`   Total Reviews: ${updatedSarah.totalReviews}`);
  console.log(`   Total Sessions: ${updatedSarah.totalSessions}`);
  console.log(`2. Guide: ${updatedDev.name}`);
  console.log(`   Fame Score: ${updatedDev.fameScore} / 100`);
  console.log(`   Guide Rank: ${updatedDev.guideRank}`);
  console.log(`   Avg Rating: ${updatedDev.averageRating} stars`);
  console.log(`   Total Reviews: ${updatedDev.totalReviews}`);
  console.log(`   Total Sessions: ${updatedDev.totalSessions}`);
  console.log(`\nReputation Audit Logs recorded: ${audits.length} events.`);
  audits.forEach(log => {
    console.log(`   [AUDIT] User: ${log.userId} | Type: ${log.type.toUpperCase()} | Delta: ${log.delta > 0 ? '+' : ''}${log.delta} | Reason: ${log.reason}`);
  });
  console.log('=========================================');

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed verified reviews data:', error);
  await mongoose.disconnect();
  process.exit(1);
});
