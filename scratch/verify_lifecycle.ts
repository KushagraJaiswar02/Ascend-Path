import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { opportunityService } from '../src/modules/opportunities/opportunity.service';
import { Opportunity } from '../src/modules/opportunities/opportunity.model';
import { Application } from '../src/modules/opportunities/application.model';
import { User, Role } from '../src/modules/users/user.model';
import { GrowthTimelineEvent } from '../src/modules/companion/growthTimelineEvent.model';
import { CareerRoadmap } from '../src/modules/roadmaps/roadmap.model';
import { CareerDomain } from '../src/modules/taxonomy/careerDomain.model';
import { CareerGoal } from '../src/modules/taxonomy/careerGoal.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

async function run() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected.\n');

    // Force evaluation of side-effect models to prevent TS tree-shaking
    console.log(`📦 Registered models: ${CareerRoadmap.modelName}, ${CareerDomain.modelName}, ${CareerGoal.modelName}`);

    console.log('🔄 Syncing user database indexes...');
    await User.syncIndexes();
    console.log('✅ Indexes synced.\n');

    // 1. Setup mock user
    console.log('⚙️ Mocking user profile...');
    const user: any = await User.create({
      name: 'Lifecycle Student',
      email: `lifecycle-${Date.now()}@ascend.test`,
      passwordHash: 'dummy',
      role: Role.USER,
      skills: [{ name: 'React', level: 'intermediate' }],
      totalSessions: 2,
    });
    console.log(`✅ Mock User created with ID: ${user._id}`);

    // 2. Create opportunity (pending verification)
    console.log('⚙️ Mocking opportunity proposal by user...');
    const oppData = {
      title: 'Lifecycle UI Intern',
      organizationName: 'Lifecycle Inc',
      requirements: 'Must know React',
      location: 'Remote',
      opportunityType: 'internship',
      difficulty: 'beginner',
      remoteStatus: 'remote',
      careerDomains: [],
      careerGoals: [],
      requiredSkills: ['React'],
      recommendedRoadmaps: [],
      applicationLink: 'https://example.com/apply',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days out
    };
    const opp: any = await opportunityService.createOpportunity(oppData, user._id.toString(), false);
    console.log(`✅ Opportunity created with status: ${opp.verificationStatus}`);
    if (opp.verificationStatus !== 'pending') {
      throw new Error(`Expected opportunity to be pending, got: ${opp.verificationStatus}`);
    }

    // 3. Admin verifies opportunity
    console.log('⚙️ Verifying opportunity as admin...');
    const verifiedOpp: any = await opportunityService.verifyOpportunity(opp._id.toString(), 'approved', true);
    console.log(`✅ Opportunity verificationStatus: ${verifiedOpp.verificationStatus}, isFeatured: ${verifiedOpp.isFeatured}`);
    if (verifiedOpp.verificationStatus !== 'approved') {
      throw new Error(`Expected approved status, got: ${verifiedOpp.verificationStatus}`);
    }

    // 4. User applies to the opportunity
    console.log('⚙️ User applying to the verified opportunity...');
    const application: any = await opportunityService.applyToOpportunity(user._id.toString(), verifiedOpp._id.toString());
    console.log(`✅ Application tracked. ID: ${application._id}, status: ${application.status}`);
    if (application.status !== 'applied') {
      throw new Error(`Expected application status to be "applied", got: ${application.status}`);
    }

    // Verify growth timeline event was logged for application submission
    const submissionEvent = await GrowthTimelineEvent.findOne({
      userId: user._id,
      entityId: application._id,
      type: 'application_submitted',
    });
    console.log(`✅ Checked GrowthTimelineEvent for submission: ${submissionEvent ? 'Found' : 'Not Found'}`);
    if (!submissionEvent) {
      throw new Error('Expected GrowthTimelineEvent for "application_submitted" not found');
    }

    // 5. Update application status (moving to interviewing)
    console.log('⚙️ Updating application status to interviewing...');
    const updatedApp: any = await opportunityService.updateApplication(user._id.toString(), application._id.toString(), {
      status: 'interviewing',
    });
    console.log(`✅ Application status updated to: ${updatedApp.status}`);
    if (updatedApp.status !== 'interviewing') {
      throw new Error(`Expected application status to be "interviewing", got: ${updatedApp.status}`);
    }

    // Verify growth timeline event was logged for interviewing status change
    const interviewEvent = await GrowthTimelineEvent.findOne({
      userId: user._id,
      entityId: application._id,
      type: 'application_interviewing',
    });
    console.log(`✅ Checked GrowthTimelineEvent for interviewing: ${interviewEvent ? 'Found' : 'Not Found'}`);
    if (!interviewEvent) {
      throw new Error('Expected GrowthTimelineEvent for "application_interviewing" not found');
    }

    // 6. Clean up
    console.log('\n🧹 Cleaning up test mock documents...');
    await User.findByIdAndDelete(user._id);
    await Opportunity.findByIdAndDelete(opp._id);
    await Application.findByIdAndDelete(application._id);
    await GrowthTimelineEvent.deleteMany({ userId: user._id });

    console.log('🎉 Integration lifecycle test passed successfully!');
  } catch (error) {
    console.error('❌ Integration verification failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from DB.');
  }
}

run();
