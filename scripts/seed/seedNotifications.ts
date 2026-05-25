import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { Notification, NotificationType } from '../../src/modules/notifications/notification.model';
import { connectDb, SeededRandom } from './helper';

export const seedNotifications = async () => {
  await connectDb();

  console.log('🔔 Wiping and seeding 100+ active Notification logs...');
  await Notification.deleteMany({});

  const rng = new SeededRandom(2222);

  const users = await User.find({});
  const guides = await User.find({ role: Role.GUIDE });
  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });

  if (!users.length || !guides.length || !learners.length) {
    console.error('❌ Users not found. Run seedUsers first.');
    return;
  }

  // Seed Named Notifications first
  const elena = await User.findOne({ email: 'frontend_mentor@ascendpath.dev' });
  const aisha = await User.findOne({ email: 'active_learner@ascendpath.dev' });
  const leo = await User.findOne({ email: 'struggling_learner@ascendpath.dev' });

  if (elena && aisha && leo) {
    await Notification.create([
      {
        recipientId: aisha._id,
        actorId: elena._id,
        type: NotificationType.MENTORSHIP_MESSAGE_RECEIVED,
        title: 'New mentorship message from Elena',
        message: 'Elena says: "I highly suggest reviewing selector states in your Zustand stores."',
        read: false
      },
      {
        recipientId: elena._id,
        actorId: aisha._id,
        type: NotificationType.SESSION_REFLECTION_SUBMITTED,
        title: 'Aisha Rahman submitted a reflection',
        message: 'Submitted reflections for CSS Grid session. Review is requested.',
        read: false
      },
      {
        recipientId: leo._id,
        actorId: elena._id,
        type: NotificationType.MENTOR_FOLLOWUP_ADDED,
        title: 'Elena added custom session feedback',
        message: 'Your try/catch Express blocks advice has been compiled.',
        read: true
      }
    ]);
  }

  const notificationTypes = [
    NotificationType.MENTORSHIP_MESSAGE_RECEIVED,
    NotificationType.POST_REPLY,
    NotificationType.POST_UPVOTED,
    NotificationType.SESSION_BOOKED,
    NotificationType.MENTOR_FOLLOWUP_ADDED
  ];

  // Seed 100 Bulk Notifications
  let count = 0;
  for (let i = 0; i < 100; i++) {
    const recipient = rng.pick(users);
    const actor = rng.pick(users);

    if (recipient._id.toString() === actor._id.toString()) continue;

    const type = rng.pick(notificationTypes);
    const read = rng.chance(0.6); // 60% read, 40% unread

    await Notification.create({
      recipientId: recipient._id,
      actorId: actor._id,
      type,
      title: rng.pick([
        'New post response received',
        'Your comment was upvoted!',
        'A mentor pinged you',
        'Upcoming session reminder'
      ]),
      message: rng.pick([
        'Check out the latest discussion thread updates.',
        'A user found your answer highly respect-worthy.',
        'Please review your active study checklist.'
      ]),
      read
    });
    count++;
  }

  console.log(`✅ Seeded ${count} platform notification logs successfully!`);
};

if (require.main === module) {
  seedNotifications()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
