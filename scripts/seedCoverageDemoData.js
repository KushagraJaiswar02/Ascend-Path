require('ts-node/register');
require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Role, EducationLevel, GuideRank } = require('../src/modules/users/user.model');
const { RefreshToken } = require('../src/modules/auth/refresh-token.model');
const { Post, PostCategory } = require('../src/modules/posts/post.model');
const { Reply } = require('../src/modules/posts/reply.model');
const {
  Session,
  SessionStatus,
  SessionType,
  RegistrationMode,
  SessionCategory,
  MeetingProvider,
  AttendanceStatus,
  SessionExecutionState,
} = require('../src/modules/sessions/session.model');
const {
  SessionReflection,
  SessionReflectionStatus,
} = require('../src/modules/sessions/sessionReflection.model');
const { PingRequest, PingStatus } = require('../src/modules/pings/ping.model');
const { CareerRoadmap, RoadmapSection, RoadmapStep } = require('../src/modules/roadmaps/roadmap.model');
const { UserProgress } = require('../src/modules/roadmaps/userProgress.model');
const { Notification, NotificationType } = require('../src/modules/notifications/notification.model');
const { Review } = require('../src/modules/reviews/review.model');
const {
  Report,
  TargetType,
  ReportReason,
  ReportStatus,
  ReportPriority,
  ModeratorDecision,
} = require('../src/modules/moderation/report.model');
const {
  AuditLog,
  AuditAction,
  AuditSeverity,
} = require('../src/modules/moderation/auditLog.model');
const {
  MentorApplication,
  MentorApplicationStatus,
} = require('../src/modules/mentor-applications/mentorApplication.model');
const { RespectVote, RespectReason } = require('../src/modules/respect/respectVote.model');
const { ReputationAuditLog } = require('../src/modules/reputation/reputationAudit.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const seedTag = process.env.COVERAGE_SEED_TAG || 'coverage-demo-seed';
const password = process.env.COVERAGE_DEMO_PASSWORD || 'DemoPass123!';

const counts = {
  guides: Number(process.env.COVERAGE_GUIDES || 80),
  students: Number(process.env.COVERAGE_STUDENTS || 420),
  moderators: Number(process.env.COVERAGE_MODERATORS || 8),
  admins: Number(process.env.COVERAGE_ADMINS || 4),
  roadmaps: Number(process.env.COVERAGE_ROADMAPS || 140),
  posts: Number(process.env.COVERAGE_POSTS || 1600),
  sessions: Number(process.env.COVERAGE_SESSIONS || 900),
  pings: Number(process.env.COVERAGE_PINGS || 900),
  notifications: Number(process.env.COVERAGE_NOTIFICATIONS || 4000),
  mentorApplications: Number(process.env.COVERAGE_MENTOR_APPLICATIONS || 180),
  reports: Number(process.env.COVERAGE_REPORTS || 320),
  auditLogs: Number(process.env.COVERAGE_AUDIT_LOGS || 420),
  respectVotes: Number(process.env.COVERAGE_RESPECT_VOTES || 1200),
  reputationAudits: Number(process.env.COVERAGE_REPUTATION_AUDITS || 900),
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
  'Mobile Development',
  'Cloud Architecture',
  'Database Engineering',
  'Open Source',
];

const skillsByDomain = {
  'Frontend Development': ['React', 'TypeScript', 'Accessibility', 'TailwindCSS', 'Performance', 'Animation'],
  'Backend Development': ['Node.js', 'Express', 'MongoDB', 'API Design', 'Testing', 'Queues'],
  DevOps: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Terraform'],
  'System Design': ['Scalability', 'Caching', 'Queues', 'Databases', 'Observability', 'Resilience'],
  'Data Science': ['Python', 'Pandas', 'Statistics', 'Visualization', 'ML Basics', 'SQL'],
  'AI Engineering': ['LLMs', 'RAG', 'Embeddings', 'Evaluation', 'Prompting', 'Agents'],
  Cybersecurity: ['Threat Modeling', 'OWASP', 'Network Security', 'IAM', 'Incident Response', 'SIEM'],
  'Product Design': ['Figma', 'UX Research', 'Design Systems', 'Prototyping', 'Usability', 'A11y'],
  'Mobile Development': ['React Native', 'Expo', 'Offline Sync', 'App Store', 'Push Notifications', 'SQLite'],
  'Cloud Architecture': ['AWS', 'Load Balancing', 'Autoscaling', 'VPC', 'Cost Optimization', 'Monitoring'],
  'Database Engineering': ['Indexes', 'Aggregation', 'Replication', 'Sharding', 'Backups', 'Schema Design'],
  'Open Source': ['Git', 'Maintainers', 'Issues', 'Docs', 'Community', 'Release Notes'],
};

const firstNames = [
  'Aarav', 'Meera', 'Rohan', 'Nisha', 'Dev', 'Sarah', 'Elena', 'Kabir', 'Ananya', 'Vihaan',
  'Ishaan', 'Priya', 'Arjun', 'Maya', 'Neel', 'Tara', 'Zoya', 'Kiran', 'Reyansh', 'Aisha',
  'Aditya', 'Mira', 'Yash', 'Riya', 'Samar', 'Ira', 'Vivaan', 'Noor', 'Om', 'Leela',
];

const lastNames = [
  'Sharma', 'Iyer', 'Kapoor', 'Rao', 'Verma', 'Mehta', 'Nair', 'Singh', 'Patel', 'Das',
  'Menon', 'Joshi', 'Khan', 'Bose', 'Gupta', 'Reddy', 'Malhotra', 'Chawla', 'Sen', 'Kulkarni',
  'Saxena', 'Mishra', 'Bhat', 'Pillai', 'Jain', 'Roy', 'Agarwal', 'Dutta', 'Suri', 'Gill',
];

const pick = (items, index) => items[index % items.length];
const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const daysFromNow = (days, hours = 0) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000);

