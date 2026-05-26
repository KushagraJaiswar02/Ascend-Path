require('ts-node/register');
require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User, Role, EducationLevel, CareerStage, GuideRank } = require('../src/modules/users/user.model');
const { Post, PostCategory } = require('../src/modules/posts/post.model');
const { Reply } = require('../src/modules/posts/reply.model');
const {
  Session,
  SessionStatus,
  SessionType,
  RegistrationMode,
  SessionCategory,
  AttendanceStatus,
  SessionExecutionState,
  MeetingProvider,
} = require('../src/modules/sessions/session.model');
const { PingRequest, PingStatus } = require('../src/modules/pings/ping.model');
const { CareerRoadmap, RoadmapSection, RoadmapStep } = require('../src/modules/roadmaps/roadmap.model');
const { UserProgress } = require('../src/modules/roadmaps/userProgress.model');
const { Notification, NotificationType } = require('../src/modules/notifications/notification.model');
const { Review } = require('../src/modules/reviews/review.model');
const {
  MentorshipConversation,
  MentorshipMessage,
  SessionEscalationRequest,
  MentorshipConversationStatus,
  MentorshipStartedFrom,
  MentorshipMessageType,
  SessionEscalationStatus,
} = require('../src/modules/mentorship/mentorship.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';
const seedTag = process.env.BULK_SEED_TAG || 'full-spectrum-seed';
const password = process.env.BULK_DEMO_PASSWORD || 'DemoPass123!';
const shouldFullReset = process.env.BULK_FULL_RESET !== 'false';

const counts = {
  totalUsers: Number(process.env.BULK_TOTAL_USERS || 200),
  roadmaps: Number(process.env.BULK_ROADMAPS || 84),
  posts: Number(process.env.BULK_POSTS || 720),
  sessions: Number(process.env.BULK_SESSIONS || 360),
  pings: Number(process.env.BULK_PINGS || 420),
  notifications: Number(process.env.BULK_NOTIFICATIONS || 1400),
  conversations: Number(process.env.BULK_CONVERSATIONS || 90),
};

const streamProfiles = [
  {
    stream: 'Information Technology',
    aliases: ['IT', 'IT Engineering', 'Systems Administration'],
    cluster: 'Technology & Engineering',
    mentorTitle: 'IT Infrastructure Mentor',
    learnerTitle: 'IT Support Engineer',
    skills: ['Networking', 'Linux', 'Cloud Support', 'ITIL', 'Troubleshooting', 'Scripting'],
    roadmapSubjects: ['IT Support to Cloud Operations', 'Enterprise Networking Foundations', 'Linux Administration'],
    outcomes: ['IT Support Analyst', 'Cloud Support Associate', 'System Administrator'],
  },
  {
    stream: 'Computer Science',
    aliases: ['CS', 'Software Engineering', 'Programming'],
    cluster: 'Technology & Engineering',
    mentorTitle: 'Software Engineering Mentor',
    learnerTitle: 'Software Developer',
    skills: ['Data Structures', 'JavaScript', 'React', 'Node.js', 'Databases', 'System Design'],
    roadmapSubjects: ['Full Stack Software Engineering', 'DSA Interview Track', 'Open Source Portfolio'],
    outcomes: ['Software Engineer', 'Full Stack Developer', 'Backend Engineer'],
  },
  {
    stream: 'Electronics & Communication',
    aliases: ['ECE', 'EC', 'Electronics Engineering'],
    cluster: 'Technology & Engineering',
    mentorTitle: 'Embedded Systems Mentor',
    learnerTitle: 'Embedded Engineer',
    skills: ['Digital Electronics', 'Signals', 'Embedded C', 'IoT', 'VLSI Basics', 'PCB Design'],
    roadmapSubjects: ['Embedded Systems with IoT', 'VLSI Fundamentals', 'Communication Systems'],
    outcomes: ['Embedded Engineer', 'IoT Developer', 'VLSI Trainee'],
  },
  {
    stream: 'Mechanical Engineering',
    aliases: ['Mechanical', 'Mech', 'Manufacturing'],
    cluster: 'Technology & Engineering',
    mentorTitle: 'Mechanical Design Mentor',
    learnerTitle: 'Mechanical Engineer',
    skills: ['CAD', 'Thermodynamics', 'Manufacturing', 'SolidWorks', 'GD&T', 'Quality Control'],
    roadmapSubjects: ['CAD to Manufacturing', 'Mechanical Design Portfolio', 'Production Engineering'],
    outcomes: ['Design Engineer', 'Production Engineer', 'Quality Engineer'],
  },
  {
    stream: 'Civil Engineering',
    aliases: ['Civil', 'Structural Engineering', 'Construction'],
    cluster: 'Technology & Engineering',
    mentorTitle: 'Civil Projects Mentor',
    learnerTitle: 'Civil Engineer',
    skills: ['AutoCAD', 'Structural Analysis', 'Surveying', 'Estimation', 'Project Planning', 'Concrete Tech'],
    roadmapSubjects: ['Construction Site Readiness', 'Structural Design Basics', 'Civil Estimation'],
    outcomes: ['Site Engineer', 'Structural Trainee', 'Planning Engineer'],
  },
  {
    stream: 'BBA',
    aliases: ['Bachelor of Business Administration', 'Business Administration'],
    cluster: 'Commerce & Business',
    mentorTitle: 'Business Foundations Mentor',
    learnerTitle: 'Business Analyst',
    skills: ['Business Communication', 'Market Research', 'Excel', 'Operations', 'Presentation', 'Accounting Basics'],
    roadmapSubjects: ['BBA Internship Readiness', 'Business Analytics Starter', 'Management Case Practice'],
    outcomes: ['Business Analyst Intern', 'Operations Associate', 'Management Trainee'],
  },
  {
    stream: 'MBA',
    aliases: ['Master of Business Administration', 'Management'],
    cluster: 'Commerce & Business',
    mentorTitle: 'MBA Career Mentor',
    learnerTitle: 'Product or Strategy Manager',
    skills: ['Strategy', 'Finance', 'Marketing', 'Leadership', 'Case Interviews', 'Product Thinking'],
    roadmapSubjects: ['MBA Consulting Prep', 'Product Management Transition', 'Growth Strategy'],
    outcomes: ['Product Manager', 'Consultant', 'Strategy Associate'],
  },
  {
    stream: 'Finance',
    aliases: ['BCom Finance', 'Investment Banking', 'Accounting'],
    cluster: 'Commerce & Business',
    mentorTitle: 'Finance Careers Mentor',
    learnerTitle: 'Financial Analyst',
    skills: ['Financial Modeling', 'Accounting', 'Valuation', 'Excel', 'Power BI', 'Risk Analysis'],
    roadmapSubjects: ['Financial Analyst Career Track', 'Investment Banking Prep', 'Accounting to Analytics'],
    outcomes: ['Financial Analyst', 'Equity Research Intern', 'Risk Analyst'],
  },
  {
    stream: 'Marketing',
    aliases: ['Digital Marketing', 'Brand Management', 'Growth'],
    cluster: 'Commerce & Business',
    mentorTitle: 'Marketing Mentor',
    learnerTitle: 'Marketing Associate',
    skills: ['SEO', 'Content Strategy', 'Performance Marketing', 'Branding', 'Analytics', 'Copywriting'],
    roadmapSubjects: ['Digital Marketing Portfolio', 'Brand Strategy Basics', 'Growth Marketing Sprint'],
    outcomes: ['Digital Marketer', 'Brand Associate', 'Growth Intern'],
  },
  {
    stream: 'Medicine & Healthcare',
    aliases: ['MBBS', 'Nursing', 'Pharmacy', 'Public Health'],
    cluster: 'Medicine & Healthcare',
    mentorTitle: 'Healthcare Career Mentor',
    learnerTitle: 'Healthcare Professional',
    skills: ['Clinical Basics', 'Medical Ethics', 'Patient Communication', 'Public Health', 'Research', 'Exam Prep'],
    roadmapSubjects: ['Medical Entrance Planning', 'Public Health Career Track', 'Clinical Research Starter'],
    outcomes: ['Medical Student', 'Clinical Research Intern', 'Public Health Associate'],
  },
  {
    stream: 'Law',
    aliases: ['LLB', 'Legal Studies', 'Corporate Law'],
    cluster: 'Law & Governance',
    mentorTitle: 'Legal Careers Mentor',
    learnerTitle: 'Legal Associate',
    skills: ['Legal Research', 'Case Briefing', 'Contract Drafting', 'Moot Court', 'Compliance', 'Writing'],
    roadmapSubjects: ['Law Internship Readiness', 'Corporate Law Foundations', 'Moot Court Preparation'],
    outcomes: ['Legal Intern', 'Compliance Associate', 'Corporate Law Trainee'],
  },
  {
    stream: 'Psychology',
    aliases: ['Counselling', 'Clinical Psychology', 'Behavioral Science'],
    cluster: 'Arts & Humanities',
    mentorTitle: 'Psychology Career Mentor',
    learnerTitle: 'Psychology Research Assistant',
    skills: ['Research Methods', 'Counselling Basics', 'Statistics', 'Ethics', 'Assessment', 'Communication'],
    roadmapSubjects: ['Psychology Research Path', 'Counselling Foundations', 'Behavioral Science Portfolio'],
    outcomes: ['Research Assistant', 'Counselling Intern', 'HR Psychology Associate'],
  },
  {
    stream: 'Design & Creative Arts',
    aliases: ['UX Design', 'Graphic Design', 'Animation', 'Fashion Design'],
    cluster: 'Design & Creative Arts',
    mentorTitle: 'Creative Portfolio Mentor',
    learnerTitle: 'Designer',
    skills: ['Figma', 'Visual Design', 'User Research', 'Portfolio', 'Storyboarding', 'Typography'],
    roadmapSubjects: ['UX Portfolio Builder', 'Graphic Design Client Kit', 'Animation Fundamentals'],
    outcomes: ['UX Designer', 'Graphic Designer', 'Creative Intern'],
  },
  {
    stream: 'Civil Services & Government Exams',
    aliases: ['UPSC', 'Banking Exams', 'Railways', 'Defence'],
    cluster: 'Government & Civil Services',
    mentorTitle: 'Exam Strategy Mentor',
    learnerTitle: 'Exam Aspirant',
    skills: ['Current Affairs', 'Quantitative Aptitude', 'Reasoning', 'Essay Writing', 'Mock Tests', 'Time Management'],
    roadmapSubjects: ['UPSC Foundation Plan', 'Banking Exam Sprint', 'Defence Services Prep'],
    outcomes: ['Civil Services Aspirant', 'Bank PO Aspirant', 'Defence Candidate'],
  },
  {
    stream: 'Education & Teaching',
    aliases: ['BEd', 'Teaching', 'Tutoring', 'EdTech'],
    cluster: 'Education & Teaching',
    mentorTitle: 'Teaching Career Mentor',
    learnerTitle: 'Teacher',
    skills: ['Lesson Planning', 'Pedagogy', 'Assessment', 'Classroom Management', 'Curriculum', 'EdTech Tools'],
    roadmapSubjects: ['Teaching Portfolio Builder', 'Online Tutoring Launch', 'BEd Career Readiness'],
    outcomes: ['School Teacher', 'Online Tutor', 'Curriculum Associate'],
  },
  {
    stream: 'Vocational & Skilled Trades',
    aliases: ['ITI', 'Electrician', 'Automotive', 'Culinary'],
    cluster: 'Vocational & Skilled Trades',
    mentorTitle: 'Skilled Trades Mentor',
    learnerTitle: 'Skilled Technician',
    skills: ['Safety Practices', 'Tool Handling', 'Diagnostics', 'Client Service', 'Blueprint Reading', 'Apprenticeship'],
    roadmapSubjects: ['ITI Job Readiness', 'Electrician Apprenticeship', 'Automotive Service Track'],
    outcomes: ['Technician', 'Apprentice', 'Service Associate'],
  },
];

const firstNames = [
  'Aarav', 'Meera', 'Rohan', 'Nisha', 'Dev', 'Sarah', 'Elena', 'Kabir', 'Ananya', 'Vihaan',
  'Ishaan', 'Priya', 'Arjun', 'Maya', 'Neel', 'Tara', 'Zoya', 'Kiran', 'Reyansh', 'Aisha',
  'Aditya', 'Mira', 'Yash', 'Riya', 'Samar', 'Ira', 'Vivaan', 'Noor', 'Om', 'Leela',
  'Tanvi', 'Harsh', 'Sneha', 'Rahul', 'Diya', 'Sahil', 'Pooja', 'Kunal', 'Fatima', 'Arnav',
];

const lastNames = [
  'Sharma', 'Iyer', 'Kapoor', 'Rao', 'Verma', 'Mehta', 'Nair', 'Singh', 'Patel', 'Das',
  'Menon', 'Joshi', 'Khan', 'Bose', 'Gupta', 'Reddy', 'Malhotra', 'Chawla', 'Sen', 'Kulkarni',
  'Saxena', 'Mishra', 'Bhat', 'Pillai', 'Jain', 'Roy', 'Agarwal', 'Dutta', 'Suri', 'Gill',
];

const learnerStages = Object.values(CareerStage);
const learningStyles = ['projects', 'live_sessions', 'reading', 'videos', 'case_practice', 'mock_tests', 'portfolio_reviews'];
const budgetRanges = ['free_only', 'low_cost', 'moderate', 'premium'];
const weeklyCommitments = ['0_3_hours', '4_7_hours', '8_15_hours', '16_plus_hours'];
const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam'];
const sessionPrices = [0, 0, 99, 199, 299, 499, 799, 999];

const pick = (items, index) => items[index % items.length];
const slugify = (value) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

function dateFromNow(days, hours = 0) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000);
}

