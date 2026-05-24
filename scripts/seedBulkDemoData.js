require('ts-node/register');
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Role, EducationLevel, GuideRank } = require('../src/modules/users/user.model');
const { Post, PostCategory } = require('../src/modules/posts/post.model');
const { Reply } = require('../src/modules/posts/reply.model');
const {
  Session,
  SessionStatus,
  SessionType,
  RegistrationMode,
  SessionCategory,
  AttendanceStatus,
  SessionExecutionState,
} = require('../src/modules/sessions/session.model');
const { PingRequest, PingStatus } = require('../src/modules/pings/ping.model');
const { CareerRoadmap, RoadmapSection, RoadmapStep } = require('../src/modules/roadmaps/roadmap.model');
const { UserProgress } = require('../src/modules/roadmaps/userProgress.model');
const { Notification, NotificationType } = require('../src/modules/notifications/notification.model');
const { Review } = require('../src/modules/reviews/review.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const seedTag = process.env.BULK_SEED_TAG || 'bulk-demo-seed';
const password = process.env.BULK_DEMO_PASSWORD || 'DemoPass123!';

const counts = {
  guides: Number(process.env.BULK_GUIDES || 24),
  students: Number(process.env.BULK_STUDENTS || 160),
  roadmaps: Number(process.env.BULK_ROADMAPS || 36),
  posts: Number(process.env.BULK_POSTS || 420),
  sessions: Number(process.env.BULK_SESSIONS || 220),
  pings: Number(process.env.BULK_PINGS || 260),
  notifications: Number(process.env.BULK_NOTIFICATIONS || 900),
};

const domains = [
  'Frontend Development',
  'Backend Development',
  'DevOps',
  'System Design',
  'Data Science',
  'AI Engineering',
  'Cybersecurity',
  'Product Design',
];

const skillsByDomain = {
  'Frontend Development': ['React', 'TypeScript', 'Accessibility', 'TailwindCSS', 'Performance'],
  'Backend Development': ['Node.js', 'Express', 'MongoDB', 'API Design', 'Testing'],
  DevOps: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD'],
  'System Design': ['Scalability', 'Caching', 'Queues', 'Databases', 'Observability'],
  'Data Science': ['Python', 'Pandas', 'Statistics', 'Visualization', 'ML Basics'],
  'AI Engineering': ['LLMs', 'RAG', 'Embeddings', 'Evaluation', 'Prompting'],
  Cybersecurity: ['Threat Modeling', 'OWASP', 'Network Security', 'IAM', 'Incident Response'],
  'Product Design': ['Figma', 'UX Research', 'Design Systems', 'Prototyping', 'Usability'],
};

const firstNames = [
  'Aarav', 'Meera', 'Rohan', 'Nisha', 'Dev', 'Sarah', 'Elena', 'Kabir', 'Ananya', 'Vihaan',
  'Ishaan', 'Priya', 'Arjun', 'Maya', 'Neel', 'Tara', 'Zoya', 'Kiran', 'Reyansh', 'Aisha',
];

const lastNames = [
  'Sharma', 'Iyer', 'Kapoor', 'Rao', 'Verma', 'Mehta', 'Nair', 'Singh', 'Patel', 'Das',
  'Menon', 'Joshi', 'Khan', 'Bose', 'Gupta', 'Reddy', 'Malhotra', 'Chawla', 'Sen', 'Kulkarni',
];

const roadmapSubjects = [
  'Production React Systems',
  'Node API Engineering',
  'Cloud Infrastructure',
  'MongoDB Performance',
  'System Design Interviews',
  'AI Product Engineering',
  'Secure Web Applications',
  'Data Analytics Foundations',
  'Design Systems for Developers',
  'Open Source Portfolio',
];

const postPrompts = [
  'How do I turn this project into something portfolio-worthy?',
  'What should I learn next if I already know the basics?',
  'Can someone explain the tradeoff here in practical terms?',
  'What is the right way to debug this in production?',
  'How should I prepare for internship interviews?',
  'What would a senior engineer expect in this feature?',
  'How do I structure my learning for the next six weeks?',
  'Which deployment mistake should I fix first?',
];

const pick = (items, index) => items[index % items.length];
const rand = (max, offset = 0) => (offset * 9301 + 49297) % max;
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function dateFromNow(days, hours = 0) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000);
}

