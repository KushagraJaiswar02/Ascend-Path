import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { CareerDomain } from '../../src/modules/taxonomy/careerDomain.model';
import { CareerGoal } from '../../src/modules/taxonomy/careerGoal.model';
import { RecommendationProfile } from '../../src/modules/recommendations/recommendationProfile.model';
import { connectDb, SeededRandom } from './helper';

export const seedAnalytics = async () => {
  await connectDb();

  console.log('📈 Wiping and seeding 40+ active Learner Recommendation Profiles...');
  await RecommendationProfile.deleteMany({});

  const rng = new SeededRandom(666);

  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });
  const cs = await CareerDomain.findOne({ slug: 'computer-science' });
  const ds = await CareerDomain.findOne({ slug: 'data-science' });
  const jobGoal = await CareerGoal.findOne({ slug: 'land-first-job' });

  if (!learners.length) {
    console.error('❌ Learners not found. Please run seedUsers first.');
    return;
  }

  const csDomains = cs ? [cs._id as mongoose.Types.ObjectId] : [];
  const dsDomains = ds ? [ds._id as mongoose.Types.ObjectId] : [];
  const goalIds = jobGoal ? [jobGoal._id as mongoose.Types.ObjectId] : [];

  for (const learner of learners) {
    const domainIds = rng.chance(0.5) ? csDomains : dsDomains;

    await RecommendationProfile.create({
      userId: learner._id,
      careerDomains: domainIds,
      careerGoals: goalIds,
      careerStage: learner.careerStage || rng.pick(['school_student', 'college_student', 'graduate', 'career_switcher']),
      preferredLanguages: ['English'],
      budgetRange: rng.pick(['free_only', 'low_cost', 'moderate', 'premium']),
      weeklyCommitment: rng.pick(['0_3_hours', '4_7_hours', '8_15_hours', '16_plus_hours']),
      learningStyle: rng.pick(['visual', 'hands_on', 'self_paced']),
      targetRole: learner.onboarding?.targetRole || 'Software Engineer',
      inferredInterests: rng.pickMultiple(['react', 'typescript', 'python', 'databases', 'security'], 2),
      engagementPatterns: {
        roadmapEnrollments: rng.nextInt(0, 3),
        roadmapCompletions: rng.nextInt(0, 1),
        sessionBookings: rng.nextInt(0, 4),
        sessionAttendance: rng.nextInt(0, 4),
        recommendationClicks: rng.nextInt(1, 15),
        recommendationIgnores: rng.nextInt(0, 10)
      },
      recommendationWeights: {
        domain: rng.pick([28, 32]),
        goal: rng.pick([16, 20]),
        stage: rng.pick([8, 14]),
        language: 10,
        budget: 8,
        quality: 10,
        freshness: 5,
        behavior: 5
      }
    });
  }

  console.log('✅ 40+ Recommendation Profiles seeded successfully!');
};

if (require.main === module) {
  seedAnalytics()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
