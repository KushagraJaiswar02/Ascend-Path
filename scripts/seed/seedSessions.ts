import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { CareerDomain } from '../../src/modules/taxonomy/careerDomain.model';
import { CareerRoadmap } from '../../src/modules/roadmaps/roadmap.model';
import { Session, SessionStatus, SessionType, SessionCategory, AttendanceStatus, SessionExecutionState, RegistrationMode, MeetingProvider } from '../../src/modules/sessions/session.model';
import { SessionReflection, SessionReflectionStatus } from '../../src/modules/sessions/sessionReflection.model';
import { connectDb, SeededRandom } from './helper';

export const seedSessions = async () => {
  await connectDb();

  console.log('📅 Wiping and seeding 35+ bulk Mentorship Sessions, Reflections, and Workshops...');
  await Session.deleteMany({});
  await SessionReflection.deleteMany({});

  const rng = new SeededRandom(777);

  const guides = await User.find({ role: Role.GUIDE });
  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });
  const csDomain = await CareerDomain.findOne({ slug: 'computer-science' });
  const rm = await CareerRoadmap.findOne({ slug: 'frontend-engineering-react' });

  if (!guides.length || !learners.length) {
    console.error('❌ Named users not found. Please run seedUsers first.');
    return;
  }

  const domainIds = csDomain ? [csDomain._id as mongoose.Types.ObjectId] : [];

  // 1. Seed Core Named Sessions (for standard demo testing)
  const elena = await User.findOne({ email: 'frontend_mentor@ascendpath.dev' });
  const leo = await User.findOne({ email: 'struggling_learner@ascendpath.dev' });
  const aisha = await User.findOne({ email: 'active_learner@ascendpath.dev' });

  if (elena && aisha && leo) {
    await Session.create({
      guideId: elena._id,
      clientId: aisha._id,
      sessionType: SessionType.PRIVATE_MENTORSHIP,
      title: 'Zustand State Architecture Review',
      topic: 'Performance optimizations, custom store configuration selectors.',
      description: 'We will inspect your active code repository to review Zustand renders.',
      careerDomains: domainIds,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      price: 0,
      status: SessionStatus.BOOKED,
      isPublic: false,
      registrationMode: RegistrationMode.OPEN,
      attendanceStatus: AttendanceStatus.SCHEDULED,
      sessionExecutionState: SessionExecutionState.SCHEDULED,
      meetingLink: 'https://meet.jit.si/ascendpath-zustand-review',
      meetingProvider: MeetingProvider.JITSI
    });

    const completedPrivate = await Session.create({
      guideId: elena._id,
      clientId: leo._id,
      sessionType: SessionType.PRIVATE_MENTORSHIP,
      title: 'Asynchronous JavaScript & Promises Foundations',
      topic: 'Callbacks, Promises, async/await structures.',
      description: 'A 1-on-1 foundations session to trace async middleware loops.',
      careerDomains: domainIds,
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      price: 0,
      status: SessionStatus.COMPLETED,
      isPublic: false,
      registrationMode: RegistrationMode.OPEN,
      attendanceStatus: AttendanceStatus.COMPLETED,
      sessionExecutionState: SessionExecutionState.REFLECTION_UNLOCKED,
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      endedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      actualDurationMinutes: 60
    });

    await SessionReflection.create({
      sessionId: completedPrivate._id,
      menteeId: leo._id,
      mentorId: elena._id,
      menteeReflection: {
        learnings: 'Callbacks are clear, need to practice async catch parameters.',
        confidenceLevel: 3,
        nextChallenge: 'Express crash exception handling.',
        submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      mentorFollowup: {
        recommendedRoadmapSteps: rm ? [{ roadmapId: rm._id, title: 'HTML5 Semantic Layouts', reason: 'Review core foundations.' }] : [],
        recommendedResources: [{ title: 'MDN exception handlers guide', url: 'https://developer.mozilla.org', type: 'article' }],
        recommendedProjects: [{ title: 'Express crash proofing', description: 'Practice catching database query errors.', difficulty: 'beginner' }],
        mentorNotes: 'Advised him to practice try/catch blocks.',
        nextSessionSuggestion: 'Code review in 10 days.',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      status: SessionReflectionStatus.COMPLETED,
      requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    });
  }

  // 2. Seed 25 Bulk Completed Sessions with reflections
  for (let i = 0; i < 25; i++) {
    const guide = rng.pick(guides);
    const learner = rng.pick(learners);
    const datePast = new Date(Date.now() - rng.nextInt(1, 28) * 24 * 60 * 60 * 1000);

    const sess = await Session.create({
      guideId: guide._id,
      clientId: learner._id,
      sessionType: SessionType.PRIVATE_MENTORSHIP,
      title: `Mentorship Code Check #${i + 1}`,
      topic: rng.pick(['Zod validations', 'CSS auto layouts', 'Numpy shapes dot products', 'Linux firewalls']),
      description: 'Periodic learning milestone check-in call.',
      careerDomains: domainIds,
      scheduledAt: datePast,
      durationMinutes: rng.pick([30, 45, 60]),
      price: 0,
      status: SessionStatus.COMPLETED,
      isPublic: false,
      registrationMode: RegistrationMode.OPEN,
      attendanceStatus: AttendanceStatus.COMPLETED,
      sessionExecutionState: SessionExecutionState.REFLECTION_UNLOCKED,
      startedAt: datePast,
      endedAt: new Date(datePast.getTime() + 45 * 60 * 1000),
      actualDurationMinutes: 45
    });

    // Create completed reflection
    await SessionReflection.create({
      sessionId: sess._id,
      menteeId: learner._id,
      mentorId: guide._id,
      menteeReflection: {
        learnings: 'The discussion helped clarify variables scopes and performance optimizations.',
        confidenceLevel: rng.nextInt(2, 5),
        nextChallenge: 'Improving layout render operations.',
        submittedAt: new Date(datePast.getTime() + 12 * 60 * 60 * 1000)
      },
      mentorFollowup: {
        recommendedRoadmapSteps: [],
        recommendedResources: [{ title: 'Developer specs', url: 'https://developer.mozilla.org', type: 'article' }],
        recommendedProjects: [],
        mentorNotes: 'Great session. The student possesses strong debugging foundations.',
        submittedAt: new Date(datePast.getTime() + 24 * 60 * 60 * 1000)
      },
      status: SessionReflectionStatus.COMPLETED,
      requestedAt: datePast
    });
  }

  // 3. Seed 8 Upcoming Booked Sessions
  for (let i = 0; i < 8; i++) {
    const guide = rng.pick(guides);
    const learner = rng.pick(learners);
    const dateFuture = new Date(Date.now() + rng.nextInt(1, 10) * 24 * 60 * 60 * 1000);

    await Session.create({
      guideId: guide._id,
      clientId: learner._id,
      sessionType: SessionType.PRIVATE_MENTORSHIP,
      title: `Upcoming Career Mapping slot #${i + 1}`,
      topic: rng.pick(['Portfolio reviews', 'GitHub code setups', 'Career switch considerations']),
      careerDomains: domainIds,
      scheduledAt: dateFuture,
      durationMinutes: 45,
      price: 0,
      status: SessionStatus.BOOKED,
      isPublic: false,
      registrationMode: RegistrationMode.OPEN,
      attendanceStatus: AttendanceStatus.SCHEDULED,
      sessionExecutionState: SessionExecutionState.SCHEDULED,
      meetingLink: 'https://meet.jit.si/ascendpath-session-' + i,
      meetingProvider: MeetingProvider.JITSI
    });
  }

  // 4. Seed 5 Public Workshops (Group sessions)
  const workshopTopics = [
    'Advanced React 19 Hydration Masterclass',
    'Offensive Penetration stealth scan methods',
    'NumPy array dot shapes optimizations',
    'TailwindCSS v4 design token workflows',
    'Mongoose schemas compound index setups'
  ];

  for (let i = 0; i < workshopTopics.length; i++) {
    const guide = rng.pick(guides);
    const dateFuture = new Date(Date.now() + rng.nextInt(3, 15) * 24 * 60 * 60 * 1000);

    await Session.create({
      guideId: guide._id,
      sessionType: SessionType.PUBLIC_WORKSHOP,
      title: workshopTopics[i],
      topic: 'Live code review and interactive conceptual walk-through.',
      description: 'Weekly community event to review core code blocks.',
      careerDomains: domainIds,
      scheduledAt: dateFuture,
      durationMinutes: 90,
      price: 0,
      status: SessionStatus.OPEN,
      isPublic: true,
      capacity: 40,
      attendeeCount: rng.nextInt(3, 15),
      registrationMode: RegistrationMode.OPEN,
      sessionCategory: SessionCategory.WORKSHOP,
      attendees: learners.slice(0, rng.nextInt(3, 10)).map(l => ({ userId: l._id, registeredAt: new Date() })),
      meetingLink: 'https://meet.jit.si/ascendpath-workshop-' + i,
      meetingProvider: MeetingProvider.JITSI
    });
  }

  console.log('✅ 35+ bulk Mentorship Sessions, Reflections, and Workshops seeded successfully!');
};

if (require.main === module) {
  seedSessions()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