const oid = () => new mongoose.Types.ObjectId();

function uniqueByKey(items, keyFn) {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function cleanupCoverageSeed() {
  const users = await User.find({ email: new RegExp(`@${seedTag}\\.ascendpath\\.dev$`) }).select('_id');
  const userIds = users.map((user) => user._id);
  const roadmaps = await CareerRoadmap.find({ tags: seedTag }).select('_id');
  const roadmapIds = roadmaps.map((roadmap) => roadmap._id);
  const posts = await Post.find({ tags: seedTag }).select('_id');
  const postIds = posts.map((post) => post._id);
  const replies = await Reply.find({ content: new RegExp(seedTag) }).select('_id');
  const replyIds = replies.map((reply) => reply._id);
  const sessions = await Session.find({ tags: seedTag }).select('_id');
  const sessionIds = sessions.map((session) => session._id);
  const reviews = await Review.find({ reviewText: new RegExp(seedTag) }).select('_id');
  const reviewIds = reviews.map((review) => review._id);

  await Promise.all([
    RefreshToken.deleteMany({ user: { $in: userIds } }),
    SessionReflection.deleteMany({ sessionId: { $in: sessionIds } }),
    Review.deleteMany({ $or: [{ _id: { $in: reviewIds } }, { sessionId: { $in: sessionIds } }, { reviewText: new RegExp(seedTag) }] }),
    Report.deleteMany({ 'metadata.seedTag': seedTag }),
    AuditLog.deleteMany({ 'metadata.seedTag': seedTag }),
    MentorApplication.deleteMany({ userId: { $in: userIds } }),
    RespectVote.deleteMany({ voterId: { $in: userIds } }),
    ReputationAuditLog.deleteMany({ reason: new RegExp(seedTag) }),
    Notification.deleteMany({ 'metadata.seedTag': seedTag }),
    PingRequest.deleteMany({ context: new RegExp(seedTag) }),
    UserProgress.deleteMany({ $or: [{ userId: { $in: userIds } }, { roadmapId: { $in: roadmapIds } }] }),
    Reply.deleteMany({ $or: [{ _id: { $in: replyIds } }, { postId: { $in: postIds } }] }),
    Post.deleteMany({ _id: { $in: postIds } }),
    RoadmapStep.deleteMany({ roadmapId: { $in: roadmapIds } }),
    RoadmapSection.deleteMany({ roadmapId: { $in: roadmapIds } }),
    Session.deleteMany({ _id: { $in: sessionIds } }),
  ]);

  await CareerRoadmap.deleteMany({ _id: { $in: roadmapIds } });
  await User.deleteMany({ _id: { $in: userIds } });
}

async function seedUsers(passwordHash) {
  const users = [];
  const rolePlan = [
    ...Array.from({ length: counts.guides }, () => Role.GUIDE),
    ...Array.from({ length: counts.students }, () => Role.EXPLORER),
    ...Array.from({ length: counts.moderators }, () => Role.SENTINEL),
    ...Array.from({ length: counts.admins }, () => Role.ARCHITECT),
  ];

  rolePlan.forEach((role, i) => {
    const domain = pick(domains, i);
    const name = `${pick(firstNames, i)} ${pick(lastNames, i * 5)}`;
    const isGuide = role === Role.GUIDE || role === Role.ARCHITECT;
    const isAdmin = role === Role.ARCHITECT;
    const isModerator = role === Role.SENTINEL;
    const isSuspended = i % 97 === 0;
    const roles = isAdmin ? [Role.ARCHITECT, Role.ADMIN, Role.GUIDE] : isModerator ? [Role.SENTINEL, Role.MODERATOR] : [role];

    users.push({
      name,
      email: `${slugify(name)}-${i}@${seedTag}.ascendpath.dev`,
      passwordHash,
      role,
      roles,
      capabilities: isAdmin
        ? ['admin:*', 'moderation:read', 'moderation:write', 'roadmaps:create']
        : isModerator
          ? ['moderation:read', 'moderation:write', 'reports:assign']
          : isGuide
            ? ['sessions:create', 'roadmaps:create', 'pings:answer']
            : ['roadmaps:enroll', 'posts:create'],
      mentorProfileStatus: isGuide ? pick(['approved', 'pending', 'under_review', 'changes_requested'], i) : 'none',
      respectPoints: isGuide ? 200 + i * 13 : 4 + i * 2,
      fameScore: isGuide ? 35 + (i % 65) : i % 40,
      guideRank: isGuide ? pick(Object.values(GuideRank), i) : GuideRank.RISING,
      educationLevel: pick(Object.values(EducationLevel), i),
      bio: `${role} profile focused on ${domain}. Includes broad seeded field coverage for QA. ${seedTag}`,
      domains: [domain, pick(domains, i + 3), pick(domains, i + 7)],
      skills: skillsByDomain[domain].map((skill, skillIndex) => ({
        name: skill,
        level: pick(['Beginner', 'Intermediate', 'Advanced', 'Expert'], i + skillIndex),
        years: (i + skillIndex) % 10,
      })),
      interests: [domain.toLowerCase(), 'career growth', 'projects', pick(['community', 'mentorship', 'interviews'], i)],
      avatar: `https://i.pravatar.cc/160?u=${seedTag}-${i}`,
      isVerified: i % 9 !== 0,
      isBanned: i % 151 === 0,
      isSuspended,
      suspensionReason: isSuspended ? `Seeded temporary suspension for policy UI testing. ${seedTag}` : undefined,
      suspensionSource: isSuspended ? 'moderator_action' : undefined,
      suspendedUntil: isSuspended ? daysFromNow(5 + (i % 10)) : undefined,
      falseReportStrikes: i % 6,
      moderatorNotes: i % 35 === 0 ? `Moderator note for seeded account ${i}. ${seedTag}` : undefined,
      mutedUntil: i % 88 === 0 ? daysFromNow(2) : undefined,
      pingAvailable: isGuide && i % 4 !== 0,
      socialLinks: {
        github: `https://github.com/${slugify(name)}-${seedTag}`,
        linkedin: `https://linkedin.com/in/${slugify(name)}-${seedTag}`,
        website: `https://${slugify(name)}-${seedTag}.example.com`,
      },
      availability: {
        text: pick(['Weekday evenings', 'Weekend mornings', 'Flexible office hours', 'Async-first mentoring'], i),
        schedule: [
          { day: pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], i), slots: ['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'] },
          { day: pick(['Saturday', 'Sunday'], i), slots: ['10:00 AM - 11:00 AM', '2:00 PM - 3:00 PM'] },
        ],
      },
      totalSessions: isGuide ? 3 + (i % 70) : i % 5,
      averageRating: isGuide ? Number((3.6 + (i % 14) / 10).toFixed(2)) : 0,
      totalReviews: isGuide ? 1 + (i % 45) : 0,
      profileVisibility: i % 23 !== 0,
      showRoadmapActivity: i % 11 !== 0,
      anonymousRoadmapParticipation: i % 13 === 0,
      onboardingCompleted: i % 7 !== 0,
      onboarding: {
        primaryGoal: pick(['job_ready', 'switch_career', 'build_portfolio', 'mentor_others', 'learn_systems'], i),
        experienceLevel: pick(['beginner', 'intermediate', 'advanced'], i),
        targetRole: `${domain} ${isGuide ? 'Mentor' : 'Engineer'}`,
        interestedDomains: [domain, pick(domains, i + 2)],
        preferredLearningStyle: pick(['projects', 'videos', 'reading', 'live_sessions', 'mixed'], i),
        weeklyCommitmentHours: 2 + (i % 35),
      },
    });
  });

  return User.insertMany(users, { ordered: false });
}

