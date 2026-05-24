require('ts-node/register');
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Role, EducationLevel, GuideRank } = require('../src/modules/users/user.model');
const { Post, PostCategory } = require('../src/modules/posts/post.model');
const { Reply } = require('../src/modules/posts/reply.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const seedTag = process.env.FORUM_SEED_TAG || 'forum-topup-seed';
const postCount = Number(process.env.FORUM_POSTS || 120);
const password = process.env.FORUM_DEMO_PASSWORD || 'DemoPass123!';

const domains = [
  'React',
  'TypeScript',
  'Node.js',
  'MongoDB',
  'System Design',
  'DevOps',
  'Career',
  'Portfolio',
  'Internships',
  'Open Source',
  'AI Engineering',
  'Cybersecurity',
  'Product Design',
  'Data Science',
];

const titleTemplates = [
  'How should I debug {topic} when it works locally but fails after deployment?',
  'What is the most practical way to learn {topic} in four weeks?',
  'Can someone review my plan for a {topic} portfolio project?',
  'What mistakes should I avoid while learning {topic}?',
  'How do I explain {topic} tradeoffs in an interview?',
  'Is this {topic} architecture too complicated for a junior project?',
  'What should I build next after learning the basics of {topic}?',
  'How do senior engineers approach {topic} problems?',
  'What is a realistic roadmap for becoming strong at {topic}?',
  'How do I turn my messy {topic} project into a clean case study?',
];

const contentBlocks = [
  'I have already tried reading docs and building a small demo, but I am not sure what a production-quality version should include.',
  'My main confusion is around tradeoffs. I can make it work, but I do not know how to choose between the available approaches.',
  'I want feedback that is practical, not just a list of tutorials. What would you do first if you were in my position?',
  'This is for my portfolio and I want it to feel credible to recruiters, mentors, and technical interviewers.',
  'I am trying to avoid tutorial-copy projects and build something that shows judgment, debugging, and ownership.',
  'The feature works in the happy path, but error states, loading states, and deployment behavior are still shaky.',
  'I am preparing for internships and want to know what parts of this topic are actually important on the job.',
  'I would love suggestions for a smaller scope that still demonstrates real engineering thinking.',
];

const replyAngles = [
  'Start by writing down the exact failure mode and the smallest reproduction. That turns a vague issue into a debuggable one.',
  'For a portfolio project, show the problem, constraints, tradeoffs, screenshots, and what you would improve next.',
  'Do one vertical slice end to end before expanding scope. A small complete feature teaches more than five half-built features.',
  'Add a README section explaining architecture decisions. Reviewers care about your reasoning as much as the code.',
  'Make sure you include empty, loading, error, and permission states. Those are where projects start feeling real.',
  'If you are preparing for interviews, practice explaining why you rejected simpler or more complex alternatives.',
  'Keep the first version boring and reliable. Once it works, add polish, metrics, and edge-case handling.',
  'Use the official docs as your source of truth, then build one small exercise that proves you understood the concept.',
  'Ask yourself what would break if ten users used it at the same time. That question reveals a lot of missing details.',
  'Turn this into a case study: goal, implementation, blockers, debugging notes, and final outcome.',
];

const tagsByTopic = {
  React: ['react', 'frontend', 'components', 'state-management'],
  TypeScript: ['typescript', 'types', 'frontend', 'backend'],
  'Node.js': ['nodejs', 'backend', 'api', 'express'],
  MongoDB: ['mongodb', 'database', 'mongoose', 'indexes'],
  'System Design': ['system-design', 'architecture', 'scalability', 'tradeoffs'],
  DevOps: ['devops', 'deployment', 'render', 'ci-cd'],
  Career: ['career', 'mentorship', 'job-search', 'growth'],
  Portfolio: ['portfolio', 'projects', 'case-study', 'resume'],
  Internships: ['internship', 'interviews', 'career', 'students'],
  'Open Source': ['open-source', 'github', 'community', 'contributions'],
  'AI Engineering': ['ai', 'llm', 'rag', 'agents'],
  Cybersecurity: ['security', 'owasp', 'auth', 'threat-modeling'],
  'Product Design': ['design', 'ux', 'figma', 'accessibility'],
  'Data Science': ['data-science', 'python', 'analytics', 'ml'],
};

const pick = (items, index) => items[index % items.length];

function titleFor(index) {
  const topic = pick(domains, index);
  return pick(titleTemplates, index).replace('{topic}', topic);
}

function contentFor(index) {
  const topic = pick(domains, index);
  const paragraphs = [
    `I am working on ${topic} and trying to understand what a strong, realistic next step looks like.`,
    pick(contentBlocks, index),
    pick(contentBlocks, index + 3),
    `Context marker: ${seedTag}. I am looking for specific advice, examples, and common failure modes.`,
  ];

  if (index % 5 === 0) {
    paragraphs.push('Extra constraint: I only have weekends to work on this, so scope control matters.');
  }
  if (index % 7 === 0) {
    paragraphs.push('Extra detail: I want to deploy this and include it in a public portfolio.');
  }
  if (index % 11 === 0) {
    paragraphs.push('Extra worry: I can follow tutorials, but I struggle when requirements are ambiguous.');
  }

  return paragraphs.join('\n\n');
}

async function ensureUsers() {
  let users = await User.find({}).limit(80);
  if (users.length >= 8) return users;

  const passwordHash = await bcrypt.hash(password, 10);
  const fallbackUsers = Array.from({ length: 12 }, (_, index) => {
    const isGuide = index % 4 === 0;
    return {
      name: isGuide ? `Forum Guide ${index}` : `Forum Learner ${index}`,
      email: `forum-user-${index}@${seedTag}.ascendpath.dev`,
      passwordHash,
      role: isGuide ? Role.GUIDE : Role.EXPLORER,
      roles: [isGuide ? Role.GUIDE : Role.EXPLORER],
      capabilities: isGuide ? ['pings:answer', 'sessions:create', 'roadmaps:create'] : ['posts:create'],
      mentorProfileStatus: isGuide ? 'approved' : 'none',
      educationLevel: isGuide ? EducationLevel.PROFESSIONAL : EducationLevel.COLLEGE,
      bio: `Fallback forum seed user for discussion data. ${seedTag}`,
      domains: [pick(domains, index)],
      skills: [{ name: pick(domains, index), level: isGuide ? 'Advanced' : 'Beginner', years: isGuide ? 4 : 1 }],
      interests: ['forum', 'learning', pick(domains, index).toLowerCase()],
      isVerified: true,
      respectPoints: isGuide ? 250 + index : 10 + index,
      fameScore: isGuide ? 60 + index : index,
      guideRank: isGuide ? GuideRank.ESTABLISHED : GuideRank.RISING,
      pingAvailable: isGuide,
      onboardingCompleted: true,
      profileVisibility: true,
    };
  });

  await User.insertMany(fallbackUsers, { ordered: false });
  return User.find({}).limit(80);
}

async function cleanupPreviousForumSeed() {
  const posts = await Post.find({ tags: seedTag }).select('_id');
  const postIds = posts.map((post) => post._id);
  await Reply.deleteMany({ postId: { $in: postIds } });
  await Post.deleteMany({ _id: { $in: postIds } });
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`Forum seed tag: ${seedTag}`);
  console.log(`Creating ${postCount} forum posts...`);

  await cleanupPreviousForumSeed();
  const users = await ensureUsers();
  const guides = users.filter((user) => user.role === Role.GUIDE || user.role === Role.ARCHITECT || user.role === Role.PATHFINDER);
  const answerers = guides.length > 0 ? guides : users;

  const posts = Array.from({ length: postCount }, (_, index) => {
    const topic = pick(domains, index);
    const hidden = index % 47 === 0;
    const deleted = index % 89 === 0;
    const resolved = index % 3 === 0;
    const voters = users.slice(0, Math.min(15, users.length)).map((user, voterIndex) => ({
      userId: user._id,
      vote: voterIndex % 9 === 0 ? -1 : 1,
    }));

    return {
      title: titleFor(index),
      content: contentFor(index),
      authorId: users[index % users.length]._id,
      category: pick(Object.values(PostCategory), index),
      tags: [seedTag, ...tagsByTopic[topic]],
      upvotes: Math.max(0, voters.filter((vote) => vote.vote === 1).length + (index % 120)),
      downvotes: voters.filter((vote) => vote.vote === -1).length + (index % 6),
      voters,
      isResolved: resolved,
      isSolved: resolved,
      isPinned: index % 40 === 0,
      isLocked: index % 67 === 0,
      moderationStatus: deleted ? 'deleted' : hidden ? 'hidden' : 'visible',
      hiddenAt: hidden ? new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) : undefined,
      deletedAt: deleted ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) : undefined,
      viewCount: 20 + index * 9,
      resolvedAt: resolved ? new Date(Date.now() - (index % 25) * 24 * 60 * 60 * 1000) : undefined,
      resolvedBy: resolved ? answerers[index % answerers.length]._id : undefined,
    };
  });

  const createdPosts = await Post.insertMany(posts, { ordered: false });
  const replies = [];

  createdPosts.forEach((post, postIndex) => {
    const replyCount = 1 + (postIndex % 7);
    for (let replyIndex = 0; replyIndex < replyCount; replyIndex += 1) {
      const authorPool = replyIndex % 2 === 0 ? answerers : users;
      const author = authorPool[(postIndex + replyIndex) % authorPool.length];
      const voters = users.slice(0, Math.min(10, users.length)).map((user, voterIndex) => ({
        userId: user._id,
        vote: voterIndex % 8 === 0 ? -1 : 1,
      }));

      replies.push({
        postId: post._id,
        authorId: author._id,
        content: `${pick(replyAngles, postIndex + replyIndex)}\n\nConcrete next step: create one tiny deliverable, write the tradeoff in the README, and ask for review. ${seedTag} reply ${replyIndex + 1}.`,
        upvotes: voters.filter((vote) => vote.vote === 1).length + ((postIndex + replyIndex) % 35),
        downvotes: voters.filter((vote) => vote.vote === -1).length,
        voters,
        moderationStatus: replyIndex === 0 && postIndex % 53 === 0 ? 'hidden' : 'visible',
        hiddenAt: replyIndex === 0 && postIndex % 53 === 0 ? new Date(Date.now() - 24 * 60 * 60 * 1000) : undefined,
      });
    }
  });

  const createdReplies = await Reply.insertMany(replies, { ordered: false });
  const solvedUpdates = createdPosts
    .filter((post, index) => index % 3 === 0)
    .map((post) => {
      const accepted = createdReplies.find((reply) => reply.postId.toString() === post._id.toString());
      return accepted ? Post.updateOne({ _id: post._id }, { acceptedReplyId: accepted._id, solutionReplyId: accepted._id }) : null;
    })
    .filter(Boolean);

  await Promise.all(solvedUpdates);

  console.log('Forum seed complete.');
  console.log(`Posts: ${createdPosts.length}`);
  console.log(`Replies: ${createdReplies.length}`);
  console.log(`Visible posts: ${createdPosts.filter((post) => post.moderationStatus === 'visible').length}`);
  console.log(`Solved posts: ${createdPosts.filter((_, index) => index % 3 === 0).length}`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed forum posts:', error);
  await mongoose.disconnect();
  process.exit(1);
});