async function cleanupPreviousSeed() {
  const users = await User.find({ email: new RegExp(`@${seedTag}\\.ascendpath\\.dev$`) }).select('_id');
  const userIds = users.map((user) => user._id);
  const roadmaps = await CareerRoadmap.find({ tags: seedTag }).select('_id');
  const roadmapIds = roadmaps.map((roadmap) => roadmap._id);
  const posts = await Post.find({ tags: seedTag }).select('_id');
  const postIds = posts.map((post) => post._id);
  const sessions = await Session.find({ tags: seedTag }).select('_id');
  const sessionIds = sessions.map((session) => session._id);

  await Promise.all([
    Review.deleteMany({
      $or: [
        { sessionId: { $in: sessionIds } },
        { reviewText: new RegExp(seedTag) },
      ],
    }),
    Reply.deleteMany({ postId: { $in: postIds } }),
    Post.deleteMany({ _id: { $in: postIds } }),
    PingRequest.deleteMany({
      $or: [
        { fromUserId: { $in: userIds } },
        { toUserId: { $in: userIds } },
        { context: new RegExp(seedTag) },
      ],
    }),
    Notification.deleteMany({ 'metadata.seedTag': seedTag }),
    UserProgress.deleteMany({
      $or: [
        { userId: { $in: userIds } },
        { roadmapId: { $in: roadmapIds } },
      ],
    }),
    RoadmapStep.deleteMany({ roadmapId: { $in: roadmapIds } }),
    RoadmapSection.deleteMany({ roadmapId: { $in: roadmapIds } }),
    Session.deleteMany({ _id: { $in: sessionIds } }),
  ]);

  await CareerRoadmap.deleteMany({ _id: { $in: roadmapIds } });
  await User.deleteMany({ _id: { $in: userIds } });
}