function levelFor(isGuide, index) {
  return isGuide ? pick(['Advanced', 'Expert', 'Industry Mentor'], index) : pick(['Beginner', 'Foundation', 'Intermediate'], index);
}

async function resetAllCollections() {
  if (!shouldFullReset) {
    console.log('Skipping full reset because BULK_FULL_RESET=false.');
    return;
  }

  const env = process.env.NODE_ENV || 'development';
  if (env === 'production') {
    throw new Error('Refusing to reset database while NODE_ENV=production.');
  }

  const collections = await mongoose.connection.db.listCollections().toArray();
  for (const collection of collections) {
    await mongoose.connection.db.collection(collection.name).deleteMany({});
    console.log(`Wiped collection: ${collection.name}`);
  }
}

function roleCredentials(passwordHash) {
  return [
    {
      name: 'Uma Root Super Admin',
      email: 'super_admin@ascendpath.dev',
      username: 'super-admin-demo',
      role: Role.SUPER_ADMIN,
      roles: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
      capabilities: ['admin:*', 'platform:*', 'moderation:*'],
      profile: streamProfiles[0],
    },
    {
      name: 'Devika Admin',
      email: 'admin@ascendpath.dev',
      username: 'admin-demo',
      role: Role.ADMIN,
      roles: [Role.USER, Role.ADMIN],
      capabilities: ['admin:read', 'admin:write', 'users:manage'],
      profile: streamProfiles[6],
    },
    {
      name: 'Arjun Architect',
      email: 'architect@ascendpath.dev',
      username: 'architect-demo',
      role: Role.ARCHITECT,
      roles: [Role.USER, Role.ADMIN, Role.ARCHITECT, Role.GUIDE],
      capabilities: ['admin:*', 'roadmaps:create', 'taxonomy:manage'],
      profile: streamProfiles[1],
    },
    {
      name: 'Nisha Moderator',
      email: 'moderator@ascendpath.dev',
      username: 'moderator-demo',
      role: Role.MODERATOR,
      roles: [Role.USER, Role.MODERATOR],
      capabilities: ['moderation:read', 'moderation:write'],
      profile: streamProfiles[13],
    },
    {
      name: 'Kabir Sentinel',
      email: 'sentinel@ascendpath.dev',
      username: 'sentinel-demo',
      role: Role.SENTINEL,
      roles: [Role.USER, Role.SENTINEL, Role.MODERATOR],
      capabilities: ['reports:assign', 'moderation:write'],
      profile: streamProfiles[10],
    },
    {
      name: 'Meera Guide',
      email: 'guide@ascendpath.dev',
      username: 'guide-demo',
      role: Role.GUIDE,
      roles: [Role.USER, Role.GUIDE],
      capabilities: ['sessions:create', 'roadmaps:create', 'pings:answer'],
      profile: streamProfiles[5],
    },
    {
      name: 'Rohan Pathfinder',
      email: 'pathfinder@ascendpath.dev',
      username: 'pathfinder-demo',
      role: Role.PATHFINDER,
      roles: [Role.USER, Role.PATHFINDER],
      capabilities: ['roadmaps:enroll', 'posts:create', 'pings:create'],
      profile: streamProfiles[2],
    },
    {
      name: 'Aisha Explorer',
      email: 'explorer@ascendpath.dev',
      username: 'explorer-demo',
      role: Role.EXPLORER,
      roles: [Role.USER, Role.EXPLORER],
      capabilities: ['roadmaps:enroll', 'posts:create'],
      profile: streamProfiles[8],
    },
    {
      name: 'Leo Learner',
      email: 'user@ascendpath.dev',
      username: 'user-demo',
      role: Role.USER,
      roles: [Role.USER],
      capabilities: ['roadmaps:enroll'],
      profile: streamProfiles[11],
    },
  ].map((seed, index) => {
    const isGuide = seed.roles.includes(Role.GUIDE) || [Role.ADMIN, Role.SUPER_ADMIN, Role.ARCHITECT].includes(seed.role);
    return buildUser(seed, seed.profile, index, isGuide, passwordHash);
  });
}

