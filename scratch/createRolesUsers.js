require('ts-node/register');
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { User, Role } = require('../src/modules/users/user.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const password = 'DemoPass123!';

const roleAccounts = [
  { name: 'Standard User', email: 'role_user@ascendpath.dev', role: Role.USER },
  { name: 'Active Explorer', email: 'role_explorer@ascendpath.dev', role: Role.EXPLORER },
  { name: 'Pathfinder Leader', email: 'role_pathfinder@ascendpath.dev', role: Role.PATHFINDER },
  { name: 'Elite Guide', email: 'role_guide@ascendpath.dev', role: Role.GUIDE },
  { name: 'Moderator Alpha', email: 'role_moderator@ascendpath.dev', role: Role.MODERATOR },
  { name: 'Admin Master', email: 'role_admin@ascendpath.dev', role: Role.ADMIN },
  { name: 'Super Admin Prime', email: 'role_super_admin@ascendpath.dev', role: Role.SUPER_ADMIN },
  { name: 'Sentinel Shield', email: 'role_sentinel@ascendpath.dev', role: Role.SENTINEL },
  { name: 'System Architect', email: 'role_architect@ascendpath.dev', role: Role.ARCHITECT }
];

async function run() {
  console.log('Connecting to database at:', mongoUri.replace(/\/\/.*@/, '//***:***@'));
  await mongoose.connect(mongoUri);
  console.log('Connected successfully to MongoDB.');

  const passwordHash = await bcrypt.hash(password, 10);

  for (const account of roleAccounts) {
    console.log(`Upserting account [${account.role}] -> ${account.email}...`);
    await User.findOneAndUpdate(
      { email: account.email },
      {
        $set: {
          name: account.name,
          email: account.email,
          passwordHash: passwordHash,
          role: account.role,
          roles: [account.role],
          isVerified: true,
          isBanned: false,
          respectPoints: 100,
          fameScore: 50,
          onboardingCompleted: true
        }
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  console.log('\nAll role accounts created and validated in MongoDB successfully!');
  console.log('Credential Details:');
  console.log('Common Password: ' + password);
  for (const account of roleAccounts) {
    console.log(`- Role: ${account.role.padEnd(12)} | Email: ${account.email}`);
  }

  await mongoose.disconnect();
  console.log('Database disconnected successfully. Seed script complete.');
}

run().catch(async (error) => {
  console.error('Failed to run seed script:', error);
  await mongoose.disconnect();
  process.exit(1);
});