async function seedRefreshTokens(users) {
  const tokens = users.slice(0, Math.min(120, users.length)).map((user, i) => ({
    user: user._id,
    token: crypto.createHash('sha256').update(`${seedTag}-${user._id}-${i}`).digest('hex'),
    expiresAt: daysFromNow(i % 3 === 0 ? -1 : 7 + (i % 30)),
  }));
  return RefreshToken.insertMany(tokens, { ordered: false });
}

async function seedRoadmaps(guides, students) {
  const roadmaps = [];
  const sections = [];
  const steps = [];

  for (let i = 0; i < counts.roadmaps; i += 1) {
    const domain = pick(domains, i);
    const roadmapId = oid();
    const hidden = i % 31 === 0;
    const deleted = i % 53 === 0;
    const published = i % 9 !== 0;
    const title = `${pick(['Mastering', 'Production', 'Career', 'Deep Dive', 'Zero to One'], i)} ${domain} Track ${i + 1}`;

    roadmaps.push({
      _id: roadmapId,
      title,
      slug: `${slugify(title)}-${seedTag}`,
      description: `Coverage roadmap for ${domain}: beginner tasks, advanced projects, references, moderation states, and community metrics.`,
      thumbnail: `https://source.unsplash.com/900x600/?technology,${encodeURIComponent(domain)},${i}`,
      domains: [domain, pick(domains, i + 1)],
      tags: [seedTag, domain, ...skillsByDomain[domain].slice(0, 4)],
      difficulty: pick(['beginner', 'intermediate', 'advanced'], i),
      estimatedWeeks: 4 + (i % 24),
      createdBy: guides[i % guides.length]._id,
      enrollmentCount: 5 + (i * 11) % 600,
      averageRating: Number((3.7 + (i % 13) / 10).toFixed(1)),
      isPublished: published,
      prerequisites: ['Basic computer literacy', `Starter familiarity with ${pick(skillsByDomain[domain], i)}`, 'Consistent weekly practice'],
      learningOutcomes: [
        `Build a ${domain} capstone`,
        'Write a clear technical decision log',
        'Debug failures using production-style diagnostics',
        'Explain tradeoffs in interviews',
      ],
      visibility: i % 17 === 0 ? 'unlisted' : i % 29 === 0 ? 'private' : 'public',
      moderationStatus: deleted ? 'deleted' : hidden ? 'hidden' : 'visible',
      hiddenAt: hidden ? daysFromNow(-2) : undefined,
      deletedAt: deleted ? daysFromNow(-1) : undefined,
      targetRole: `${domain} Engineer`,
      domain,
      isPublic: published,
      followerCount: 12 + i * 5,
    });

    for (let s = 0; s < 5; s += 1) {
      const sectionId = oid();
      sections.push({
        _id: sectionId,
        roadmapId,
        title: `${s + 1}. ${pick(['Foundations', 'Core Practice', 'Applied Systems', 'Review and Debugging', 'Capstone'], s)}`,
        description: `Coverage section ${s + 1} for ${domain} with varied step types and difficulties.`,
        order: s,
      });

      for (let t = 0; t < 7; t += 1) {
        steps.push({
          _id: oid(),
          roadmapId,
          sectionId,
          title: `${pick(skillsByDomain[domain], t)} ${pick(['Primer', 'Workshop', 'Assignment', 'Project', 'Quiz', 'Case Study', 'Optional Lab'], t)}`,
          description: `Seeded step covering ${pick(skillsByDomain[domain], t)} with measurable completion criteria and review prompts.`,
          type: pick(['article', 'video', 'project', 'assignment', 'quiz', 'session', 'external resource'], t),
          resources: [
            { type: 'article', title: `${domain} guide`, url: `https://example.com/${slugify(domain)}/guide-${t}` },
            { type: 'video', title: `${pick(skillsByDomain[domain], t)} walkthrough`, url: `https://example.com/${slugify(domain)}/video-${t}` },
            { type: 'tool', title: 'Practice checklist', url: `https://example.com/${slugify(domain)}/checklist-${t}` },
          ],
          estimatedMinutes: 15 + ((i + s + t) % 10) * 10,
          difficulty: pick(['beginner', 'intermediate', 'advanced'], i + s + t),
          order: t,
          isOptional: t === 6 || (i + t) % 11 === 0,
          richNotes: `Mentor note for ${domain}: compare at least two approaches before implementation.`,
          videoUrl: `https://example.com/video/${seedTag}/${i}-${s}-${t}`,
          mentorTip: `Keep the scope small, then document what changed. ${seedTag}`,
        });
      }
    }
  }

  await CareerRoadmap.insertMany(roadmaps, { ordered: false });
  await RoadmapSection.insertMany(sections, { ordered: false });
  const createdSteps = await RoadmapStep.insertMany(steps, { ordered: false });

  const progress = [];
  roadmaps.forEach((roadmap, i) => {
    const roadmapSteps = createdSteps.filter((step) => step.roadmapId.equals(roadmap._id));
    for (let e = 0; e < Math.min(12, students.length); e += 1) {
      const completedCount = (e + i) % Math.max(1, roadmapSteps.length);
      const completedSteps = roadmapSteps.slice(0, completedCount).map((step) => step._id);
      progress.push({
        userId: students[(i + e) % students.length]._id,
        roadmapId: roadmap._id,
        completedSteps,
        progressPercentage: Math.round((completedSteps.length / roadmapSteps.filter((step) => !step.isOptional).length) * 100),
        startedAt: daysFromNow(-90 + e),
        lastActiveAt: daysFromNow(-(e % 14), e),
        completedAt: completedCount > 28 ? daysFromNow(-1) : undefined,
        streakCount: e % 21,
        notes: new Map([
          [roadmapSteps[0]._id.toString(), `Coverage note: first checkpoint for ${roadmap.title}.`],
          [roadmapSteps[Math.min(3, roadmapSteps.length - 1)]._id.toString(), `Need review from mentor. ${seedTag}`],
        ]),
        bookmarkedSteps: roadmapSteps.slice(-2).map((step) => step._id),
      });
    }
  });

  await UserProgress.insertMany(progress, { ordered: false });
  return { roadmaps, steps: createdSteps };
}