function buildUser(seed, profile, index, isGuide, passwordHash) {
  const stage = pick(learnerStages, index);
  const experienceYears = isGuide ? 3 + (index % 18) : index % 3;
  const selectedLanguages = [pick(languages, index), pick(languages, index + 3)];
  const role = seed.role || (isGuide ? Role.GUIDE : pick([Role.USER, Role.EXPLORER, Role.PATHFINDER], index));
  const roles = seed.roles || (role === Role.PATHFINDER ? [Role.USER, Role.PATHFINDER] : [role]);

  return {
    name: seed.name,
    email: seed.email,
    username: seed.username,
    passwordHash,
    role,
    roles,
    capabilities: seed.capabilities || (isGuide ? ['sessions:create', 'roadmaps:create', 'pings:answer'] : ['roadmaps:enroll', 'posts:create']),
    mentorProfileStatus: isGuide ? pick(['approved', 'approved', 'under_review', 'pending'], index) : 'none',
    educationLevel: isGuide ? EducationLevel.PROFESSIONAL : pick(Object.values(EducationLevel), index),
    careerStage: isGuide ? CareerStage.WORKING_PROFESSIONAL : stage,
    weeklyCommitment: pick(weeklyCommitments, index),
    budgetRange: pick(budgetRanges, index),
    preferredLanguages: selectedLanguages,
    bio: isGuide
      ? `${profile.mentorTitle} for ${profile.stream}. Helps learners build practical proof, prepare interviews or exams, and choose realistic next steps. ${seedTag}`
      : `${profile.stream} learner at ${stage.replace(/_/g, ' ')} stage. Needs structured roadmaps, mentor feedback, forum advice, and session support. ${seedTag}`,
    domains: [profile.stream, profile.cluster, ...profile.aliases.slice(0, 2)],
    skills: profile.skills.map((skill, skillIndex) => ({
      name: skill,
      level: levelFor(isGuide, index + skillIndex),
      years: Math.max(0, experienceYears - (skillIndex % 3)),
    })),
    interests: [profile.stream, profile.outcomes[index % profile.outcomes.length], 'mentorship', pick(['portfolio', 'exam prep', 'internships', 'career switch'], index)],
    avatar: `https://i.pravatar.cc/160?u=${seedTag}-${slugify(seed.email)}`,
    isVerified: index % 8 !== 0,
    isBanned: index % 173 === 0,
    isSuspended: index % 67 === 0,
    suspensionReason: index % 67 === 0 ? `Seeded temporary suspension for moderation testing. ${seedTag}` : undefined,
    suspensionSource: index % 67 === 0 ? 'moderator_action' : undefined,
    suspendedUntil: index % 67 === 0 ? dateFromNow(7 + (index % 5)) : undefined,
    falseReportStrikes: index % 4,
    moderatorNotes: index % 29 === 0 ? `Seeded note for moderation panels. Stream: ${profile.stream}.` : undefined,
    pingAvailable: isGuide && index % 5 !== 0,
    socialLinks: {
      github: `https://github.com/${seed.username}`,
      linkedin: `https://linkedin.com/in/${seed.username}`,
      website: `https://${seed.username}.example.com`,
    },
    availability: isGuide ? {
      text: pick(['Weekday evenings', 'Weekend mornings', 'Async plus one live slot', 'Flexible office hours'], index),
      schedule: [
        { day: pick(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], index), slots: ['7:00 PM - 8:00 PM', '8:00 PM - 9:00 PM'] },
        { day: pick(['Saturday', 'Sunday'], index), slots: ['10:00 AM - 11:00 AM', '2:00 PM - 3:00 PM'] },
      ],
    } : undefined,
    totalSessions: isGuide ? 4 + (index % 70) : index % 5,
    averageRating: isGuide ? Number((3.8 + (index % 12) / 10).toFixed(2)) : 0,
    totalReviews: isGuide ? 2 + (index % 45) : 0,
    respectPoints: isGuide ? 250 + index * 12 : 5 + index * 2,
    fameScore: isGuide ? 35 + (index % 65) : index % 30,
    guideRank: isGuide ? pick(Object.values(GuideRank), index) : GuideRank.RISING,
    profileVisibility: index % 23 !== 0,
    showRoadmapActivity: index % 11 !== 0,
    anonymousRoadmapParticipation: index % 17 === 0,
    onboardingCompleted: index % 9 !== 0,
    headline: isGuide ? `${profile.mentorTitle} | ${profile.stream}` : `${profile.learnerTitle} aspirant`,
    specialization: profile.stream,
    portfolioLinks: isGuide ? [
      { label: `${profile.stream} playbook`, url: `https://example.com/${slugify(profile.stream)}/playbook` },
      { label: 'Mentor outcomes', url: `https://example.com/${seed.username}/outcomes` },
    ] : [],
    onboarding: {
      primaryGoal: pick(['land_first_job', 'get_internship', 'career_switch', 'crack_exam', 'study_abroad', 'start_business', 'upskill_current_role'], index),
      experienceLevel: isGuide ? 'advanced' : pick(['beginner', 'intermediate', 'foundation'], index),
      careerStage: stage,
      targetRole: profile.outcomes[index % profile.outcomes.length],
      interestedDomains: [profile.stream, profile.cluster],
      preferredLearningStyle: pick(learningStyles, index),
      mentorshipPreference: pick(['structured_weekly', 'async_review', 'one_time_clarity_call', 'workshops'], index),
      directionClarity: pick(['confused', 'somewhat_clear', 'clear', 'validating_options'], index),
      weeklyCommitment: pick(weeklyCommitments, index),
      weeklyCommitmentHours: 2 + (index % 24),
      budgetRange: pick(budgetRanges, index),
      preferredLanguages: selectedLanguages,
    },
    mentorProfile: isGuide ? {
      specializations: [profile.stream, ...profile.skills.slice(0, 3)],
      industries: [profile.cluster, pick(['EdTech', 'Consulting', 'Startups', 'Public Sector', 'Healthcare', 'Manufacturing'], index)],
      languages: selectedLanguages,
      experienceYears,
      educationBackground: pick(['B.Tech', 'M.Tech', 'BBA', 'MBA', 'MBBS', 'LLB', 'M.Des', 'B.Ed', 'Industry certified'], index),
      certifications: profile.skills.slice(0, 2).map((skill) => `${skill} practitioner`),
      examExpertise: profile.stream.includes('Civil Services') ? ['UPSC', 'Banking', 'Defence'] : [],
      menteeOutcomes: profile.outcomes,
      roadmapImpact: 20 + (index % 80),
      sessionQuality: Number((4.0 + (index % 10) / 10).toFixed(1)),
      completionRate: 60 + (index % 40),
    } : undefined,
  };
}

