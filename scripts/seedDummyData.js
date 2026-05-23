require('ts-node/register');
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Role, EducationLevel, GuideRank } = require('../src/modules/users/user.model');
const { Post, PostCategory } = require('../src/modules/posts/post.model');
const { Reply } = require('../src/modules/posts/reply.model');
const { Session, SessionStatus } = require('../src/modules/sessions/session.model');
const { PingRequest, PingStatus } = require('../src/modules/pings/ping.model');
const { CareerRoadmap } = require('../src/modules/roadmaps/roadmap.model');
const { UserProgress } = require('../src/modules/roadmaps/userProgress.model');
const { Notification, NotificationType } = require('../src/modules/notifications/notification.model');

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
        skills: seed.skills,
        interests: seed.interests,
        respectPoints: seed.respectPoints,
        fameScore: seed.fameScore,
        guideRank: seed.guideRank || GuideRank.RISING,
        isVerified: true,
        isBanned: false,
        pingAvailable: true,
        socialLinks: seed.socialLinks || {},
      },
    },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  );
}

async function run() {
  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash(password, 10);
  const users = {};

  for (const seed of accountSeeds) {
    users[seed.key] = await upsertUser(seed, passwordHash);
  }

  await Promise.all([
    Post.deleteMany({ tags: seedTag }),
    Reply.deleteMany({ content: new RegExp(seedTag) }),
    Session.deleteMany({ title: new RegExp('Demo:', 'i') }),
    PingRequest.deleteMany({ context: new RegExp(seedTag) }),
    CareerRoadmap.deleteMany({ domain: seedTag }),
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
    description: 'A practical path from JavaScript basics to production-ready Node.js APIs.',
    targetRole: 'Junior Backend Developer',
    domain: seedTag,
    estimatedWeeks: 10,
    isPublic: true,
    followerCount: 24,
    steps: [
      {
        title: 'JavaScript and TypeScript foundations',
        description: 'Refresh async JavaScript, modules, types, and error handling.',
        resources: ['MDN JavaScript Guide', 'TypeScript Handbook'],
        milestoneCheck: true,
      },
      {
        title: 'Build REST APIs with Express',
        description: 'Create routes, controllers, services, validation, and central error handling.',
        resources: ['Express documentation', 'Zod documentation'],
        milestoneCheck: true,
      },
      {
        title: 'Model data with MongoDB',
        description: 'Practice schema design, indexes, references, and aggregation basics.',
        resources: ['MongoDB University', 'Mongoose docs'],
        milestoneCheck: false,
      },
      {
        title: 'Authentication and deployment',
        description: 'Add JWT auth, refresh tokens, environment config, logging, and deployment.',
        resources: ['JWT.io introduction', 'Render deployment docs'],
        milestoneCheck: false,
      },
    ],
  });

  await UserProgress.create({
    userId: users.student._id,
    roadmapId: roadmap._id,
    completedSteps: [0, 1],
    progressPercentage: 50,
  });

  await Notification.insertMany([
    {
      userId: users.student._id,
      type: NotificationType.POST_REPLY,
      message: 'Demo: Meera replied to your internship preparation question.',
      link: `/posts/${posts[0]._id}`,
      isRead: false,
    },
    {
      userId: users.guide._id,
      type: NotificationType.PING_RECEIVED,
      message: 'Demo: Aarav sent you a portfolio project question.',
      link: '/pings',
      isRead: true,
    },
    {
      userId: users.student._id,
      type: NotificationType.SESSION_BOOKED,
      message: 'Demo: Your backend roadmap planning session is booked.',
      link: '/sessions',
      isRead: false,
    },
  ]);

  console.log('Dummy data seeded successfully.');
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