async function seedPostsAndReplies(users, guides, students) {
  const posts = [];
  for (let i = 0; i < counts.posts; i += 1) {
    const domain = pick(domains, i);
    const hidden = i % 71 === 0;
    const deleted = i % 137 === 0;
    posts.push({
      title: `${pick(['How do I debug', 'Review my plan for', 'What is the best path into', 'Explain tradeoffs in', 'Portfolio idea for'], i)} ${domain}?`,
      content: `Seeded long-form discussion for ${domain}. Includes context, constraints, attempted solutions, and QA variety. ${seedTag} post ${i}.`,
      authorId: users[i % users.length]._id,
      category: pick(Object.values(PostCategory), i),
      tags: [seedTag, domain, pick(skillsByDomain[domain], i), pick(['career', 'debugging', 'portfolio', 'deployment'], i)],
      upvotes: (i * 7) % 240,
      downvotes: i % 19,
      voters: students.slice(0, Math.min(12, students.length)).map((student, voterIndex) => ({
        userId: student._id,
        vote: voterIndex % 8 === 0 ? -1 : 1,
      })),
      isResolved: i % 4 === 0,
      isSolved: i % 4 === 0,
      isPinned: i % 95 === 0,
      isLocked: i % 121 === 0,
      moderationStatus: deleted ? 'deleted' : hidden ? 'hidden' : 'visible',
      hiddenAt: hidden ? daysFromNow(-3) : undefined,
      deletedAt: deleted ? daysFromNow(-1) : undefined,
      viewCount: 15 + i * 4,
      resolvedAt: i % 4 === 0 ? daysFromNow(-(i % 60)) : undefined,
      resolvedBy: i % 4 === 0 ? users[(i + 5) % users.length]._id : undefined,
    });
  }

  const createdPosts = await Post.insertMany(posts, { ordered: false });
  const replies = [];
  createdPosts.forEach((post, i) => {
    for (let r = 0; r < 1 + (i % 6); r += 1) {
      replies.push({
        postId: post._id,
        authorId: (r % 2 === 0 ? guides : students)[(i + r) % (r % 2 === 0 ? guides.length : students.length)]._id,
        content: `Reply ${r + 1} with a different angle: diagnosis, tradeoff, resource, or next action. ${seedTag} post=${post._id}`,
        upvotes: (i + r * 3) % 90,
        moderationStatus: r % 19 === 0 ? 'hidden' : 'visible',
        hiddenAt: r % 19 === 0 ? daysFromNow(-2) : undefined,
      });
    }
  });

  const createdReplies = await Reply.insertMany(replies, { ordered: false });
  const solvedUpdates = createdPosts
    .filter((post, i) => i % 4 === 0)
    .map((post) => {
      const accepted = createdReplies.find((reply) => reply.postId.equals(post._id));
      return accepted
        ? Post.updateOne({ _id: post._id }, { acceptedReplyId: accepted._id, solutionReplyId: accepted._id })
        : null;
    })
    .filter(Boolean);

  await Promise.all(solvedUpdates);
  return { posts: createdPosts, replies: createdReplies };
}

