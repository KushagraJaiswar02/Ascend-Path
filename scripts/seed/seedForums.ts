import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { Post, PostCategory } from '../../src/modules/posts/post.model';
import { Reply } from '../../src/modules/posts/reply.model';
import { connectDb, SeededRandom } from './helper';

export const seedForums = async () => {
  await connectDb();

  console.log('📣 Wiping and seeding 80+ Forum Posts and 150+ replies...');
  await Post.deleteMany({});
  await Reply.deleteMany({});

  const rng = new SeededRandom(8888);

  const users = await User.find({});
  const guides = await User.find({ role: Role.GUIDE });
  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });

  if (!users.length || !guides.length || !learners.length) {
    console.error('❌ Users not found. Run seedUsers first.');
    return;
  }

  // 1. Seed Core Named solved threads first
  const elena = await User.findOne({ email: 'frontend_mentor@ascendpath.dev' });
  const aisha = await User.findOne({ email: 'active_learner@ascendpath.dev' });
  const leo = await User.findOne({ email: 'struggling_learner@ascendpath.dev' });
  const aarav = await User.findOne({ email: 'ai_mentor@ascendpath.dev' });

  if (elena && aisha && leo && aarav) {
    const post1 = await Post.create({
      title: 'Zustand selector rendering optimization under heavy lists',
      content: 'I noticed my parent component renders 15 times every time I change a single item in my list store. How do I optimize this?',
      authorId: aisha._id,
      category: PostCategory.SKILLS,
      tags: ['react', 'zustand', 'state-selectors'],
      upvotes: 15,
      downvotes: 0,
      isResolved: true,
      isSolved: true,
      isPinned: true,
      viewCount: 184
    });

    const reply1 = await Reply.create({
      postId: post1._id,
      authorId: elena._id,
      content: 'Use precise selector hooks: `const list = useStore(state => state.list)`. This only triggers updates when list changes.',
      upvotes: 9,
      downvotes: 0
    });

    post1.acceptedReplyId = reply1._id;
    post1.solutionReplyId = reply1._id;
    await post1.save();
  }

  const postTitles = [
    'How do I deploy an Express Node API to Render without crashes?',
    'What are the best resources to master NumPy vectors matrices?',
    'Penetration testing certifications: OSCP vs CEH?',
    'Figma dynamic autolayout configurations help needed!',
    'Is NestJS better than Express for scalable production backends?',
    'How do I study dynamic programming for technical coding rounds?',
    'AWS EC2 pricing models explained simply',
    'React 19 compiler vs manual useMemo setups',
    'How to transition from QA engineering to Backend Dev?',
    'Best practices for securing mongoose schema endpoints'
  ];

  const postContents = [
    'I keep getting server rejections when setting up CORS variables. The logs say origin is blocked. What are your whitelist configs?',
    'Trying to understand array broadcasting shapes. If my left matrix is (3, 1) and right is (3,), how do they broadcast?',
    'Looking to invest time into pentesting certifications. Which carries more industry weight for security analysts?',
    'Struggling to build grid-template-columns that wrap cleanly without overflow bounds. Any tips?',
    'I want to transition my career path. Should I learn database indexing early or focus on system architecture loops?'
  ];

  const categories = Object.values(PostCategory);

  // Seed 80 Bulk Posts
  let replyCount = 0;
  for (let i = 0; i < 80; i++) {
    const author = rng.pick(learners);
    const title = `${rng.pick(postTitles)} - #${i + 1}`;
    const content = rng.pick(postContents);
    const category = rng.pick(categories);

    const post = await Post.create({
      title,
      content,
      authorId: author._id,
      category,
      tags: [rng.pick(['node', 'react', 'numpy', 'security', 'aws', 'figma']), 'seeding'],
      upvotes: rng.nextInt(0, 20),
      downvotes: rng.chance(0.1) ? rng.nextInt(1, 3) : 0,
      isPinned: rng.chance(0.05),
      viewCount: rng.nextInt(10, 200)
    });

    // Seed 1 to 3 replies
    const repliesToCreate = rng.nextInt(1, 3);
    let bestReply: any = null;
    for (let r = 0; r < repliesToCreate; r++) {
      const replier = rng.pick(users);
      const rep = await Reply.create({
        postId: post._id,
        authorId: replier._id,
        content: rng.pick([
          'I highly suggest checking MDN guides on semantic elements layouts.',
          'Try implementing a global middleware catch block first.',
          'Verify your connection string syntax in the environment settings.',
          'Make sure you represent your state variables cleanly without destructuring.'
        ]),
        upvotes: rng.nextInt(0, 10),
        downvotes: 0
      });
      replyCount++;
      if (!bestReply || rep.upvotes > bestReply.upvotes) {
        bestReply = rep;
      }
    }

    // Solve 30% of threads
    if (rng.chance(0.3) && bestReply) {
      post.isResolved = true;
      post.isSolved = true;
      post.acceptedReplyId = bestReply._id;
      post.solutionReplyId = bestReply._id;
      await post.save();
    }
  }

  console.log(`✅ Seeded 80+ forum posts and ${replyCount} replies into the database!`);
};

if (require.main === module) {
  seedForums()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
