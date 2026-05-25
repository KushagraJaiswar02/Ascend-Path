import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { CareerRoadmap, RoadmapStep } from '../../src/modules/roadmaps/roadmap.model';
import { UserProgress } from '../../src/modules/roadmaps/userProgress.model';
import { CareerCompanionProfile } from '../../src/modules/companion/careerCompanionProfile.model';
import { GrowthCheckIn } from '../../src/modules/companion/growthCheckIn.model';
import { CareerJournalEntry } from '../../src/modules/companion/careerJournalEntry.model';
import { GrowthTimelineEvent } from '../../src/modules/companion/growthTimelineEvent.model';
import { connectDb, SeededRandom } from './helper';

export const seedCompanion = async () => {
  await connectDb();

  console.log('🧠 Wiping progress and seeding 45+ detailed Learner progress tracks and AI profiles...');
  await UserProgress.deleteMany({});
  await CareerCompanionProfile.deleteMany({});
  await GrowthCheckIn.deleteMany({});
  await CareerJournalEntry.deleteMany({});
  await GrowthTimelineEvent.deleteMany({});

  const rng = new SeededRandom(54321);

  // 1. Fetch Learners and Roadmaps
  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });
  const roadmaps = await CareerRoadmap.find({});

  if (!learners.length || !roadmaps.length) {
    console.error('❌ Users or Roadmaps not found. Run seedUsers and seedRoadmaps first.');
    return;
  }

  // 2. Loop through all 40+ Learners and enroll them programmatically
  for (const learner of learners) {
    const activeRoadmaps = rng.pickMultiple(roadmaps, rng.nextInt(1, 2));

    for (const rm of activeRoadmaps) {
      // Find all steps for this roadmap
      const steps = await RoadmapStep.find({ roadmapId: rm._id });
      if (!steps.length) continue;

      const completionRatio = rng.nextInt(10, 80) / 100;
      const completedStepsCount = Math.floor(steps.length * completionRatio);
      const completedSteps = rng.pickMultiple(steps, completedStepsCount).map(s => s._id as mongoose.Types.ObjectId);

      const progressPercentage = Math.round((completedSteps.length / steps.length) * 100);
      const streakCount = rng.nextInt(0, 8);

      const notesMap = new Map<string, string>();
      if (completedSteps.length > 0) {
        notesMap.set(completedSteps[0].toString(), 'Completed this step! Found the vectors references highly useful.');
      }

      await UserProgress.create({
        userId: learner._id,
        roadmapId: rm._id,
        completedSteps,
        progressPercentage,
        startedAt: new Date(Date.now() - rng.nextInt(1, 30) * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(Date.now() - rng.nextInt(0, 5) * 24 * 60 * 60 * 1000),
        completedAt: progressPercentage === 100 ? new Date() : undefined,
        streakCount,
        notes: notesMap,
        bookmarkedSteps: completedSteps.length > 1 ? [completedSteps[1]] : []
      });

      // Growth events
      await GrowthTimelineEvent.create({
        userId: learner._id,
        type: 'roadmap_started',
        title: `Enrolled in ${rm.title}`,
        summary: `Began structural learning path in ${rm.title}.`,
        entityId: rm._id,
        entityType: 'Roadmap',
        visibility: 'mentor_summary',
        occurredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      });
    }

    // 3. Seed Growth Check-in
    const conf = rng.nextInt(1, 5);
    await GrowthCheckIn.create({
      userId: learner._id,
      confidenceLevel: conf,
      hardestThing: rng.pick([
        'Database middleware connection setups are giving me errors.',
        'Learning CSS Layouts Grid structures is somewhat overwhelming.',
        'Structuring matrix operations is highly complex.',
        'None! Cruising through code blocks smoothly.'
      ]),
      goalsChanged: rng.chance(0.2),
      newGoalText: rng.chance(0.2) ? 'Looking to specialize in advanced interfaces' : undefined,
      pacingFeeling: rng.pick(['right', 'too_fast', 'overwhelmed']),
      supportNeeded: rng.pickMultiple(['Concept Help', 'Interview prep', 'Goal Clarity', 'Code review'], rng.nextInt(1, 2))
    });

    // 4. Seed Journal Entry
    await CareerJournalEntry.create({
      userId: learner._id,
      entryType: rng.pick(['reflection', 'win', 'setback']),
      title: rng.pick(['Progressing through steps', 'Encountered Mongoose block', 'Zustand selector win!']),
      body: 'Spent a few hours debugging state components today. Moving forward step-by-step and keeping positive.',
      mood: rng.pick(['confident', 'curious', 'stuck', 'uncertain', 'motivated']),
      tags: ['seeding', 'reflection'],
      isPrivate: rng.chance(0.8)
    });

    // 5. Seed Companion Profile
    const activeBlockers: any[] = [];
    const status = rng.pick(['building', 'steady', 'stalled', 'recovering']) as any;

    if (status === 'stalled') {
      activeBlockers.push({
        type: 'abandoned_roadmap',
        label: 'A roadmap may be losing momentum',
        severity: 'medium' as const,
        detectedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        evidence: ['No progress completed on active roadmaps for 21 days']
      });
    } else if (conf <= 2) {
      activeBlockers.push({
        type: 'low_confidence',
        label: 'Confidence has been low across recent reflections',
        severity: 'medium' as const,
        detectedAt: new Date(),
        evidence: [`Confidence index measured at ${conf}/5`]
      });
    }

    await CareerCompanionProfile.create({
      userId: learner._id,
      aspirations: [learner.onboarding?.targetRole || 'Software Engineer'],
      activeGoals: learner.careerGoals || [],
      evolvingInterests: rng.pickMultiple(['React', 'TypeScript', 'Node', 'NumPy', 'Ethical Hacking'], 2),
      confidenceTrend: {
        current: conf,
        previous: Math.max(1, conf - 1),
        direction: conf > 3 ? 'rising' : 'steady',
        samples: [
          { value: Math.max(1, conf - 1), source: 'onboarding', capturedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
          { value: conf, source: 'growth_check_in', capturedAt: new Date() }
        ]
      },
      learningPatterns: {
        preferredPace: rng.pick(['light', 'steady', 'intensive']),
        consistencyScore: rng.nextInt(20, 95),
        lastActiveAt: new Date()
      },
      momentum: {
        score: rng.nextInt(30, 90),
        status,
        streakCount: rng.nextInt(0, 6)
      },
      blockers: activeBlockers,
      milestones: [
        { title: 'Completed Onboarding profiling', category: 'onboarding', occurredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      ],
      reflectionSummaries: {
        recurringInterests: ['Coding', 'UI Components'],
        recurringStruggles: ['Asynchronous loops'],
        evolvingGoals: ['Frontend Engineer'],
        uncertaintyThemes: []
      },
      privacy: {
        shareProgressSummaryWithMentors: true,
        shareBlockerSignalsWithMentors: true,
        shareJournalWithMentors: false
      }
    });
  }

  console.log('✅ 45+ Learner progress tracks and AI profiles seeded successfully!');
};

if (require.main === module) {
  seedCompanion()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