async function seedSessionsReviewsAndReflections(guides, students, roadmaps, steps) {
  const sessions = [];
  for (let i = 0; i < counts.sessions; i += 1) {
    const domain = pick(domains, i);
    const status = pick(Object.values(SessionStatus), i);
    const isCompleted = [SessionStatus.COMPLETED, SessionStatus.ENDED, SessionStatus.ARCHIVED].includes(status);
    const isLive = [SessionStatus.STARTED, SessionStatus.ACTIVE, SessionStatus.LIVE].includes(status);
    const guide = guides[i % guides.length];
    const student = students[(i * 3) % students.length];
    const publicSession = i % 3 !== 0;
    const scheduledAt = isCompleted ? daysFromNow(-(i % 120), i % 12) : daysFromNow((i % 90) + 1, i % 12);

    sessions.push({
      guideId: guide._id,
      clientId: publicSession ? undefined : student._id,
      sessionType: publicSession ? SessionType.PUBLIC_WORKSHOP : SessionType.PRIVATE_MENTORSHIP,
      title: `${seedTag}: ${domain} ${pick(['clinic', 'workshop', 'AMA', 'pairing session', 'review lab'], i)} ${i + 1}`,
      topic: pick(skillsByDomain[domain], i),
      description: `Coverage session with varied status, provider, attendance, waitlist, and execution fields.`,
      domains: [domain, pick(domains, i + 2)],
      tags: [seedTag, domain, status],
      difficulty: pick(['beginner', 'intermediate', 'advanced'], i),
      scheduledAt,
      durationMinutes: pick([25, 30, 45, 60, 75, 90, 120], i),
      price: publicSession ? pick([0, 99, 199], i) : pick([0, 299, 499, 799, 999], i),
      status,
      isPublic: publicSession,
      capacity: publicSession ? 8 + (i % 80) : undefined,
      attendeeCount: publicSession ? 1 + (i % 35) : 0,
      bannerImage: `https://source.unsplash.com/1200x500/?learning,${encodeURIComponent(domain)},${i}`,
      thumbnail: `https://source.unsplash.com/500x350/?code,${encodeURIComponent(domain)},${i}`,
      roadmapId: roadmaps[i % roadmaps.length]._id,
      registrationMode: pick(Object.values(RegistrationMode), i),
      sessionCategory: pick(Object.values(SessionCategory), i),
      resources: [
        { title: `${domain} prep worksheet`, url: `https://example.com/session/${i}/worksheet`, type: 'worksheet' },
        { title: `${domain} reference pack`, url: `https://example.com/session/${i}/refs`, type: 'article' },
      ],
      recordingUrl: isCompleted ? `https://example.com/recordings/${seedTag}-${i}` : undefined,
      attendees: students.slice(0, Math.min(6 + (i % 12), students.length)).map((attendee, a) => ({
        userId: attendee._id,
        registeredAt: daysFromNow(-(a + 5)),
        attendedAt: isCompleted || isLive ? daysFromNow(-1, a) : undefined,
      })),
      waitlist: students.slice(20, Math.min(20 + (i % 8), students.length)).map((waiter, w) => ({
        userId: waiter._id,
        joinedAt: daysFromNow(-(w + 1)),
      })),
      meetingLink: `https://meet.jit.si/ascendpath-${seedTag}-${i}`,
      meetingProvider: pick(Object.values(MeetingProvider), i),
      meetingUrl: `https://meet.jit.si/ascendpath-${seedTag}-${i}`,
      meetingRoomId: `ascendpath-${seedTag}-${i}`,
      startedAt: isLive || isCompleted ? new Date(scheduledAt.getTime() + 5 * 60 * 1000) : undefined,
      endedAt: isCompleted ? new Date(scheduledAt.getTime() + 65 * 60 * 1000) : undefined,
      mentorJoinedAt: isLive || isCompleted ? new Date(scheduledAt.getTime() + 2 * 60 * 1000) : undefined,
      menteeJoinedAt: !publicSession && (isLive || isCompleted) ? new Date(scheduledAt.getTime() + 4 * 60 * 1000) : undefined,
      actualDurationMinutes: isCompleted ? 42 + (i % 55) : undefined,
      attendanceStatus: pick(Object.values(AttendanceStatus), i),
      sessionExecutionState: pick(Object.values(SessionExecutionState), i),
      rating: isCompleted ? 3 + (i % 3) : undefined,
      review: isCompleted ? `Session-level review text for coverage. ${seedTag}` : undefined,
    });
  }

  const createdSessions = await Session.insertMany(sessions, { ordered: false });
  const completed = createdSessions.filter((session) =>
    [SessionStatus.COMPLETED, SessionStatus.ENDED, SessionStatus.ARCHIVED].includes(session.status)
  );

  const reviews = completed.map((session, i) => ({
    reviewerId: session.clientId || students[i % students.length]._id,
    guideId: session.guideId,
    sessionId: session._id,
    rating: 2 + (i % 4),
    reviewText: `Coverage review with varied rating, sentiment, reports, and moderation status. ${seedTag} review ${i}.`,
    tags: [pick(['Helpful', 'Practical', 'Deep Technical Knowledge', 'Good Communication', 'Needs Structure'], i), seedTag],
    sentiment: pick(['positive', 'neutral', 'negative'], i),
    isVerified: i % 5 !== 0,
    moderationStatus: pick(['approved', 'flagged', 'hidden'], i),
    flagReason: i % 3 === 0 ? `Seeded flag reason. ${seedTag}` : undefined,
    reportedBy: students.slice(0, i % 5).map((student) => student._id),
  }));

  const createdReviews = await Review.insertMany(reviews, { ordered: false });
  await Promise.all(createdReviews.map((review) =>
    Session.updateOne({ _id: review.sessionId }, { reviewId: review._id, rating: review.rating, review: review.reviewText })
  ));

  const reflections = completed.slice(0, Math.min(completed.length, 350)).map((session, i) => ({
    sessionId: session._id,
    menteeId: session.clientId || students[i % students.length]._id,
    mentorId: session.guideId,
    menteeReflection: i % 4 === 0 ? undefined : {
      learnings: `I learned a practical workflow and next challenge. ${seedTag}`,
      confidenceLevel: 1 + (i % 5),
      nextChallenge: `Build a follow-up artifact for ${session.topic}.`,
      submittedAt: daysFromNow(-(i % 20)),
    },
    mentorFollowup: i % 3 === 0 ? undefined : {
      recommendedRoadmapSteps: [
        {
          roadmapId: roadmaps[i % roadmaps.length]._id,
          stepId: steps[i % steps.length]._id,
          title: `Recommended next step ${i}`,
          reason: `Matches the learner's session gap. ${seedTag}`,
        },
      ],
      recommendedResources: [
        { title: 'Focused practice guide', url: 'https://example.com/practice', type: pick(['article', 'video', 'course', 'tool', 'docs', 'other'], i) },
      ],
      recommendedProjects: [
        { title: `${session.topic} mini project`, description: `Small scoped project from mentor follow-up. ${seedTag}`, difficulty: pick(['beginner', 'intermediate', 'advanced'], i) },
      ],
      mentorNotes: `Mentor follow-up note with strengths and risks. ${seedTag}`,
      nextSessionSuggestion: 'Book a review after the first draft is complete.',
      submittedAt: daysFromNow(-(i % 10)),
    },
    status: pick(Object.values(SessionReflectionStatus), i),
    requestedAt: daysFromNow(-(i % 25)),
  }));

  await SessionReflection.insertMany(reflections, { ordered: false });
  return { sessions: createdSessions, reviews: createdReviews };
}

