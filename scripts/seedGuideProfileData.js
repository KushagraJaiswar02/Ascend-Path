require('ts-node/register');
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Role, EducationLevel, GuideRank } = require('../src/modules/users/user.model');
const { Session, SessionStatus } = require('../src/modules/sessions/session.model');
const { CareerRoadmap } = require('../src/modules/roadmaps/roadmap.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const password = 'DemoPass123!';
const seedTag = 'profile-seed';

const extraGuides = [
  {
    name: 'Sarah Connor',
    email: 'sarah.guide@ascendpath.dev',
    role: Role.GUIDE,
    educationLevel: EducationLevel.PROFESSIONAL,
    bio: 'DevOps & Site Reliability Engineer at a tier-1 tech company. Passionate about Docker, Kubernetes, CI/CD pipelines, and cloud migrations.',
    domains: ['DevOps', 'System Design'],
    skills: [
      { name: 'Kubernetes', level: 'Expert', years: 4 },
      { name: 'Docker', level: 'Expert', years: 5 },
      { name: 'AWS', level: 'Intermediate', years: 3 },
      { name: 'CI/CD', level: 'Expert', years: 4 },
      { name: 'Linux', level: 'Intermediate', years: 6 }
    ],
    interests: ['Infrastructure', 'Scale', 'System Admin'],
    respectPoints: 480,
    fameScore: 82,
    guideRank: GuideRank.EXPERT,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    socialLinks: {
      github: 'https://github.com/sarah-devops',
      linkedin: 'https://linkedin.com/in/sarah-devops',
      website: 'https://sarahconnor.io',
    },
    availability: {
      text: 'Available Weekends and Tuesday/Thursday evenings',
      schedule: [
        { day: 'Tuesday', slots: ['6:00 PM - 7:00 PM', '7:00 PM - 8:00 PM'] },
        { day: 'Thursday', slots: ['6:00 PM - 7:00 PM', '7:00 PM - 8:00 PM'] },
        { day: 'Saturday', slots: ['10:00 AM - 11:30 AM', '2:00 PM - 3:30 PM'] }
      ]
    },
    totalSessions: 14,
    averageRating: 4.86,
    totalReviews: 7,
    profileVisibility: true,
    onboardingCompleted: true
  },
  {
    name: 'Dev Kapoor',
    email: 'dev.architect@ascendpath.dev',
    role: Role.GUIDE,
    educationLevel: EducationLevel.PROFESSIONAL,
    bio: 'Solutions Architect specializing in distributed systems, high scalability databases, and systems architecture. Ready to guide pathfinders into expert design roles.',
    domains: ['Backend Development', 'System Design'],
    skills: [
      { name: 'System Design', level: 'Expert', years: 8 },
      { name: 'MongoDB', level: 'Expert', years: 6 },
      { name: 'Redis', level: 'Expert', years: 4 },
      { name: 'Node.js', level: 'Expert', years: 7 },
      { name: 'Microservices', level: 'Expert', years: 5 }
    ],
    interests: ['architecture', 'scalability', 'mentorship'],
    respectPoints: 920,
    fameScore: 94,
    guideRank: GuideRank.EXPERT,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    socialLinks: {
      github: 'https://github.com/dev-architect',
      linkedin: 'https://linkedin.com/in/dev-architect',
      website: 'https://devkapoor.dev',
    },
    availability: {
      text: 'Evenings 7:00 PM - 9:00 PM',
      schedule: [
        { day: 'Monday', slots: ['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'] },
        { day: 'Wednesday', slots: ['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'] },
        { day: 'Friday', slots: ['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'] }
      ]
    },
    totalSessions: 22,
    averageRating: 4.95,
    totalReviews: 12,
    profileVisibility: true,
    onboardingCompleted: true
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@ascendpath.dev',
    role: Role.GUIDE,
    educationLevel: EducationLevel.PROFESSIONAL,
    bio: 'Product Designer and UX Researcher. Helping developers understand the magic of design systems, accessibility, and high-fidelity wireframing.',
    domains: ['Frontend Development'],
    skills: [
      { name: 'UI/UX Design', level: 'Expert', years: 5 },
      { name: 'Figma', level: 'Expert', years: 4 },
      { name: 'Product Strategy', level: 'Intermediate', years: 3 },
      { name: 'TailwindCSS', level: 'Expert', years: 3 }
    ],
    interests: ['visual design', 'usability', 'mentoring'],
    respectPoints: 310,
    fameScore: 56,
    guideRank: GuideRank.ESTABLISHED,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/elena-figma',
      website: 'https://elenadesigns.com',
    },
    availability: {
      text: 'Mornings 9:00 AM - 11:00 AM EST',
      schedule: [
        { day: 'Wednesday', slots: ['9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM'] },
        { day: 'Thursday', slots: ['9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM'] }
      ]
    },
    totalSessions: 6,
    averageRating: 4.75,
    totalReviews: 4,
    profileVisibility: true,
    onboardingCompleted: true
  }
];

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for profile seeding...');

  const passwordHash = await bcrypt.hash(password, 10);

  // 1. Clean up existing seeded data
  await Promise.all([
    User.deleteMany({ email: { $in: extraGuides.map(g => g.email) } }),
    Session.deleteMany({ title: { $regex: seedTag, $options: 'i' } }),
    CareerRoadmap.deleteMany({ domain: seedTag }),
  ]);

  // 2. Insert guides
  const guideDocs = [];
  for (const guide of extraGuides) {
    const doc = await User.create({
      ...guide,
      passwordHash,
      isVerified: true,
      isBanned: false,
    });
    guideDocs.push(doc);
    console.log(`Seeded guide: ${doc.name} (${doc.email})`);
  }

  // 3. Find/Create a mock student for reviews
  let student = await User.findOne({ role: Role.EXPLORER });
  if (!student) {
    student = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.student@ascendpath.dev',
      passwordHash,
      role: Role.EXPLORER,
      educationLevel: EducationLevel.COLLEGE,
      bio: 'Student',
      skills: ['JS'],
      respectPoints: 10,
    });
  }

  const now = new Date();

  // 4. Seed completed sessions (Reviews) and open sessions (Slots) for Sarah Connor
  const sarahId = guideDocs[0]._id;
  await Session.insertMany([
    {
      guideId: sarahId,
      clientId: student._id,
      title: `${seedTag}: Kubernetes Cluster Setup`,
      topic: 'Kubernetes',
      description: 'Step-by-step setup of local minikube and multi-node clusters on cloud.',
      scheduledAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      price: 150,
      status: SessionStatus.COMPLETED,
      rating: 5,
      review: 'Incredibly knowledgeable. Sarah helped me debug my ingress controllers in 5 minutes! Highly recommend.',
    },
    {
      guideId: sarahId,
      clientId: student._id,
      title: `${seedTag}: CI/CD Pipelines with GitHub Actions`,
      topic: 'CI/CD',
      description: 'Optimizing build speeds and automating deployments.',
      scheduledAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      price: 100,
      status: SessionStatus.COMPLETED,
      rating: 4,
      review: 'Very clear instructions on dockerizing pipelines. Docking 1 star only because the audio broke for a minute, but she made up for it by staying late!',
    },
    // Open Slots
    {
      guideId: sarahId,
      title: `${seedTag}: Cloud Architecture Discussion`,
      topic: 'AWS Cloud',
      description: 'Discussing best practices for building secure, scalable VPC environments.',
      scheduledAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      price: 200,
      status: SessionStatus.OPEN,
    },
    {
      guideId: sarahId,
      title: `${seedTag}: Docker basics for absolute beginners`,
      topic: 'Docker',
      description: 'Interactive session exploring Dockerfiles, layering, and container namespaces.',
      scheduledAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      price: 0,
      status: SessionStatus.OPEN,
    }
  ]);

  // 5. Seed roadmaps for Sarah
  await CareerRoadmap.create({
    createdBy: sarahId,
    title: 'Cloud & Infrastructure Roadmap (DevOps)',
    description: 'An industry-vetted checklist to master containerization, Kubernetes orchestration, and AWS provisioning.',
    targetRole: 'Site Reliability Engineer',
    domain: seedTag,
    estimatedWeeks: 12,
    isPublic: true,
    followerCount: 88,
    steps: [
      { title: 'Linux foundations and bash scripting', resources: ['Linux Documentation'], milestoneCheck: true },
      { title: 'Docker containerization', resources: ['Docker reference guide'], milestoneCheck: true },
      { title: 'Kubernetes scheduling & networking', resources: ['K8s official tutorials'], milestoneCheck: true },
      { title: 'AWS Cloud fundamentals', resources: ['AWS practitioner tracks'], milestoneCheck: false }
    ]
  });

  // 6. Seed completed reviews for Dev Kapoor
  const devId = guideDocs[1]._id;
  await Session.insertMany([
    {
      guideId: devId,
      clientId: student._id,
      title: `${seedTag}: Distributed Cache design`,
      topic: 'System Design',
      description: 'Deep dive on Redis, memcached, consistency hashing, and write-through patterns.',
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 60,
      price: 250,
      status: SessionStatus.COMPLETED,
      rating: 5,
      review: 'Dev is a mastermind of scalability. Discussing consistency tradeoffs changed the way I think about application state.',
    },
    // Open Slots
    {
      guideId: devId,
      title: `${seedTag}: Advanced MongoDB Aggregations`,
      topic: 'MongoDB',
      description: 'Reviewing heavy pipeline stages, indexing, and lookup performance.',
      scheduledAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      price: 150,
      status: SessionStatus.OPEN,
    }
  ]);

  // 7. Seed roadmaps for Dev
  await CareerRoadmap.create({
    createdBy: devId,
    title: 'Distributed Systems & Database Scaling',
    description: 'Master MongoDB replication, sharding, caching strategies, and partition tolerances.',
    targetRole: 'Senior Solutions Architect',
    domain: seedTag,
    estimatedWeeks: 8,
    isPublic: true,
    followerCount: 142,
    steps: [
      { title: 'Replication sets & quorum consensus', resources: ['MongoDB Architecture Manual'], milestoneCheck: true },
      { title: 'Consistent Hashing and Key-Value stores', resources: ['Dynamo paper review'], milestoneCheck: true },
      { title: 'Sharding patterns and range queries', resources: ['System design guides'], milestoneCheck: false }
    ]
  });

  console.log('Profile guide seed script completed successfully.');
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed profile guide data:', error);
  await mongoose.disconnect();
  process.exit(1);
});