async function seedUsers(passwordHash) {
  const users = roleCredentials(passwordHash);
  const remaining = Math.max(0, counts.totalUsers - users.length);

  for (let i = 0; i < remaining; i += 1) {
    const globalIndex = i + users.length;
    const profile = pick(streamProfiles, i);
    const guideSlot = i % 4 === 0;
    const role = guideSlot ? Role.GUIDE : pick([Role.USER, Role.EXPLORER, Role.PATHFINDER], i);
    const first = pick(firstNames, i);
    const last = pick(lastNames, i * 3);
    const streamSlug = slugify(profile.stream);
    users.push(buildUser({
      name: `${first} ${last} (${profile.stream} ${guideSlot ? 'Mentor' : 'Learner'} ${i + 1})`,
      email: `${streamSlug}-${guideSlot ? 'mentor' : 'learner'}-${i + 1}@${seedTag}.ascendpath.dev`,
      username: `${streamSlug}-${guideSlot ? 'mentor' : 'learner'}-${i + 1}`,
      role,
      roles: role === Role.PATHFINDER ? [Role.USER, Role.PATHFINDER] : [role],
    }, profile, globalIndex, guideSlot, passwordHash));
  }

  return User.insertMany(users, { ordered: false });
}

async function seedRoadmaps(guides, students) {
  const roadmaps = [];
  const sections = [];
  const steps = [];
  const progress = [];

  for (let i = 0; i < counts.roadmaps; i += 1) {
    const profile = pick(streamProfiles, i);
    const roadmapId = new mongoose.Types.ObjectId();
    const guide = guides[i % guides.length];
    const subject = pick(profile.roadmapSubjects, i);
    const title = `${subject}: ${profile.stream} Track ${i + 1}`;
    const difficulty = pick(['beginner', 'intermediate', 'advanced'], i);

    roadmaps.push({
      _id: roadmapId,
      title,
      slug: `${slugify(title)}-${seedTag}`,
      description: `A mentor-backed ${profile.stream} path with projects, exam or interview checkpoints, portfolio proof, and realistic weekly milestones.`,
      thumbnail: `https://source.unsplash.com/900x600/?career,${encodeURIComponent(profile.stream)},learning`,
      domains: [profile.stream, ...profile.aliases],
      tags: [seedTag, profile.stream, profile.cluster, ...profile.skills.slice(0, 4)],
      targetStages: learnerStages,
      languages: [pick(languages, i), 'English'],
      budgetRange: pick(budgetRanges, i),
      pathType: pick(['career_path', 'skill_growth', 'exam_prep', 'freelancing', 'study_abroad', 'vocational'], i),
      difficulty,
      estimatedWeeks: 4 + (i % 24),
      createdBy: guide._id,
      enrollmentCount: 12 + (i * 9) % 500,
      averageRating: Number((3.8 + (i % 13) / 10).toFixed(1)),
      isPublished: i % 11 !== 0,
      prerequisites: [`Interest in ${profile.stream}`, 'Weekly practice time', 'Notebook or project tracker'],
      learningOutcomes: [
        `Build visible proof for ${profile.outcomes[0]}`,
        `Understand core ${profile.stream} terminology and workflows`,
        'Prepare for interviews, exams, or portfolio reviews',
      ],
      visibility: i % 19 === 0 ? 'unlisted' : 'public',
      moderationStatus: i % 37 === 0 ? 'hidden' : 'visible',
      targetRole: profile.outcomes[i % profile.outcomes.length],
      domain: profile.stream,
      isPublic: true,
      followerCount: 20 + i * 5,
    });

    for (let s = 0; s < 5; s += 1) {
      const sectionId = new mongoose.Types.ObjectId();
      sections.push({
        _id: sectionId,
        roadmapId,
        title: `${s + 1}. ${pick(['Orientation', 'Core Foundations', 'Applied Practice', 'Career Proof', 'Mock Review'], s)}`,
        description: `Focused ${profile.stream} learning block with mentor checkpoints and practical artifacts.`,
        order: s,
      });

      for (let t = 0; t < 6; t += 1) {
        steps.push({
          _id: new mongoose.Types.ObjectId(),
          roadmapId,
          sectionId,
          title: `${pick(profile.skills, t)} ${pick(['Primer', 'Workshop', 'Assignment', 'Project', 'Case Review', 'Mock Test'], t + s)}`,
          description: `Practice ${pick(profile.skills, t)} in a realistic ${profile.stream} context and document what changed.`,
          type: pick(['article', 'video', 'project', 'assignment', 'quiz', 'session', 'external resource'], t + s),
          resources: [
            { type: 'article', title: `${profile.stream} reference notes`, url: `https://example.com/${slugify(profile.stream)}/reference-${t}` },
            { type: 'checklist', title: `${profile.stream} milestone checklist`, url: `https://example.com/${slugify(profile.stream)}/checklist-${t}` },
          ],
          estimatedMinutes: 20 + ((i + s + t) % 8) * 15,
          difficulty: pick(['beginner', 'intermediate', 'advanced'], i + s + t),
          order: t,
          isOptional: t === 5,
          richNotes: `Compare at least two approaches before committing to your ${profile.stream} next step.`,
          mentorTip: `Keep the deliverable small, visible, and reviewable. ${seedTag}`,
        });
      }
    }
  }

  await CareerRoadmap.insertMany(roadmaps, { ordered: false });
  await RoadmapSection.insertMany(sections, { ordered: false });
  const createdSteps = await RoadmapStep.insertMany(steps, { ordered: false });

  roadmaps.forEach((roadmap, i) => {
    const roadmapSteps = createdSteps.filter((step) => step.roadmapId.equals(roadmap._id));
    for (let e = 0; e < Math.min(10, students.length); e += 1) {
      const completedCount = (e + i) % Math.max(1, roadmapSteps.length);
      const completedSteps = roadmapSteps.slice(0, completedCount).map((step) => step._id);
      progress.push({
        userId: students[(i + e) % students.length]._id,
        roadmapId: roadmap._id,
        completedSteps,
        progressPercentage: Math.min(100, Math.round((completedSteps.length / roadmapSteps.filter((step) => !step.isOptional).length) * 100)),
        startedAt: dateFromNow(-60 + e),
        lastActiveAt: dateFromNow(-(e % 12), e),
        completedAt: completedCount > 25 ? dateFromNow(-1) : undefined,
        streakCount: e % 20,
        notes: new Map([[roadmapSteps[0]._id.toString(), `First checkpoint note for ${roadmap.title}. ${seedTag}`]]),
        bookmarkedSteps: roadmapSteps.slice(-2).map((step) => step._id),
      });
    }
  });

  await UserProgress.insertMany(progress, { ordered: false });
  return { roadmaps, steps: createdSteps };
}

