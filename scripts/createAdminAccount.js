/**
 * AscendPath — Create Admin Account Script
 * -----------------------------------------
 * Directly inserts a fully-privileged admin user into the MongoDB Atlas DB.
 * Run with: node scripts/createAdminAccount.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI not found in .env');
  process.exit(1);
}

// ── Admin credentials ────────────────────────────────────────────────
const ADMIN_NAME     = 'AscendPath Admin';
const ADMIN_EMAIL    = 'admin@ascendpath.dev';
const ADMIN_PASSWORD = 'Admin@AscendPath2026!';
// ─────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name:                 { type: String, required: true },
    email:                { type: String, required: true, unique: true, lowercase: true },
    passwordHash:         { type: String, required: true },
    role:                 { type: String, default: 'admin' },
    roles:                { type: [String], default: ['admin'] },
    capabilities:         { type: [String], default: [] },
    mentorProfileStatus:  { type: String, default: 'none' },
    respectPoints:        { type: Number,  default: 0 },
    fameScore:            { type: Number,  default: 0 },
    guideRank:            { type: String,  default: 'Rising Guide' },
    domains:              { type: [String], default: [] },
    careerDomains:        { type: [mongoose.Schema.Types.ObjectId], default: [] },
    careerGoals:          { type: [mongoose.Schema.Types.ObjectId], default: [] },
    preferredLanguages:   { type: [String], default: [] },
    skills:               { type: [], default: [] },
    interests:            { type: [String], default: [] },
    isVerified:           { type: Boolean, default: true },
    isBanned:             { type: Boolean, default: false },
    isSuspended:          { type: Boolean, default: false },
    falseReportStrikes:   { type: Number,  default: 0 },
    pingAvailable:        { type: Boolean, default: true },
    totalSessions:        { type: Number,  default: 0 },
    averageRating:        { type: Number,  default: 0 },
    totalReviews:         { type: Number,  default: 0 },
    profileVisibility:    { type: Boolean, default: true },
    showRoadmapActivity:  { type: Boolean, default: true },
    anonymousRoadmapParticipation: { type: Boolean, default: false },
    onboardingCompleted:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    console.log('🔌  Connecting to MongoDB Atlas…');
    await mongoose.connect(MONGODB_URI);
    console.log('✅  Connected.\n');

    // Check if admin already exists
    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`⚠️   Admin account already exists for: ${ADMIN_EMAIL}`);
      console.log('    Delete it first if you want to reset credentials.\n');
      await mongoose.disconnect();
      return;
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    const admin = await User.create({
      name:               ADMIN_NAME,
      email:              ADMIN_EMAIL,
      passwordHash,
      role:               'admin',
      roles:              ['admin', 'moderator'],
      capabilities:       [
        'admin:access',
        'admin:users:read',
        'admin:users:write',
        'admin:users:ban',
        'admin:users:delete',
        'admin:content:moderate',
        'admin:reports:view',
        'admin:guides:approve',
        'admin:guides:reject',
        'admin:analytics:view',
        'admin:taxonomy:manage',
        'discover:listed',
      ],
      isVerified:         true,
      onboardingCompleted: true,
    });

    console.log('🎉  Admin account created successfully!\n');
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│              ADMIN LOGIN CREDENTIALS                 │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log(`│  Name     : ${ADMIN_NAME.padEnd(39)} │`);
    console.log(`│  Email    : ${ADMIN_EMAIL.padEnd(39)} │`);
    console.log(`│  Password : ${ADMIN_PASSWORD.padEnd(39)} │`);
    console.log(`│  Role     : admin                                    │`);
    console.log(`│  MongoDB ID: ${admin._id.toString().padEnd(38)} │`);
    console.log('└─────────────────────────────────────────────────────┘');
    console.log('\n⚠️   Change the password after first login in production!\n');

  } catch (err) {
    console.error('❌  Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected from MongoDB.\n');
  }
}

createAdmin();
