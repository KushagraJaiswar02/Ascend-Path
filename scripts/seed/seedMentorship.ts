import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { CareerRoadmap } from '../../src/modules/roadmaps/roadmap.model';
import { MentorshipConversation, MentorshipMessage, SessionEscalationRequest, MentorshipConversationStatus, MentorshipStartedFrom, MentorshipMessageType, SessionEscalationStatus } from '../../src/modules/mentorship/mentorship.model';
import { connectDb, SeededRandom } from './helper';

export const seedMentorship = async () => {
  await connectDb();

  console.log('💬 Wiping and seeding 30+ Mentorship Conversations, 250+ Messages, and DMs...');
  await MentorshipConversation.deleteMany({});
  await MentorshipMessage.deleteMany({});
  await SessionEscalationRequest.deleteMany({});

  const rng = new SeededRandom(1234);

  const guides = await User.find({ role: Role.GUIDE });
  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });
  const rm = await CareerRoadmap.findOne({ slug: 'frontend-engineering-react' });

  if (!guides.length || !learners.length) {
    console.error('❌ Users not found. Please run seedUsers first.');
    return;
  }

  // Seed named conversations first for demo users
  const elena = await User.findOne({ email: 'frontend_mentor@ascendpath.dev' });
  const leo = await User.findOne({ email: 'struggling_learner@ascendpath.dev' });
  const aisha = await User.findOne({ email: 'active_learner@ascendpath.dev' });

  if (elena && aisha && leo) {
    const aishaConv = await MentorshipConversation.create({
      participants: [elena._id, aisha._id],
      mentorId: elena._id,
      menteeId: aisha._id,
      status: MentorshipConversationStatus.ACTIVE,
      startedFrom: MentorshipStartedFrom.PING,
      linkedRoadmapId: rm?._id,
      lastMessageAt: new Date(),
      lastMessagePreview: 'I highly suggest reviewing selector states in your Zustand stores.',
      unreadCounts: new Map([[elena._id.toString(), 0], [aisha._id.toString(), 1]]),
      participantStates: [
        { userId: elena._id, lastReadAt: new Date() },
        { userId: aisha._id, lastReadAt: new Date(Date.now() - 1000 * 60 * 10), pinnedAdvice: 'Focus on selector optimization before optimizing media queries.' }
      ]
    });

    await MentorshipMessage.create([
      {
        conversationId: aishaConv._id,
        senderId: aisha._id,
        messageType: MentorshipMessageType.TEXT,
        content: 'Hi Elena! I successfully completed the Flexbox and CSS Grid sections in the Frontend roadmap.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
      },
      {
        conversationId: aishaConv._id,
        senderId: elena._id,
        messageType: MentorshipMessageType.TEXT,
        content: 'Excellent work, Aisha! Your selector renders look great too. Are you having any issues with performance?',
        createdAt: new Date(Date.now() - 1000 * 60 * 50)
      },
      {
        conversationId: aishaConv._id,
        senderId: aisha._id,
        messageType: MentorshipMessageType.TEXT,
        content: 'I noticed some rendering delays when the custom select component loads high-density assets.',
        createdAt: new Date(Date.now() - 1000 * 60 * 30)
      },
      {
        conversationId: aishaConv._id,
        senderId: elena._id,
        messageType: MentorshipMessageType.TEXT,
        content: 'I highly suggest reviewing selector states in your Zustand stores.',
        createdAt: new Date()
      }
    ]);

    const leoConv = await MentorshipConversation.create({
      participants: [elena._id, leo._id],
      mentorId: elena._id,
      menteeId: leo._id,
      status: MentorshipConversationStatus.ACTIVE,
      startedFrom: MentorshipStartedFrom.PING,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      lastMessagePreview: 'Please submit a session escalation request so we can lock in a time to debug.',
      unreadCounts: new Map([[elena._id.toString(), 0], [leo._id.toString(), 0]]),
      participantStates: [
        { userId: elena._id, lastReadAt: new Date() },
        { userId: leo._id, lastReadAt: new Date() }
      ]
    });

    await MentorshipMessage.create([
      {
        conversationId: leoConv._id,
        senderId: leo._id,
        messageType: MentorshipMessageType.TEXT,
        content: 'Elena, Mongoose schemas keep throwing uncaught exceptions in my middleware endpoints. I feel lost.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26)
      },
      {
        conversationId: leoConv._id,
        senderId: elena._id,
        messageType: MentorshipMessageType.TEXT,
        content: 'Do not panic, Leo! Exception catching in Node requires clean error handler models. Please submit a session escalation request so we can lock in a time to debug.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
      }
    ]);

    await SessionEscalationRequest.create({
      conversationId: leoConv._id,
      mentorId: elena._id,
      menteeId: leo._id,
      requestedBy: leo._id,
      topic: 'Express Exception catch blocks & Schema compilation reviews',
      objective: 'Debug my active database connection middleware code and trace uncaught exception crashes.',
      roadmapArea: 'Backend Database schema compilation',
      urgency: 'high',
      preferredSlots: ['Thursday afternoon', 'Friday morning'],
      expectedHelpType: '1-on-1 Debugging & Concept review',
      status: SessionEscalationStatus.PENDING,
      proposedSlots: []
    });
  }

  // Seed 30 Bulk Conversations
  let totalDMs = 0;
  for (let i = 0; i < 30; i++) {
    const guide = rng.pick(guides);
    const learner = rng.pick(learners);

    if (elena && aisha && leo && 
       ((guide._id.toString() === elena._id.toString() && learner._id.toString() === aisha._id.toString()) ||
        (guide._id.toString() === elena._id.toString() && learner._id.toString() === leo._id.toString()))) {
      continue; // Skip seeded named ones
    }

    try {
      const conv = await MentorshipConversation.create({
        participants: [guide._id, learner._id],
        mentorId: guide._id,
        menteeId: learner._id,
        status: MentorshipConversationStatus.ACTIVE,
        startedFrom: MentorshipStartedFrom.MENTOR_PROFILE,
        lastMessageAt: new Date(),
        lastMessagePreview: 'Good luck with your studying! Talk soon.',
        unreadCounts: new Map([[guide._id.toString(), 0], [learner._id.toString(), rng.chance(0.3) ? 1 : 0]]),
        participantStates: [
          { userId: guide._id, lastReadAt: new Date() },
          { userId: learner._id, lastReadAt: new Date(Date.now() - 1000 * 60 * 20) }
        ]
      });

      // Generate 5 to 10 random dialogue messages
      const msgCount = rng.nextInt(5, 10);
      for (let m = 0; m < msgCount; m++) {
        const sender = rng.chance(0.5) ? guide._id : learner._id;
        const dialogue = [
          'Hello! How is progress going on the roadmap?',
          'Making steady progress! Currently studying database models.',
          'Awesome. Make sure to map out compound indexes early on.',
          'Thanks! Will review the step tips.',
          'Good luck with your studying! Talk soon.'
        ];

        await MentorshipMessage.create({
          conversationId: conv._id,
          senderId: sender,
          messageType: MentorshipMessageType.TEXT,
          content: dialogue[m % dialogue.length],
          createdAt: new Date(Date.now() - (msgCount - m) * 1000 * 60 * 10)
        });
        totalDMs++;
      }

      // Seed a few bulk session escalation requests
      if (rng.chance(0.2)) {
        await SessionEscalationRequest.create({
          conversationId: conv._id,
          mentorId: guide._id,
          menteeId: learner._id,
          requestedBy: learner._id,
          topic: `Review topic: ${rng.pick(['Autolayout elements', 'Stealth scans', 'Matrix dimensions'])}`,
          objective: 'Need help resolving visual bugs and layout constraints.',
          urgency: rng.pick(['low', 'normal', 'high']),
          preferredSlots: ['Monday morning', 'Friday afternoon'],
          expectedHelpType: '1-on-1 Review',
          status: rng.pick([SessionEscalationStatus.PENDING, SessionEscalationStatus.ACCEPTED])
        });
      }
    } catch (err) {
      // Catch unique index collisions safely
    }
  }

  console.log(`✅ Seeded 30+ conversations and ${totalDMs} DMs into the database successfully!`);
};

if (require.main === module) {
  seedMentorship()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
