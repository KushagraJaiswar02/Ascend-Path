require('ts-node/register');
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Role, EducationLevel, GuideRank } = require('../src/modules/users/user.model');
const { Post, PostCategory } = require('../src/modules/posts/post.model');
const { Reply } = require('../src/modules/posts/reply.model');
const { Session, SessionStatus } = require('../src/modules/sessions/session.model');
const { PingRequest, PingStatus } = require('../src/modules/pings/ping.model');
const { CareerRoadmap, RoadmapSection, RoadmapStep } = require('../src/modules/roadmaps/roadmap.model');
const { UserProgress } = require('../src/modules/roadmaps/userProgress.model');
const { Notification, NotificationType } = require('../src/modules/notifications/notification.model');
const { PortfolioProject } = require('../src/modules/portfolio/portfolioProject.model');
const { VerifiedAchievement } = require('../src/modules/achievements/verifiedAchievement.model');
const { Endorsement } = require('../src/modules/endorsements/endorsement.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const password = 'DemoPass123!';
const seedTag = 'demo-seed';

const accountSeeds = [
  {
    key: 'student',
    name: 'Aarav Sharma',
    email: 'aarav.student@ascendpath.dev',
    role: Role.EXPLORER,
    educationLevel: EducationLevel.COLLEGE,
    bio: 'Second-year CS student exploring full-stack development and internships.',
    skills: ['JavaScript', 'React basics', 'Data structures'],
    interests: ['web development', 'internships', 'open source'],
    respectPoints: 18,
    fameScore: 12,
    username: 'aarav-sharma',
    headline: 'Aspiring Full-Stack Developer | CS Student',
    specialization: 'Frontend Development',
    profileVisibility: true,
  },
  {
    key: 'guide',
    name: 'Meera Iyer',
    email: 'meera.guide@ascendpath.dev',
    role: Role.GUIDE,
    educationLevel: EducationLevel.PROFESSIONAL,
    bio: 'Frontend mentor helping students turn project ideas into polished portfolio work.',
    skills: ['React', 'TypeScript', 'UI systems', 'career mentoring'],
    interests: ['portfolio reviews', 'frontend careers', 'product thinking'],
    respectPoints: 740,
    fameScore: 88,
    guideRank: GuideRank.EXPERT,
    username: 'meera-iyer',
    headline: 'Frontend Mentor & UI Systems Specialist',
    specialization: 'Frontend Engineering',
    profileVisibility: true,
    totalSessions: 28,
    averageRating: 4.8,
    socialLinks: {
      github: 'https://github.com/meera-guide-demo',
      linkedin: 'https://linkedin.com/in/meera-guide-demo',
      website: 'https://meera-demo.dev',
    },
  },
  {
    key: 'pathfinder',
    name: 'Rohan Verma',
    email: 'rohan.pathfinder@ascendpath.dev',
    role: Role.PATHFINDER,
    educationLevel: EducationLevel.PROFESSIONAL,
    bio: 'Backend engineer sharing practical roadmaps for APIs, databases, and system design.',
    skills: ['Node.js', 'MongoDB', 'API design', 'system design'],
    interests: ['backend', 'scalability', 'mentorship'],
    respectPoints: 420,
    fameScore: 63,
    guideRank: GuideRank.ESTABLISHED,
    username: 'rohan-verma',
    headline: 'Backend Engineer & System Design Mentor',
    specialization: 'Backend Engineering',
    profileVisibility: true,
    totalSessions: 15,
    averageRating: 4.6,
  },
  {
    key: 'sentinel',
    name: 'Nisha Rao',
    email: 'nisha.sentinel@ascendpath.dev',
    role: Role.SENTINEL,
    educationLevel: EducationLevel.PROFESSIONAL,
    bio: 'Community moderator keeping discussions useful, kind, and on-topic.',
    skills: ['community moderation', 'content review', 'conflict resolution'],
    interests: ['community safety', 'student support'],
    respectPoints: 310,
    fameScore: 45,
  },
  {
    key: 'architect',
    name: 'Dev Kapoor',
    email: 'dev.architect@ascendpath.dev',
    role: Role.ARCHITECT,
    educationLevel: EducationLevel.PROFESSIONAL,
    bio: 'Platform architect focused on product direction and high-level learning paths.',
    skills: ['architecture', 'product strategy', 'cloud systems'],
    interests: ['platform design', 'growth loops', 'AI tooling'],
    respectPoints: 960,
    fameScore: 95,
    guideRank: GuideRank.EXPERT,
  },
];

async function upsertUser(seed, passwordHash) {
  return User.findOneAndUpdate(
    { email: seed.email },
    {
      $set: {
        name: seed.name,
        email: seed.email,
        passwordHash,
        role: seed.role,
        educationLevel: seed.educationLevel,
        bio: seed.bio,
        skills: seed.skills ? seed.skills.map(s => typeof s === 'string' ? { name: s } : s) : [],
        interests: seed.interests,
        respectPoints: seed.respectPoints,
        fameScore: seed.fameScore,
        guideRank: seed.guideRank || GuideRank.RISING,
        isVerified: true,
        isBanned: false,
        pingAvailable: true,
        socialLinks: seed.socialLinks || {},
        username: seed.username,
        headline: seed.headline,
        specialization: seed.specialization,
        profileVisibility: seed.profileVisibility ?? true,
        totalSessions: seed.totalSessions || 0,
        averageRating: seed.averageRating || 0,
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );
}

async function run() {
  await mongoose.connect(mongoUri);

  // Drop old invalid indexes to prevent parallel array index errors
  try {
    await mongoose.connection.collection('sessions').dropIndexes();
  } catch (e) {}
  try {
    await mongoose.connection.collection('recommendationprofiles').dropIndexes();
  } catch (e) {}
  try {
    await mongoose.connection.collection('careerroadmaps').dropIndexes();
  } catch (e) {}

  const passwordHash = await bcrypt.hash(password, 10);
  const users = {};

  for (const seed of accountSeeds) {
    users[seed.key] = await upsertUser(seed, passwordHash);
  }

  await Promise.all([
    Post.deleteMany({ tags: seedTag }),
    Reply.deleteMany({ content: new RegExp(seedTag) }),
    Session.deleteMany({ title: new RegExp('Demo:', 'i') }),
    PortfolioProject.deleteMany({ projectReflections: new RegExp(seedTag) }),
    VerifiedAchievement.deleteMany({ description: new RegExp(seedTag) }),
    Endorsement.deleteMany({ message: new RegExp(seedTag) }),
    PingRequest.deleteMany({ context: new RegExp(seedTag) }),
    CareerRoadmap.deleteMany({ domain: seedTag }),
    RoadmapSection.deleteMany({}),
    RoadmapStep.deleteMany({}),
    UserProgress.deleteMany({}),
    Notification.deleteMany({ message: new RegExp('Demo:', 'i') }),
  ]);

  const posts = await Post.insertMany([
    {
      title: 'How should I prepare for my first full-stack internship?',
      content:
        'I know React basics and can build small APIs. What should I focus on over the next 8 weeks to become internship-ready?',
      authorId: users.student._id,
      category: PostCategory.CAREER,
      tags: ['internship', 'full-stack', seedTag],
      upvotes: 14,
      voters: [
        { userId: users.guide._id, vote: 1 },
        { userId: users.pathfinder._id, vote: 1 },
      ],
      viewCount: 86,
    },
    {
      title: 'Best way to learn MongoDB schema design?',
      content:
        'I can do basic CRUD, but I am unsure when to embed documents and when to reference them. Any practical examples?',
      authorId: users.student._id,
      category: PostCategory.SKILLS,
      tags: ['mongodb', 'backend', seedTag],
      upvotes: 9,
      voters: [{ userId: users.pathfinder._id, vote: 1 }],
      viewCount: 48,
    },
    {
      title: 'Portfolio review checklist for junior developers',
      content:
        'Here is a checklist I use with mentees: clear README, live demo, problem statement, tradeoffs, screenshots, and measurable outcomes.',
      authorId: users.guide._id,
      category: PostCategory.EDUCATION,
      tags: ['portfolio', 'career', seedTag],
      upvotes: 31,
      isPinned: true,
      viewCount: 142,
    },
  ]);

  const replies = await Reply.insertMany([
    {
      postId: posts[0]._id,
      authorId: users.guide._id,
      content:
        'Focus on one polished project, Git/GitHub fluency, API integration, and explaining your decisions clearly. Build in public weekly. demo-seed',
      upvotes: 11,
    },
    {
      postId: posts[0]._id,
      authorId: users.pathfinder._id,
      content:
        'Add tests around your API and document the deployment steps. Interviewers love seeing practical ownership. demo-seed',
      upvotes: 7,
    },
    {
      postId: posts[1]._id,
      authorId: users.pathfinder._id,
      content:
        'Embed data that is read together and does not grow without bounds. Reference data that has independent lifecycle or many-to-many access. demo-seed',
      upvotes: 13,
    },
  ]);

  posts[0].isSolved = true;
  posts[0].solutionReplyId = replies[0]._id;
  await posts[0].save();

  const now = Date.now();
  await Session.insertMany([
    {
      guideId: users.guide._id,
      title: 'Demo: Portfolio teardown for internship applications',
      topic: 'Portfolio Review',
      description: 'A focused review of project positioning, README quality, and recruiter-facing polish.',
      scheduledAt: new Date(now + 3 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      price: 0,
      status: SessionStatus.OPEN,
      meetingLink: 'https://meet.example.com/demo-portfolio',
    },
    {
      guideId: users.pathfinder._id,
      clientId: users.student._id,
      title: 'Demo: Backend roadmap planning',
      topic: 'Backend Development',
      description: 'Plan a practical route through Node.js, MongoDB, auth, testing, and deployment.',
      scheduledAt: new Date(now + 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      price: 299,
      status: SessionStatus.BOOKED,
      meetingLink: 'https://meet.example.com/demo-backend',
    },
    {
      guideId: users.guide._id,
      clientId: users.student._id,
      title: 'Demo: React project review',
      topic: 'Frontend Development',
      description: 'Completed session with notes on state management and component structure.',
      scheduledAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
      durationMinutes: 30,
      price: 199,
      status: SessionStatus.COMPLETED,
      rating: 5,
      review: 'Clear, practical feedback with next steps.',
    },
  ]);

  await PingRequest.insertMany([
    {
      fromUserId: users.student._id,
      toUserId: users.guide._id,
      question: 'Can you suggest one project idea that combines React and APIs?',
      context: 'demo-seed: Aarav is preparing a portfolio for internships.',
      status: PingStatus.ANSWERED,
      response:
        'Build a learning tracker with saved roadmaps, progress charts, and a tiny recommendation API. Keep the scope tight and polished.',
      responseRating: 5,
      expiresAt: new Date(now + 48 * 60 * 60 * 1000),
    },
    {
      fromUserId: users.student._id,
      toUserId: users.pathfinder._id,
      question: 'Should I learn SQL before MongoDB?',
      context: 'demo-seed: User is unsure which database path to take.',
      status: PingStatus.PENDING,
      expiresAt: new Date(now + 48 * 60 * 60 * 1000),
    },
  ]);

  const roadmap = await CareerRoadmap.create({
    createdBy: users.pathfinder._id,
    title: 'Backend Developer Starter Roadmap',
    slug: 'backend-developer-starter-roadmap',
    description: 'A practical path from JavaScript basics to production-ready Node.js APIs.',
    targetRole: 'Junior Backend Developer',
    domain: seedTag,
    estimatedWeeks: 10,
    isPublic: true,
    followerCount: 24,
  });

  const section = await RoadmapSection.create({
    roadmapId: roadmap._id,
    title: 'Foundations',
    order: 0,
  });

  const steps = await RoadmapStep.insertMany([
    {
      roadmapId: roadmap._id,
      sectionId: section._id,
      title: 'JavaScript and TypeScript foundations',
      description: 'Refresh async JavaScript, modules, types, and error handling.',
      type: 'external resource',
      resources: [
        { type: 'link', title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org' },
        { type: 'link', title: 'TypeScript Handbook', url: 'https://typescriptlang.org' }
      ],
      estimatedMinutes: 120,
      order: 0,
      isOptional: false,
    },
    {
      roadmapId: roadmap._id,
      sectionId: section._id,
      title: 'Build REST APIs with Express',
      description: 'Create routes, controllers, services, validation, and central error handling.',
      type: 'external resource',
      resources: [
        { type: 'link', title: 'Express documentation', url: 'https://expressjs.com' },
        { type: 'link', title: 'Zod documentation', url: 'https://zod.dev' }
      ],
      estimatedMinutes: 180,
      order: 1,
      isOptional: false,
    },
    {
      roadmapId: roadmap._id,
      sectionId: section._id,
      title: 'Model data with MongoDB',
      description: 'Practice schema design, indexes, references, and aggregation basics.',
      type: 'external resource',
      resources: [
        { type: 'link', title: 'MongoDB University', url: 'https://university.mongodb.com' }
      ],
      estimatedMinutes: 120,
      order: 2,
      isOptional: false,
    },
    {
      roadmapId: roadmap._id,
      sectionId: section._id,
      title: 'Authentication and deployment',
      description: 'Add JWT auth, refresh tokens, environment config, logging, and deployment.',
      type: 'external resource',
      resources: [
        { type: 'link', title: 'JWT.io introduction', url: 'https://jwt.io' }
      ],
      estimatedMinutes: 150,
      order: 3,
      isOptional: false,
    }
  ]);

  await UserProgress.create({
    userId: users.student._id,
    roadmapId: roadmap._id,
    completedSteps: [steps[0]._id, steps[1]._id],
    progressPercentage: 50,
  });

  await Notification.insertMany([
    {
      recipientId: users.student._id,
      type: NotificationType.POST_REPLY,
      title: 'New Reply Received',
      message: 'Demo: Meera replied to your internship preparation question.',
      read: false,
    },
    {
      recipientId: users.guide._id,
      type: NotificationType.PING_RECEIVED,
      title: 'New Question Received',
      message: 'Demo: Aarav sent you a portfolio project question.',
      read: true,
    },
    {
      recipientId: users.student._id,
      type: NotificationType.SESSION_BOOKED,
      title: 'Mentorship Session Booked',
      message: 'Demo: Your backend roadmap planning session is booked.',
      read: false,
    },
  ]);

  // ── Credibility Seed Data ────────────────────────────────────────────────────

  // Portfolio Projects
  const portfolioProjects = await PortfolioProject.insertMany([
    {
      userId: users.student._id,
      title: 'PathTracker — Learning Progress Dashboard',
      description:
        'A full-stack React + Express app that lets learners track their roadmap progress, set weekly goals, and visualize growth trends with interactive charts.',
      images: [],
      githubLink: 'https://github.com/aarav-demo/pathtracker',
      demoLink: 'https://pathtracker-demo.vercel.app',
      technologies: ['React', 'TypeScript', 'Express', 'MongoDB', 'Chart.js'],
      domains: ['web development', 'full-stack'],
      isMentorReviewed: true,
      reviewedBy: users.guide._id,
      mentorReviewNotes:
        'Clean architecture with proper separation of concerns. README is excellent and recruiter-ready. Suggested adding error boundaries and loading skeletons.',
      projectReflections:
        'This project taught me how to structure a real full-stack app from scratch. I learned the importance of API design and responsive data visualization. demo-seed',
      learningOutcomes: [
        'REST API design with Express',
        'React state management patterns',
        'MongoDB schema design for analytics',
        'Deployment to Vercel + Render',
      ],
    },
    {
      userId: users.student._id,
      title: 'QuickPoll — Real-time Polling App',
      description:
        'A lightweight polling app with WebSocket support for live vote counts. Built to practice real-time data patterns.',
      images: [],
      githubLink: 'https://github.com/aarav-demo/quickpoll',
      technologies: ['React', 'Socket.io', 'Node.js'],
      domains: ['web development'],
      isMentorReviewed: false,
      projectReflections:
        'Learned WebSocket basics and how to handle concurrency in real-time apps. Still needs polish before portfolio-ready. demo-seed',
      learningOutcomes: [
        'WebSocket communication patterns',
        'Optimistic UI updates',
      ],
    },
  ]);

  // Verified Achievements
  const crypto = require('crypto');
  const makeCredentialId = (userId, category, idx) => {
    const raw = `${userId}-${category}-${Date.now()}-${idx}`;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
  };

  await VerifiedAchievement.insertMany([
    {
      userId: users.student._id,
      type: 'certificate',
      category: 'roadmap_completion',
      title: 'Backend Developer Starter Roadmap — Completed',
      description:
        'Verified completion of the Backend Developer Starter Roadmap covering JavaScript/TS foundations, REST APIs, MongoDB, and deployment. demo-seed',
      issuedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      credentialId: makeCredentialId(users.student._id, 'roadmap_completion', 1),
      metadata: { roadmapTitle: 'Backend Developer Starter Roadmap' },
    },
    {
      userId: users.student._id,
      type: 'badge',
      category: 'learning_streak',
      title: '30-Day Learning Streak',
      description:
        'Maintained consistent daily learning activity for 30 consecutive days across roadmaps and sessions. demo-seed',
      issuedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      credentialId: makeCredentialId(users.student._id, 'learning_streak', 2),
    },
    {
      userId: users.student._id,
      type: 'badge',
      category: 'mentorship_milestone',
      title: 'First Mentor Session Completed',
      description:
        'Completed the first one-on-one mentorship session, receiving structured career guidance and feedback. demo-seed',
      issuedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      credentialId: makeCredentialId(users.student._id, 'mentorship_milestone', 3),
    },
    {
      userId: users.guide._id,
      type: 'certificate',
      category: 'specialization',
      title: 'Frontend Engineering Specialization',
      description:
        'Recognized specialization in frontend engineering based on mentorship contributions, roadmap authoring, and community impact. demo-seed',
      issuedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      credentialId: makeCredentialId(users.guide._id, 'specialization', 4),
    },
  ]);

  // Endorsements (mentor → learner)
  await Endorsement.insertMany([
    {
      endorserId: users.guide._id,
      recipientId: users.student._id,
      type: 'project',
      projectId: portfolioProjects[0]._id,
      message:
        'Aarav demonstrated exceptional growth during our portfolio review sessions. His PathTracker project shows strong architectural thinking and clean code. Ready for internship-level work. demo-seed',
      moderationStatus: 'approved',
    },
    {
      endorserId: users.pathfinder._id,
      recipientId: users.student._id,
      type: 'skill',
      skillName: 'API Design',
      message:
        'Aarav grasped REST API patterns quickly and applied them independently in his projects. Good understanding of error handling and validation. demo-seed',
      moderationStatus: 'approved',
    },
  ]);

  console.log('\n── Credibility Data ─────────────────────────────────────────');
  console.log(`  Portfolio projects: ${portfolioProjects.length}`);
  console.log(`  Verified achievements: 4`);
  console.log(`  Endorsements: 2`);
  console.log(`  Public profiles: /u/aarav-sharma, /u/meera-iyer, /u/rohan-verma`);

  console.log('\nDummy data seeded successfully.');
  console.log(`MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log('\nLogin credentials:');
  for (const seed of accountSeeds) {
    console.log(`${seed.name} (${seed.role})`);
    console.log(`  Email: ${seed.email}`);
    console.log(`  Password: ${password}`);
  }

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed dummy data:', error);
  await mongoose.disconnect();
  process.exit(1);
});