async function seedUsers(passwordHash) {
  const users = [];
  const total = counts.guides + counts.students;

  for (let i = 0; i < total; i += 1) {
    const isGuide = i < counts.guides;
    const domain = pick(domains, i);
    const name = `${pick(firstNames, i)} ${pick(lastNames, i * 3)}`;
    const role = isGuide ? Role.GUIDE : Role.EXPLORER;
    const skills = skillsByDomain[domain].slice(0, 4).map((skill, skillIndex) => ({
      name: skill,
      level: isGuide ? pick(['Intermediate', 'Advanced', 'Expert'], skillIndex + i) : pick(['Beginner', 'Intermediate'], skillIndex + i),
      years: isGuide ? 2 + ((i + skillIndex) % 7) : (i + skillIndex) % 2,
    }));

    users.push({
      name,
      email: `${slugify(name)}-${i}@${seedTag}.ascendpath.dev`,
      passwordHash,
      role,
      roles: [role],
      capabilities: isGuide ? ['sessions:create', 'roadmaps:create', 'pings:answer'] : [],
      mentorProfileStatus: isGuide ? 'approved' : 'none',
      educationLevel: isGuide ? EducationLevel.PROFESSIONAL : pick([EducationLevel.SCHOOL, EducationLevel.COLLEGE, EducationLevel.PROFESSIONAL], i),
      bio: isGuide
        ? `${domain} guide helping learners build production-grade projects and career confidence. ${seedTag}`
        : `Learner focused on ${domain}, practical projects, and interview readiness. ${seedTag}`,
      domains: [domain, pick(domains, i + 2)],
      skills,
      interests: [domain.toLowerCase(), 'mentorship', 'projects'],
      avatar: `https://i.pravatar.cc/150?u=${seedTag}-${i}`,
      isVerified: true,
      pingAvailable: isGuide,
      respectPoints: isGuide ? 250 + i * 19 : 5 + i * 3,
      fameScore: isGuide ? 45 + (i % 50) : i % 25,
      guideRank: isGuide ? pick(Object.values(GuideRank), i) : GuideRank.RISING,
      totalSessions: isGuide ? 4 + (i % 35) : 0,
      averageRating: isGuide ? Number((4.2 + (i % 8) / 10).toFixed(2)) : 0,
      totalReviews: isGuide ? 2 + (i % 18) : 0,
      profileVisibility: true,
      onboardingCompleted: true,
      onboarding: {
        primaryGoal: isGuide ? 'mentor_learners' : 'get_job_ready',
        experienceLevel: isGuide ? 'advanced' : pick(['beginner', 'intermediate'], i),
        targetRole: `${domain} ${isGuide ? 'Mentor' : 'Developer'}`,
        interestedDomains: [domain],
        preferredLearningStyle: pick(['projects', 'sessions', 'reading', 'videos'], i),
        weeklyCommitmentHours: 4 + (i % 16),
      },
      availability: isGuide
        ? {
            text: 'Weekday evenings and selected weekend slots',
            schedule: [
              { day: pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday'], i), slots: ['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'] },
              { day: 'Saturday', slots: ['10:00 AM - 11:00 AM', '2:00 PM - 3:00 PM'] },
            ],
          }
        : undefined,
    });
  }

  return User.insertMany(users, { ordered: false });
}

async function seedRoadmaps(guides, students) {
  const roadmaps = [];
  const sections = [];
  const steps = [];
  const progress = [];

  for (let i = 0; i < counts.roadmaps; i += 1) {
    const domain = pick(domains, i);
    const subject = pick(roadmapSubjects, i);
    const roadmapId = new mongoose.Types.ObjectId();
    const guide = guides[i % guides.length];
    const title = `${subject}: ${domain} Track ${i + 1}`;

    roadmaps.push({
      _id: roadmapId,
      title,
      slug: `${slugify(title)}-${seedTag}`,
      description: `A practical, mentor-backed path through ${domain} with projects, checkpoints, and production habits.`,
      thumbnail: `https://source.unsplash.com/800x500/?technology,${encodeURIComponent(domain)}`,
      domains: [domain],
      tags: [seedTag, domain, ...skillsByDomain[domain].slice(0, 3)],
      difficulty: pick(['beginner', 'intermediate', 'advanced'], i),
      estimatedWeeks: 6 + (i % 14),
      createdBy: guide._id,
      enrollmentCount: 12 + (i * 7) % 180,
      averageRating: Number((4.1 + (i % 9) / 10).toFixed(1)),
      isPublished: true,
      prerequisites: ['Basic programming familiarity', 'Willingness to build weekly'],
      learningOutcomes: [
        `Build portfolio-ready ${domain} projects`,
        'Explain tradeoffs clearly in interviews',
        'Debug and deploy with production discipline',
      ],
      visibility: 'public',
      isPublic: true,
      targetRole: `${domain} Engineer`,
      domain,
      followerCount: 20 + i * 4,
    });

    for (let s = 0; s < 4; s += 1) {
      const sectionId = new mongoose.Types.ObjectId();
      sections.push({
        _id: sectionId,
        roadmapId,
        title: `${s + 1}. ${pick(['Foundations', 'Core Practice', 'Production Skills', 'Capstone'], s)}`,
        description: `Focused ${domain} learning block with applied tasks and mentor checkpoints.`,
        order: s,
      });

      for (let t = 0; t < 5; t += 1) {
        const stepId = new mongoose.Types.ObjectId();
        steps.push({
          _id: stepId,
          roadmapId,
          sectionId,
          title: `${pick(skillsByDomain[domain], t)} ${pick(['Deep Dive', 'Lab', 'Project', 'Review', 'Challenge'], t + s)}`,
          description: `Practice ${pick(skillsByDomain[domain], t)} through a realistic task, then document tradeoffs and next steps.`,
          type: pick(['article', 'video', 'project', 'assignment', 'quiz', 'external resource'], t + s),
          resources: [
            { type: 'article', title: `${domain} reference notes`, url: 'https://example.com/reference' },
            { type: 'project', title: `${domain} implementation checklist`, url: 'https://example.com/checklist' },
          ],
          estimatedMinutes: 20 + ((i + s + t) % 6) * 15,
          difficulty: pick(['beginner', 'intermediate', 'advanced'], i + s + t),
          order: t,
          isOptional: t === 4,
        });
      }
    }

    for (let e = 0; e < Math.min(6, students.length); e += 1) {
      const student = students[(i + e) % students.length];
      const roadmapSteps = steps.filter((step) => step.roadmapId.equals(roadmapId));
      progress.push({
        userId: student._id,
        roadmapId,
        completedSteps: roadmapSteps.slice(0, (e % 5) + 1).map((step) => step._id),
        progressPercentage: 5 + e * 15,
        startedAt: dateFromNow(-30 + e),
        lastActiveAt: dateFromNow(-e),
        streakCount: e + 1,
        notes: new Map([[roadmapSteps[0]._id.toString(), `First checkpoint note from ${seedTag}.`]]),
        bookmarkedSteps: [roadmapSteps[roadmapSteps.length - 1]._id],
      });
    }
  }

  await CareerRoadmap.insertMany(roadmaps, { ordered: false });
  await RoadmapSection.insertMany(sections, { ordered: false });
  await RoadmapStep.insertMany(steps, { ordered: false });
  await UserProgress.insertMany(progress, { ordered: false });

  return roadmaps;
}

async function seedPostsAndReplies(users, guides, students) {
  const posts = [];
  for (let i = 0; i < counts.posts; i += 1) {
    const author = users[i % users.length];
    const domain = pick(domains, i);
    const upvotes = 1 + (i % 80);
    posts.push({
      title: `${pick(postPrompts, i)} (${domain})`,
      content: `I am working through ${domain} and want practical advice from people who have built real systems. Context marker: ${seedTag}.`,
      authorId: author._id,
      category: pick(Object.values(PostCategory), i),
      tags: [seedTag, domain, pick(skillsByDomain[domain], i)],
      upvotes,
      downvotes: i % 7 === 0 ? 1 : 0,
      voters: students.slice(0, Math.min(8, students.length)).map((student, voterIndex) => ({
        userId: student._id,
        vote: voterIndex % 6 === 0 ? -1 : 1,
      })),
      viewCount: 25 + i * 3,
      isPinned: i % 60 === 0,
      isResolved: i % 3 === 0,
      isSolved: i % 3 === 0,
      resolvedAt: i % 3 === 0 ? dateFromNow(-(i % 20)) : undefined,
      resolvedBy: i % 3 === 0 ? author._id : undefined,
    });
  }

  const createdPosts = await Post.insertMany(posts, { ordered: false });
  const replies = [];

  createdPosts.forEach((post, i) => {
    const replyCount = 2 + (i % 4);
    for (let r = 0; r < replyCount; r += 1) {
      const guide = guides[(i + r) % guides.length];
      replies.push({
        postId: post._id,
        authorId: guide._id,
        content: `For this ${pick(domains, i)} question, start with the smallest reproducible version, write down your assumptions, and ship one visible milestone. ${seedTag} reply ${r + 1}.`,
        upvotes: 1 + ((i + r) % 25),
      });
    }
  });

  const createdReplies = await Reply.insertMany(replies, { ordered: false });

  const updates = createdPosts
    .filter((post, i) => i % 3 === 0)
    .map((post, i) => {
      const accepted = createdReplies.find((reply) => reply.postId.equals(post._id));
      return accepted
        ? Post.updateOne({ _id: post._id }, { acceptedReplyId: accepted._id, solutionReplyId: accepted._id })
        : null;
    })
    .filter(Boolean);

  await Promise.all(updates);
  return createdPosts;
}

async function seedSessionsAndReviews(guides, students, roadmaps) {
  const sessions = [];

  for (let i = 0; i < counts.sessions; i += 1) {
    const guide = guides[i % guides.length];
    const student = students[i % students.length];
    const domain = pick(domains, i);
    const isPublic = i % 4 !== 0;
    const isCompleted = i % 5 === 0;
    const roadmap = roadmaps[i % roadmaps.length];

    sessions.push({
      guideId: guide._id,
      clientId: isPublic ? undefined : student._id,
      sessionType: isPublic ? SessionType.PUBLIC_WORKSHOP : SessionType.PRIVATE_MENTORSHIP,
      title: `${seedTag}: ${pick(skillsByDomain[domain], i)} ${isPublic ? 'Workshop' : 'Mentorship'} ${i + 1}`,
      topic: domain,
      description: `A realistic ${domain} session with practical exercises, diagnostics, and next steps.`,
      domains: [domain],
      tags: [seedTag, domain],
      difficulty: pick(['beginner', 'intermediate', 'advanced'], i),
      scheduledAt: isCompleted ? dateFromNow(-(i % 45), i % 12) : dateFromNow((i % 45) + 1, i % 12),
      durationMinutes: pick([30, 45, 60, 90], i),
      price: isPublic ? 0 : 199 + (i % 6) * 100,
      status: isCompleted ? SessionStatus.COMPLETED : pick([SessionStatus.OPEN, SessionStatus.SCHEDULED, SessionStatus.REGISTRATION_OPEN], i),
      isPublic,
      capacity: isPublic ? 20 + (i % 50) : undefined,
      attendeeCount: isPublic ? 2 + (i % 18) : 0,
      roadmapId: roadmap._id,
      registrationMode: RegistrationMode.OPEN,
      sessionCategory: pick(Object.values(SessionCategory), i),
      resources: [
        { title: `${domain} prep notes`, url: 'https://example.com/session-prep', type: 'article' },
      ],
      meetingLink: `https://meet.jit.si/ascendpath-${seedTag}-${i}`,
      meetingUrl: `https://meet.jit.si/ascendpath-${seedTag}-${i}`,
      meetingRoomId: `ascendpath-${seedTag}-${i}`,
      attendanceStatus: isCompleted ? AttendanceStatus.COMPLETED : AttendanceStatus.SCHEDULED,
      sessionExecutionState: isCompleted ? SessionExecutionState.REFLECTION_UNLOCKED : SessionExecutionState.SCHEDULED,
      rating: isCompleted ? 4 + (i % 2) : undefined,
      review: isCompleted ? `Practical session with clear next steps. ${seedTag}` : undefined,
    });
  }

  const createdSessions = await Session.insertMany(sessions, { ordered: false });
  const completed = createdSessions.filter((session) => session.status === SessionStatus.COMPLETED);
  const reviews = completed.map((session, i) => ({
    reviewerId: session.clientId || students[i % students.length]._id,
    guideId: session.guideId,
    sessionId: session._id,
    rating: 4 + (i % 2),
    reviewText: `Useful, specific, and grounded in practical engineering work. ${seedTag} review ${i + 1}.`,
    tags: [pick(['Helpful', 'Practical', 'Deep Technical Knowledge', 'Good Communication'], i), seedTag],
    sentiment: 'positive',
    isVerified: true,
    moderationStatus: 'approved',
  }));

  const createdReviews = await Review.insertMany(reviews, { ordered: false });
  await Promise.all(
    createdReviews.map((review) =>
      Session.updateOne({ _id: review.sessionId }, { reviewId: review._id, rating: review.rating, review: review.reviewText })
    )
  );

  return createdSessions;
}

async function seedPings(students, guides) {
  const pings = [];
  for (let i = 0; i < counts.pings; i += 1) {
    const answered = i % 3 !== 0;
    const domain = pick(domains, i);
    pings.push({
      fromUserId: students[i % students.length]._id,
      toUserId: guides[(i * 2) % guides.length]._id,
      question: `What is one practical next step for ${domain} this week?`,
      context: `${seedTag}: learner is building momentum in ${domain}.`,
      status: answered ? PingStatus.ANSWERED : PingStatus.PENDING,
      response: answered ? `Pick one small deliverable, timebox it, and write a short decision log. ${seedTag}` : undefined,
      responseRating: answered ? 4 + (i % 2) : undefined,
      expiresAt: dateFromNow(2 + (i % 7)),
    });
  }

  return PingRequest.insertMany(pings, { ordered: false });
}

async function seedNotifications(users, posts, sessions, roadmaps) {
  const notifications = [];
  const types = Object.values(NotificationType);

  for (let i = 0; i < counts.notifications; i += 1) {
    const recipient = users[i % users.length];
    const actor = users[(i + 7) % users.length];
    const type = pick(types, i);
    const entity = pick([posts[i % posts.length], sessions[i % sessions.length], roadmaps[i % roadmaps.length]], i);
    notifications.push({
      recipientId: recipient._id,
      actorId: actor._id,
      type,
      entityId: entity._id,
      entityType: pick(['post', 'session', 'roadmap'], i),
      title: `Demo ${type.replace(/_/g, ' ')}`,
      message: `Seeded activity for dashboard, notification, and realtime UI testing. ${seedTag} #${i + 1}`,
      metadata: { seedTag, index: i },
      read: i % 4 === 0,
    });
  }

  return Notification.insertMany(notifications, { ordered: false });
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`Seeding tag: ${seedTag}`);

  await cleanupPreviousSeed();

  const passwordHash = await bcrypt.hash(password, 10);
  const users = await seedUsers(passwordHash);
  const guides = users.filter((user) => user.role === Role.GUIDE);
  const students = users.filter((user) => user.role === Role.EXPLORER);

  const roadmaps = await seedRoadmaps(guides, students);
  const posts = await seedPostsAndReplies(users, guides, students);
  const sessions = await seedSessionsAndReviews(guides, students, roadmaps);
  const pings = await seedPings(students, guides);
  const notifications = await seedNotifications(users, posts, sessions, roadmaps);

  console.log('\nBulk demo seed complete.');
  console.log(`Users: ${users.length} (${guides.length} guides, ${students.length} students)`);
  console.log(`Roadmaps: ${roadmaps.length}`);
  console.log(`Posts: ${posts.length}`);
  console.log(`Sessions: ${sessions.length}`);
  console.log(`Pings: ${pings.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`Password for all bulk users: ${password}`);
  console.log(`Example login: ${students[0].email}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed bulk demo data:', error);
  await mongoose.disconnect();
  process.exit(1);
});