async function seedPostsAndReplies(users, guides, students) {
  const postPrompts = [
    'How do I choose between these career paths?',
    'Please review my learning plan for the next eight weeks',
    'What should I add to make this portfolio stronger?',
    'How do I prepare for my first internship interview?',
    'What are the mistakes beginners make in this stream?',
    'Which certifications or projects are actually worth it?',
    'How do I recover after falling behind in my roadmap?',
    'Can someone explain this concept with a practical example?',
  ];

  const posts = [];
  for (let i = 0; i < counts.posts; i += 1) {
    const profile = pick(streamProfiles, i);
    const author = users[i % users.length];
    posts.push({
      title: `${pick(postPrompts, i)} (${profile.stream})`,
      content: `I am working through ${profile.stream}. Current focus: ${pick(profile.skills, i)}. I need practical advice from mentors and peers for ${pick(profile.outcomes, i)}. ${seedTag} post ${i + 1}.`,
      authorId: author._id,
      category: pick(Object.values(PostCategory), i),
      tags: [seedTag, profile.stream, profile.cluster, pick(profile.skills, i)],
      upvotes: 1 + (i % 120),
      downvotes: i % 17 === 0 ? 1 + (i % 4) : 0,
      voters: students.slice(0, Math.min(10, students.length)).map((student, voterIndex) => ({
        userId: student._id,
        vote: voterIndex % 8 === 0 ? -1 : 1,
      })),
      viewCount: 25 + i * 4,
      isPinned: i % 80 === 0,
      isLocked: i % 113 === 0,
      moderationStatus: i % 151 === 0 ? 'hidden' : 'visible',
      isResolved: i % 3 === 0,
      isSolved: i % 3 === 0,
      resolvedAt: i % 3 === 0 ? dateFromNow(-(i % 45)) : undefined,
      resolvedBy: i % 3 === 0 ? guides[i % guides.length]._id : undefined,
    });
  }

  const createdPosts = await Post.insertMany(posts, { ordered: false });
  const replies = [];

  createdPosts.forEach((post, i) => {
    const profile = pick(streamProfiles, i);
    for (let r = 0; r < 2 + (i % 4); r += 1) {
      const guide = guides[(i + r) % guides.length];
      replies.push({
        postId: post._id,
        authorId: guide._id,
        content: `For ${profile.stream}, start with ${pick(profile.skills, r)} and one visible deliverable. Then ask for review against ${pick(profile.outcomes, r)} expectations. ${seedTag} reply ${r + 1}.`,
        upvotes: 1 + ((i + r) % 35),
      });
    }
  });

  const createdReplies = await Reply.insertMany(replies, { ordered: false });
  const updates = createdPosts
    .filter((post, i) => i % 3 === 0)
    .map((post) => {
      const accepted = createdReplies.find((reply) => reply.postId.equals(post._id));
      return accepted ? Post.updateOne({ _id: post._id }, { acceptedReplyId: accepted._id, solutionReplyId: accepted._id }) : null;
    })
    .filter(Boolean);

  await Promise.all(updates);
  return { posts: createdPosts, replies: createdReplies };
}