async function seedPings(students, guides) {
  const pings = [];
  for (let i = 0; i < counts.pings; i += 1) {
    const status = pick(Object.values(PingStatus), i);
    const answered = status === PingStatus.ANSWERED || status === PingStatus.CLOSED;
    const domain = pick(domains, i);
    pings.push({
      fromUserId: students[i % students.length]._id,
      toUserId: guides[(i * 5) % guides.length]._id,
      question: `Coverage ping: what is one sharp next move for ${domain}?`,
      context: `${seedTag}: learner has constraints, deadline, and partial progress.`,
      status,
      response: answered ? `Start with a tiny artifact, then ask for review. ${seedTag}` : undefined,
      responseRating: answered ? 1 + (i % 5) : undefined,
      expiresAt: status === PingStatus.EXPIRED ? daysFromNow(-1) : daysFromNow(1 + (i % 14)),
    });
  }
  return PingRequest.insertMany(pings, { ordered: false });
}

async function seedMentorApplications(users, reviewers) {
  const applicants = users.filter((user) => user.role === Role.EXPLORER || user.role === Role.GUIDE).slice(0, counts.mentorApplications);
  const applications = applicants.map((user, i) => {
    const status = pick(Object.values(MentorApplicationStatus), i);
    const domain = pick(domains, i);
    return {
      userId: user._id,
      bio: `Applicant has practical experience in ${domain} and wants to mentor learners. ${seedTag}`,
      domains: [domain, pick(domains, i + 2)],
      skills: skillsByDomain[domain],
      experienceYears: i % 18,
      currentRole: pick(['Software Engineer', 'Senior Developer', 'Designer', 'Student Mentor', 'Platform Engineer'], i),
      company: pick(['Acme Labs', 'Northstar Systems', 'Open Source Collective', 'Indie Studio', 'Cloudlane'], i),
      linkedinUrl: `https://linkedin.com/in/coverage-applicant-${i}`,
      githubUrl: `https://github.com/coverage-applicant-${i}`,
      portfolioUrl: `https://coverage-applicant-${i}.example.com`,
      resumeUrl: `https://example.com/resumes/${seedTag}-${i}.pdf`,
      uploads: {
        resume: {
          url: `https://example.com/uploads/resume-${i}.pdf`,
          provider: pick(['cloudinary', 's3', 'external'], i),
          publicId: `${seedTag}/resume-${i}`,
          mimeType: 'application/pdf',
          sizeBytes: 120000 + i * 337,
          originalName: `resume-${i}.pdf`,
        },
        certifications: [
          { url: `https://example.com/certs/${i}.pdf`, provider: 'external', mimeType: 'application/pdf', sizeBytes: 50000 + i, originalName: `cert-${i}.pdf` },
        ],
        portfolioAssets: [
          { url: `https://example.com/portfolio/${i}.png`, provider: 'cloudinary', publicId: `${seedTag}/portfolio-${i}`, mimeType: 'image/png', sizeBytes: 90000 + i },
        ],
      },
      motivation: `I want to turn practical experience into clear learning paths. ${seedTag}`,
      expertiseSummary: `Strong in ${skillsByDomain[domain].join(', ')} with examples across real projects.`,
      availability: {
        text: pick(['4 hours/week evenings', 'Weekend mentor blocks', 'Async reviews plus monthly sessions'], i),
        hoursPerWeek: 2 + (i % 18),
        timezone: pick(['Asia/Kolkata', 'UTC', 'America/New_York', 'Europe/London'], i),
        schedule: [
          { day: pick(['Monday', 'Wednesday', 'Saturday'], i), slots: ['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'] },
        ],
      },
      status,
      rejectionReason: status === MentorApplicationStatus.REJECTED ? `Needs stronger evidence of mentorship quality. ${seedTag}` : undefined,
      changeRequest: status === MentorApplicationStatus.CHANGES_REQUESTED ? `Add portfolio proof and clearer availability. ${seedTag}` : undefined,
      internalNotes: `Internal reviewer note ${i}. ${seedTag}`,
      reviewedBy: status === MentorApplicationStatus.PENDING ? undefined : reviewers[i % reviewers.length]._id,
      reviewedAt: status === MentorApplicationStatus.PENDING ? undefined : daysFromNow(-(i % 30)),
    };
  });
  return MentorApplication.insertMany(applications, { ordered: false });
}

