import { resetDatabase } from './resetDatabase';
import { seedUsers } from './seedUsers';
import { seedTaxonomy } from './seedTaxonomy';
import { seedRoadmaps } from './seedRoadmaps';
import { seedCompanion } from './seedCompanion';
import { seedSessions } from './seedSessions';
import { seedOpportunities } from './seedOpportunities';
import { seedApplications } from './seedApplications';
import { seedMentorship } from './seedMentorship';
import { seedForums } from './seedForums';
import { seedNotifications } from './seedNotifications';
import { seedReports } from './seedReports';
import { seedAnalytics } from './seedAnalytics';
import { disconnectDb } from './helper';

export const seedEverything = async () => {
  const startTime = Date.now();
  console.log('🚀 Initiating AscendPath Ecosystem Data Seeding Engine...\n');

  try {
    // 1. Purge all existing data safely
    await resetDatabase();
    console.log('------------------------------------------------------------');

    // 2. Seed all core modules in order of structural dependencies
    await seedUsers();
    console.log('------------------------------------------------------------');

    await seedTaxonomy();
    console.log('------------------------------------------------------------');

    await seedRoadmaps();
    console.log('------------------------------------------------------------');

    await seedCompanion();
    console.log('------------------------------------------------------------');

    await seedSessions();
    console.log('------------------------------------------------------------');

    await seedOpportunities();
    console.log('------------------------------------------------------------');

    await seedApplications();
    console.log('------------------------------------------------------------');

    await seedMentorship();
    console.log('------------------------------------------------------------');

    await seedForums();
    console.log('------------------------------------------------------------');

    await seedNotifications();
    console.log('------------------------------------------------------------');

    await seedReports();
    console.log('------------------------------------------------------------');

    await seedAnalytics();
    console.log('------------------------------------------------------------');

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n🎉 SEEDING COMPLETED SUCCESSFULLY in ${duration} seconds!`);
    console.log('============================================================');
    console.log('               DEMO USER LOGIN CREDENTIALS                  ');
    console.log('============================================================');
    console.log('ROLE                EMAIL                        PASSWORD');
    console.log('------------------------------------------------------------');
    console.log('Super Admin         super_admin@ascendpath.dev   DemoPass123!');
    console.log('Admin / Architect   admin@ascendpath.dev         DemoPass123!');
    console.log('Moderator / Sentinel moderator@ascendpath.dev     DemoPass123!');
    console.log('Guide (Frontend)    frontend_mentor@ascendpath.dev DemoPass123!');
    console.log('Guide (AI/ML)       ai_mentor@ascendpath.dev       DemoPass123!');
    console.log('Guide (Security)    security_mentor@ascendpath.dev DemoPass123!');
    console.log('Learner (Active)    active_learner@ascendpath.dev  DemoPass123!');
    console.log('Learner (Struggling) struggling_learner@ascendpath.dev DemoPass123!');
    console.log('Learner (Beginner)  confused_beginner@ascendpath.dev DemoPass123!');
    console.log('============================================================\n');

  } catch (err) {
    console.error('💥 Seeding critical crash occurred:', err);
    process.exit(1);
  } finally {
    await disconnectDb();
  }
};

if (require.main === module) {
  seedEverything()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