async function seedSessionsAndReviews(guides, students, roadmaps) {
  const sessions = [];

  for (let i = 0; i < counts.sessions; i += 1) {
    const profile = pick(streamProfiles, i);
    const guide = guides[i % guides.length];
    const student = students[(i * 3) % students.length];
    const publicSession = i % 3 !== 0;
    const completed = i % 5 === 0;
    const live = i % 41 === 0;
    const roadmap = roadmaps[i % roadmaps.length];
    const price = publicSession ? pick([0, 0, 99, 199], i) : pick(sessionPrices, i + 3);

    sessions.push({
      guideId: guide._id,
      clientId: publicSession ? undefined : student._id,
      sessionType: publicSession ? SessionType.PUBLIC_WORKSHOP : SessionType.PRIVATE_MENTORSHIP,
      title: `${profile.stream}: ${pick(profile.skills, i)} ${publicSession ? 'Workshop' : 'Mentorship'} ${i + 1}`,
      topic: pick(profile.skills, i),
      description: `A ${price === 0 ? 'free' : 'paid'} ${profile.stream} session with diagnostics, examples, and next-step planning.`,
      domains: [profile.stream, profile.cluster],
      languages: [pick(languages, i), 'English'],
      audienceStages: learnerStages.slice(i % 3, (i % 3) + 4),
      budgetRange: price === 0 ? 'free_only' : pick(budgetRanges, i),
      tags: [seedTag, profile.stream, price === 0 ? 'free' : 'paid'],
      difficulty: pick(['beginner', 'intermediate', 'advanced'], i),
      scheduledAt: completed ? dateFromNow(-(i % 90), i % 12) : dateFromNow((i % 60) + 1, i % 12),
      durationMinutes: pick([30, 45, 60, 75, 90, 120], i),
      price,
      status: completed ? SessionStatus.COMPLETED : live ? SessionStatus.LIVE : pick([SessionStatus.OPEN, SessionStatus.SCHEDULED, SessionStatus.REGISTRATION_OPEN], i),
      isPublic: publicSession,
      capacity: publicSession ? 15 + (i % 80) : undefined,
      attendeeCount: publicSession ? 2 + (i % 35) : 0,
      bannerImage: `https://source.unsplash.com/1200x500/?learning,${encodeURIComponent(profile.stream)}`,
      thumbnail: `https://source.unsplash.com/500x350/?career,${encodeURIComponent(profile.stream)}`,
      roadmapId: roadmap._id,
      registrationMode: pick(Object.values(RegistrationMode), i),
      sessionCategory: pick(Object.values(SessionCategory), i),
      resources: [
        { title: `${profile.stream} prep worksheet`, url: `https://example.com/session/${i}/worksheet`, type: 'worksheet' },
        { title: `${profile.stream} reference pack`, url: `https://example.com/session/${i}/refs`, type: 'article' },
      ],
      recordingUrl: completed ? `https://example.com/recordings/${seedTag}-${i}` : undefined,
      attendees: publicSession ? students.slice(0, Math.min(4 + (i % 12), students.length)).map((attendee, a) => ({
        userId: attendee._id,
        registeredAt: dateFromNow(-(a + 5)),
        attendedAt: completed || live ? dateFromNow(-1, a) : undefined,
      })) : [],
      waitlist: publicSession && i % 7 === 0 ? students.slice(20, Math.min(28, students.length)).map((waiter, w) => ({
        userId: waiter._id,
        joinedAt: dateFromNow(-(w + 1)),
      })) : [],
      meetingLink: `https://meet.jit.si/ascendpath-${seedTag}-${i}`,
      meetingProvider: pick(Object.values(MeetingProvider), i),
      meetingUrl: `https://meet.jit.si/ascendpath-${seedTag}-${i}`,
      meetingRoomId: `ascendpath-${seedTag}-${i}`,
      startedAt: completed || live ? dateFromNow(-1, i % 10) : undefined,
      endedAt: completed ? dateFromNow(-1, (i % 10) + 1) : undefined,
      mentorJoinedAt: completed || live ? dateFromNow(-1, i % 10) : undefined,
      menteeJoinedAt: !publicSession && (completed || live) ? dateFromNow(-1, (i % 10) + 1) : undefined,
      actualDurationMinutes: completed ? 35 + (i % 55) : undefined,
      attendanceStatus: completed ? AttendanceStatus.COMPLETED : live ? AttendanceStatus.ACTIVE : AttendanceStatus.SCHEDULED,
      sessionExecutionState: completed ? SessionExecutionState.REFLECTION_UNLOCKED : live ? SessionExecutionState.ACTIVE : SessionExecutionState.SCHEDULED,
      rating: completed ? 3 + (i % 3) : undefined,
      review: completed ? `Practical ${profile.stream} session with clear next steps. ${seedTag}` : undefined,
    });
  }

  const createdSessions = await Session.insertMany(sessions, { ordered: false });
  const completedSessions = createdSessions.filter((session) => session.status === SessionStatus.COMPLETED);
  const reviews = completedSessions.map((session, i) => ({
    reviewerId: session.clientId || students[i % students.length]._id,
    guideId: session.guideId,
    sessionId: session._id,
    rating: 3 + (i % 3),
    reviewText: `Specific, practical, and useful for my next ${session.topic} milestone. ${seedTag} review ${i + 1}.`,
    tags: [pick(['Helpful', 'Practical', 'Clear roadmap', 'Good examples', 'Needs structure'], i), seedTag],
    sentiment: pick(['positive', 'positive', 'neutral'], i),
    isVerified: i % 6 !== 0,
    moderationStatus: pick(['approved', 'approved', 'flagged'], i),
    flagReason: i % 9 === 0 ? `Seeded review flag. ${seedTag}` : undefined,
  }));

  const createdReviews = await Review.insertMany(reviews, { ordered: false });
  await Promise.all(createdReviews.map((review) =>
    Session.updateOne({ _id: review.sessionId }, { reviewId: review._id, rating: review.rating, review: review.reviewText })
  ));

  return { sessions: createdSessions, reviews: createdReviews };
}

