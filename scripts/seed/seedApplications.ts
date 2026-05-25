import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { Opportunity } from '../../src/modules/opportunities/opportunity.model';
import { Application } from '../../src/modules/opportunities/application.model';
import { connectDb, SeededRandom } from './helper';

export const seedApplications = async () => {
  await connectDb();

  console.log('📝 Wiping and seeding 50+ dynamic Opportunity Application pipelines...');
  await Application.deleteMany({});

  const rng = new SeededRandom(555);

  const learners = await User.find({ role: { $in: [Role.USER, Role.PATHFINDER] } });
  const opportunities = await Opportunity.find({});

  if (!learners.length || !opportunities.length) {
    console.error('❌ Users or Opportunities not found. Run seedUsers and seedOpportunities first.');
    return;
  }

  // Seed Named Applications first for demo users
  const aisha = await User.findOne({ email: 'active_learner@ascendpath.dev' });
  const leo = await User.findOne({ email: 'struggling_learner@ascendpath.dev' });
  const vercelIntern = await Opportunity.findOne({ slug: 'vercel-frontend-developer-intern' });

  if (aisha && vercelIntern) {
    await Application.create({
      userId: aisha._id,
      opportunityId: vercelIntern._id,
      status: 'shortlisted',
      notes: 'Vercel recruiter reached out on LinkedIn! Reviewing grid structures and hooks optimization.',
      reminders: [
        { date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), note: 'Prep CSS v4 custom variables', sent: false }
      ],
      mentorGuidance: 'Elena advised focusing on Next.js rendering cycles (SSR vs Static) and custom Zustand selectors.',
      interviewReflections: 'Initial HR screening went smoothly. Behavioral questions validated. Technical task scheduled.'
    });
  }

  const statuses = ['applied', 'shortlisted', 'interviewing', 'rejected', 'accepted'];

  // Seed 50 Bulk applications
  let applicationCount = 0;
  for (const learner of learners) {
    const appsToCreate = rng.nextInt(1, 2);
    const selectedOpps = rng.pickMultiple(opportunities, appsToCreate);

    for (const opp of selectedOpps) {
      if (aisha && vercelIntern && learner._id.toString() === aisha._id.toString() && opp._id.toString() === vercelIntern._id.toString()) {
        continue; // Already seeded named one
      }

      try {
        await Application.create({
          userId: learner._id,
          opportunityId: opp._id,
          status: rng.pick(statuses) as any,
          notes: rng.pick([
            'Submitted resume and portfolio. Keeping fingers crossed!',
            'Practiced coding problems on Leetcode to prepare for the test.',
            'Need to review my NMAP scan logs in detail.',
            'Initial behavioral screen completed.'
          ]),
          reminders: rng.chance(0.3) ? [
            { date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), note: 'Follow up with recruiter', sent: false }
          ] : [],
          mentorGuidance: rng.chance(0.3) ? 'Mentor advised focusing on foundational array vectorization methods.' : undefined,
          interviewReflections: rng.chance(0.2) ? 'Technical assessment was hard but fair. Waiting on results.' : undefined
        });
        applicationCount++;
      } catch (err) {
        // Enforce unique index safely (userId + opportunityId)
      }
    }
  }

  console.log(`✅ Seeded ${applicationCount} opportunity applications into the tracker database.`);
};

if (require.main === module) {
  seedApplications()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