async function seedReportsAndAudits(users, moderators, posts, replies, reviews, sessions, roadmaps) {
  const targetPools = [
    { type: TargetType.POST, items: posts },
    { type: TargetType.REPLY, items: replies },
    { type: TargetType.USER, items: users },
    { type: TargetType.REVIEW, items: reviews },
    { type: TargetType.ROADMAP, items: roadmaps },
    { type: TargetType.SESSION, items: sessions },
    { type: TargetType.GUIDE_PROFILE, items: users.filter((user) => user.role === Role.GUIDE) },
  ];

  const reports = [];
  for (let i = 0; i < counts.reports; i += 1) {
    const pool = pick(targetPools, i);
    const target = pool.items[i % pool.items.length];
    const status = pick(Object.values(ReportStatus), i);
    const reviewed = [ReportStatus.REVIEWED, ReportStatus.ACTIONED, ReportStatus.DISMISSED].includes(status);
    reports.push({
      reporterId: users[(i + 9) % users.length]._id,
      targetType: pool.type,
      targetId: target._id,
      reason: pick(Object.values(ReportReason), i),
      reasonCategory: pick(Object.values(ReportReason), i + 2),
      detailedReason: `Coverage report with evidence, priority, status, and moderator notes. ${seedTag} report ${i}.`,
      evidenceLinks: [`https://example.com/evidence/${seedTag}/${i}`],
      screenshots: [`https://example.com/screenshots/${seedTag}/${i}.png`],
      status,
      priority: pick(Object.values(ReportPriority), i),
      assignedModerator: moderators[i % moderators.length]._id,
      moderatorDecision: pick(Object.values(ModeratorDecision), i),
      moderatorNotes: reviewed ? `Reviewed seeded report and recorded decision. ${seedTag}` : undefined,
      reviewedBy: reviewed ? moderators[(i + 1) % moderators.length]._id : undefined,
      reviewedAt: reviewed ? daysFromNow(-(i % 20)) : undefined,
      falseReportStrike: i % 17 === 0,
      metadata: { seedTag, targetCollection: pool.type, syntheticRiskScore: i % 100 },
      details: `Compatibility details field. ${seedTag}`,
      description: `Compatibility description field. ${seedTag}`,
      resolvedBy: reviewed ? moderators[(i + 2) % moderators.length]._id : undefined,
      resolvedAt: reviewed ? daysFromNow(-(i % 18)) : undefined,
      resolution: reviewed ? pick(['warning issued', 'content hidden', 'dismissed after review', 'escalated'], i) : undefined,
    });
  }

  const createdReports = await Report.insertMany(reports, { ordered: false });
  const auditLogs = [];
  for (let i = 0; i < counts.auditLogs; i += 1) {
    const target = pick([...users, ...posts, ...sessions, ...roadmaps], i);
    auditLogs.push({
      actorId: moderators[i % moderators.length]._id,
      action: pick(Object.values(AuditAction), i),
      targetId: target._id,
      targetType: pick(['user', 'post', 'session', 'roadmap', 'report', 'mentor_application'], i),
      details: `Coverage audit event for moderation/admin screens. ${seedTag} audit ${i}.`,
      metadata: { seedTag, reportId: createdReports[i % createdReports.length]._id, batch: 'coverage' },
      severity: pick(Object.values(AuditSeverity), i),
    });
  }
  const createdAudits = await AuditLog.insertMany(auditLogs, { ordered: false });
  return { reports: createdReports, auditLogs: createdAudits };
}