async function seedMentorship(students, guides, roadmaps) {
  const conversations = [];
  const usedPairs = new Set();

  for (let i = 0; i < counts.conversations; i += 1) {
    const mentor = guides[i % guides.length];
    const mentee = students[(i * 5) % students.length];
    const pairKey = `${mentor._id}-${mentee._id}`;
    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    conversations.push({
      participants: [mentor._id, mentee._id],
      mentorId: mentor._id,
      menteeId: mentee._id,
      status: pick(Object.values(MentorshipConversationStatus), i),
      startedFrom: pick(Object.values(MentorshipStartedFrom), i),
      linkedRoadmapId: roadmaps[i % roadmaps.length]._id,
      lastMessageAt: dateFromNow(-(i % 20), i % 12),
      lastMessagePreview: 'I reviewed your current step and suggested a smaller next milestone.',
      unreadCounts: new Map([[mentor._id.toString(), i % 2], [mentee._id.toString(), (i + 1) % 3]]),
      participantStates: [
        { userId: mentor._id, lastReadAt: dateFromNow(-1) },
        { userId: mentee._id, lastReadAt: dateFromNow(-2), pinnedAdvice: 'Make one deliverable visible before adding more theory.' },
      ],
    });
  }

  const createdConversations = await MentorshipConversation.insertMany(conversations, { ordered: false });
  const messages = [];
  const escalations = [];

  createdConversations.forEach((conversation, i) => {
    const profile = pick(streamProfiles, i);
    const dialogue = [
      `I am confused about the best next step in ${profile.stream}.`,
      `Start with ${pick(profile.skills, i)} and one proof artifact.`,
      'Should I book a session or continue async for now?',
      'Try async for two days, then escalate if you are still blocked.',
      `Great, I will update my ${profile.stream} roadmap notes today.`,
    ];

    dialogue.forEach((content, m) => {
      messages.push({
        conversationId: conversation._id,
        senderId: m % 2 === 0 ? conversation.menteeId : conversation.mentorId,
        messageType: pick(Object.values(MentorshipMessageType), m),
        content: `${content} ${seedTag}`,
        attachments: m === 1 ? [{ label: 'Checklist', url: `https://example.com/${slugify(profile.stream)}/checklist`, type: 'link' }] : [],
        linkedRoadmapId: conversation.linkedRoadmapId,
        readBy: [{ userId: conversation.mentorId, readAt: dateFromNow(-1) }],
        createdAt: dateFromNow(-(i % 20), m),
      });
    });

    if (i % 4 === 0) {
      escalations.push({
        conversationId: conversation._id,
        mentorId: conversation.mentorId,
        menteeId: conversation.menteeId,
        requestedBy: conversation.menteeId,
        topic: `${profile.stream} blocker review`,
        objective: `Resolve a blocker around ${pick(profile.skills, i)} and decide the next roadmap milestone.`,
        roadmapArea: profile.stream,
        urgency: pick(['low', 'normal', 'high'], i),
        preferredSlots: ['Monday evening', 'Saturday morning'],
        expectedHelpType: pick(['1-on-1 review', 'Mock interview', 'Portfolio critique', 'Exam strategy'], i),
        status: pick(Object.values(SessionEscalationStatus), i),
        proposedSlots: ['Tuesday 7 PM', 'Sunday 10 AM'],
      });
    }
  });

  const createdMessages = await MentorshipMessage.insertMany(messages, { ordered: false });
  const createdEscalations = escalations.length ? await SessionEscalationRequest.insertMany(escalations, { ordered: false }) : [];
  return { conversations: createdConversations, messages: createdMessages, escalations: createdEscalations };
}