async function seedRespectAndReputation(users, posts, replies, sessions, reviews) {
  const sources = [...posts, ...replies, ...sessions, ...reviews];
  const reasons = Object.values(RespectReason);
  const votes = [];
  for (let i = 0; i < counts.respectVotes; i += 1) {
    const source = sources[i % sources.length];
    const reason = pick(reasons, i);
    votes.push({
      voterId: users[i % users.length]._id,
      targetUserId: users[(i + 17) % users.length]._id,
      points: pick([1, 2, 3, 5, 8, 13], i),
      reason,
      sourceId: source._id,
    });
  }

  const uniqueVotes = uniqueByKey(votes, (vote) => `${vote.voterId}-${vote.sourceId}-${vote.reason}`);
  const createdVotes = await RespectVote.insertMany(uniqueVotes, { ordered: false });

  const reputationAudits = [];
  for (let i = 0; i < counts.reputationAudits; i += 1) {
    const oldValue = (i * 3) % 1000;
    const delta = pick([-15, -5, -1, 1, 3, 5, 10, 20], i);
    reputationAudits.push({
      userId: users[(i + 11) % users.length]._id,
      type: pick(['fame', 'respect'], i),
      action: pick(['session_completed', 'review_received', 'review_updated', 'review_deleted', 'review_reported', 'forum_vote', 'admin_adjustment'], i),
      oldValue,
      newValue: Math.max(0, oldValue + delta),
      delta,
      reason: `Coverage reputation audit event. ${seedTag}`,
      referenceId: sources[i % sources.length]._id,
    });
  }

  const createdReputationAudits = await ReputationAuditLog.insertMany(reputationAudits, { ordered: false });
  return { respectVotes: createdVotes, reputationAudits: createdReputationAudits };
}

async function seedNotifications(users, posts, sessions, roadmaps, reviews, reports) {
  const entities = [...posts, ...sessions, ...roadmaps, ...reviews, ...reports];
  const types = Object.values(NotificationType);
  const notifications = [];

  for (let i = 0; i < counts.notifications; i += 1) {
    const type = pick(types, i);
    const entity = entities[i % entities.length];
    notifications.push({
      recipientId: users[i % users.length]._id,
      actorId: users[(i + 31) % users.length]._id,
      type,
      entityId: entity._id,
      entityType: pick(['post', 'reply', 'session', 'roadmap', 'review', 'report', 'mentor_application', 'user'], i),
      title: `Coverage ${type.replace(/_/g, ' ')}`,
      message: `Notification variant for ${type}, testing read/unread, metadata, links, and dropdown density. ${seedTag} #${i}.`,
      metadata: {
        seedTag,
        index: i,
        url: `https://example.com/notification/${i}`,
        severity: pick(['info', 'warning', 'success', 'critical'], i),
      },
      read: i % 3 === 0,
    });
  }

  return Notification.insertMany(notifications, { ordered: false });
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`Coverage seed tag: ${seedTag}`);
  console.log('Cleaning previous coverage seed...');
  await cleanupCoverageSeed();

  const passwordHash = await bcrypt.hash(password, 10);
  const users = await seedUsers(passwordHash);
  const guides = users.filter((user) => user.role === Role.GUIDE || user.role === Role.ARCHITECT);
  const students = users.filter((user) => user.role === Role.EXPLORER);
  const moderators = users.filter((user) => user.role === Role.SENTINEL || user.role === Role.ARCHITECT);

  await seedRefreshTokens(users);
  const { roadmaps, steps } = await seedRoadmaps(guides, students);
  const { posts, replies } = await seedPostsAndReplies(users, guides, students);
  const { sessions, reviews } = await seedSessionsReviewsAndReflections(guides, students, roadmaps, steps);
  const pings = await seedPings(students, guides);
  const mentorApplications = await seedMentorApplications(users, moderators);
  const { reports, auditLogs } = await seedReportsAndAudits(users, moderators, posts, replies, reviews, sessions, roadmaps);
  const { respectVotes, reputationAudits } = await seedRespectAndReputation(users, posts, replies, sessions, reviews);
  const notifications = await seedNotifications(users, posts, sessions, roadmaps, reviews, reports);

  console.log('\nCoverage demo seed complete.');
  console.log(`Users: ${users.length} (${guides.length} guide-capable, ${students.length} students, ${moderators.length} moderators/admins)`);
  console.log(`Roadmaps: ${roadmaps.length}`);
  console.log(`Posts: ${posts.length}`);
  console.log(`Replies: ${replies.length}`);
  console.log(`Sessions: ${sessions.length}`);
  console.log(`Reviews: ${reviews.length}`);
  console.log(`Session reflections: ${Math.min(reviews.length, 350)}`);
  console.log(`Pings: ${pings.length}`);
  console.log(`Mentor applications: ${mentorApplications.length}`);
  console.log(`Reports: ${reports.length}`);
  console.log(`Audit logs: ${auditLogs.length}`);
  console.log(`Respect votes: ${respectVotes.length}`);
  console.log(`Reputation audits: ${reputationAudits.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`Password for all coverage users: ${password}`);
  console.log(`Example student login: ${students[0].email}`);
  console.log(`Example guide login: ${guides[0].email}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed coverage demo data:', error);
  await mongoose.disconnect();
  process.exit(1);
});