async function seedPings(students, guides, conversations) {
  const pings = [];
  for (let i = 0; i < counts.pings; i += 1) {
    const profile = pick(streamProfiles, i);
    const status = pick(Object.values(PingStatus), i);
    const answered = status === PingStatus.ANSWERED || status === PingStatus.CLOSED;
    pings.push({
      fromUserId: students[i % students.length]._id,
      toUserId: guides[(i * 2) % guides.length]._id,
      question: `What is one practical next step for ${profile.stream} if my focus is ${pick(profile.skills, i)}?`,
      context: `${seedTag}: learner is at ${pick(learnerStages, i)} stage and wants ${pick(profile.outcomes, i)} guidance.`,
      status,
      response: answered ? `Make one small artifact, ask for feedback, and map it to ${pick(profile.outcomes, i)} expectations. ${seedTag}` : undefined,
      responseRating: answered ? 1 + (i % 5) : undefined,
      conversationId: conversations.length ? conversations[i % conversations.length]._id : undefined,
      expiresAt: status === PingStatus.EXPIRED ? dateFromNow(-1) : dateFromNow(2 + (i % 7)),
    });
  }
  return PingRequest.insertMany(pings, { ordered: false });
}

async function seedNotifications(users, posts, sessions, roadmaps, conversations) {
  const notifications = [];
  const types = Object.values(NotificationType);
  const entities = [...posts, ...sessions, ...roadmaps, ...conversations];

  for (let i = 0; i < counts.notifications; i += 1) {
    const recipient = users[i % users.length];
    const actor = users[(i + 11) % users.length];
    const type = pick(types, i);
    const entity = entities[i % entities.length];
    notifications.push({
      recipientId: recipient._id,
      actorId: actor._id,
      type,
      entityId: entity._id,
      entityType: pick(['post', 'session', 'roadmap', 'mentorship', 'review', 'user'], i),
      title: `Seeded ${type.replace(/_/g, ' ')}`,
      message: `Broad demo notification for dashboards, dropdowns, and realtime testing. ${seedTag} #${i + 1}`,
      metadata: { seedTag, index: i, stream: pick(streamProfiles, i).stream },
      read: i % 4 === 0,
    });
  }

  return Notification.insertMany(notifications, { ordered: false });
}

async function run() {
  await mongoose.connect(mongoUri);
  console.log(`Connected to MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);
  console.log(`Seeding tag: ${seedTag}`);
  console.log(`Full reset: ${shouldFullReset ? 'yes' : 'no'}`);

  await resetAllCollections();

  const passwordHash = await bcrypt.hash(password, 10);
  const users = await seedUsers(passwordHash);
  const guides = users.filter((user) => user.roles.includes(Role.GUIDE) || user.role === Role.GUIDE || user.role === Role.ARCHITECT);
  const students = users.filter((user) => !guides.some((guide) => guide._id.equals(user._id)) && ![Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR, Role.SENTINEL].includes(user.role));

  const { roadmaps, steps } = await seedRoadmaps(guides, students);
  const { posts, replies } = await seedPostsAndReplies(users, guides, students);
  const { sessions, reviews } = await seedSessionsAndReviews(guides, students, roadmaps);
  const { conversations, messages, escalations } = await seedMentorship(students, guides, roadmaps);
  const pings = await seedPings(students, guides, conversations);
  const notifications = await seedNotifications(users, posts, sessions, roadmaps, conversations);

  const credentials = [
    ['Super Admin', 'super_admin@ascendpath.dev'],
    ['Admin', 'admin@ascendpath.dev'],
    ['Architect', 'architect@ascendpath.dev'],
    ['Moderator', 'moderator@ascendpath.dev'],
    ['Sentinel', 'sentinel@ascendpath.dev'],
    ['Guide', 'guide@ascendpath.dev'],
    ['Pathfinder', 'pathfinder@ascendpath.dev'],
    ['Explorer', 'explorer@ascendpath.dev'],
    ['User', 'user@ascendpath.dev'],
  ];

  console.log('\nFull-spectrum bulk seed complete.');
  console.log(`Users: ${users.length} (${guides.length} mentor-capable, ${students.length} learners)`);
  console.log(`Streams covered: ${streamProfiles.map((profile) => profile.stream).join(', ')}`);
  console.log(`Roadmaps: ${roadmaps.length}`);
  console.log(`Roadmap steps: ${steps.length}`);
  console.log(`Forum posts: ${posts.length}`);
  console.log(`Forum replies: ${replies.length}`);
  console.log(`Sessions/workshops: ${sessions.length}`);
  console.log(`Reviews: ${reviews.length}`);
  console.log(`Mentorship conversations: ${conversations.length}`);
  console.log(`Mentorship messages: ${messages.length}`);
  console.log(`Escalation requests: ${escalations.length}`);
  console.log(`Pings: ${pings.length}`);
  console.log(`Notifications: ${notifications.length}`);
  console.log(`Password for all seeded demo users: ${password}`);
  console.log('\nLogin credentials by role:');
  credentials.forEach(([label, email]) => console.log(`${label.padEnd(12)} ${email.padEnd(32)} ${password}`));

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed full-spectrum demo data:', error);
  await mongoose.disconnect();
  process.exit(1);
});
