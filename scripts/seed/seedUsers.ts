import bcrypt from 'bcrypt';
import { User, Role, EducationLevel, CareerStage, GuideRank } from '../../src/modules/users/user.model';
import { connectDb, SeededRandom } from './helper';

const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const techSkills = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Machine Learning', 'Data Analysis', 'Cybersecurity', 'Linux', 'SQL', 'Git', 'TailwindCSS', 'CSS Grid', 'HTML5', 'Next.js', 'AWS', 'Docker', 'Figma'];
const bios = [
  'Passionate about software architecture and building high-performance web systems.',
  'CS student eager to learn and transition into software development.',
  'Upskilling in cloud deployments and developer operations frameworks.',
  'Looking to master visual UI/UX layout practices and user research metrics.',
  'Transitioning from business consulting to practical data engineering systems.'
];

export const seedUsers = async () => {
  await connectDb();

  console.log('👤 Wiping users and seeding massive bulk accounts...');
  await User.deleteMany({});

  const rng = new SeededRandom(12345);
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('DemoPass123!', salt);

  const usersList: any[] = [];

  // 1. Seed Core Named Demo Accounts
  const namedUsers = [
    {
      name: 'Linus Torvalds (Super Admin)',
      email: 'super_admin@ascendpath.dev',
      username: 'linus_root',
      passwordHash,
      role: Role.SUPER_ADMIN,
      roles: [Role.USER, Role.ADMIN, Role.SUPER_ADMIN],
      isVerified: true,
      respectPoints: 3400,
      fameScore: 0,
      bio: 'Platform founder and infrastructure owner. Ultimate systems coordinator.',
      skills: [{ name: 'C', level: 'Advanced', years: 20 }, { name: 'Git', level: 'Advanced', years: 15 }],
      onboardingCompleted: true
    },
    {
      name: 'Ada Lovelace (System Architect)',
      email: 'admin@ascendpath.dev',
      username: 'ada_architect',
      passwordHash,
      role: Role.ARCHITECT,
      roles: [Role.USER, Role.ADMIN, Role.ARCHITECT],
      isVerified: true,
      respectPoints: 1200,
      fameScore: 0,
      bio: 'Core Platform Administrator. Oversees role allocations, operational audit histories, and career taxonomy trees.',
      skills: [],
      onboardingCompleted: true
    },
    {
      name: 'Marcus Aurelius (Moderator Sentinel)',
      email: 'moderator@ascendpath.dev',
      username: 'marcus_mod',
      passwordHash,
      role: Role.MODERATOR,
      roles: [Role.USER, Role.MODERATOR],
      isVerified: true,
      respectPoints: 220,
      fameScore: 0,
      bio: 'Community moderation lead. Dedicated to keeping AscendPath constructive, positive, and safe.',
      skills: [],
      onboardingCompleted: true
    },
    {
      name: 'Elena Rostova (Frontend Master)',
      email: 'frontend_mentor@ascendpath.dev',
      username: 'elena_dev',
      passwordHash,
      role: Role.GUIDE,
      roles: [Role.GUIDE],
      isVerified: true,
      respectPoints: 480,
      fameScore: 88,
      guideRank: GuideRank.ESTABLISHED,
      educationLevel: EducationLevel.PROFESSIONAL,
      careerStage: CareerStage.WORKING_PROFESSIONAL,
      bio: 'Senior UI Architect at Vercel. 8+ years building high-performance web applications. React, Next.js, and CSS layout specialist.',
      skills: [
        { name: 'React', level: 'Advanced', years: 6 },
        { name: 'TypeScript', level: 'Advanced', years: 5 },
        { name: 'Next.js', level: 'Advanced', years: 4 }
      ],
      availability: {
        text: 'Available Tuesdays and Thursdays for calendar bookings',
        schedule: [
          { day: 'Tuesday', slots: ['14:00', '15:00', '16:00'] },
          { day: 'Thursday', slots: ['10:00', '11:00', '14:00'] }
        ]
      },
      totalSessions: 24,
      averageRating: 4.9,
      totalReviews: 12,
      mentorProfile: {
        specializations: ['Frontend Architecture', 'Design Systems', 'Performance Optimization'],
        industries: ['SaaS', 'E-commerce', 'Developer Tools'],
        languages: ['English', 'Russian'],
        experienceYears: 8,
        educationBackground: 'B.S. in Computer Science',
        certifications: ['AWS Certified Developer']
      },
      onboardingCompleted: true
    },
    {
      name: 'Dr. Aarav Mehta (AI Guru)',
      email: 'ai_mentor@ascendpath.dev',
      username: 'aarav_ai',
      passwordHash,
      role: Role.GUIDE,
      roles: [Role.GUIDE],
      isVerified: true,
      respectPoints: 950,
      fameScore: 97,
      guideRank: GuideRank.EXPERT,
      educationLevel: EducationLevel.PROFESSIONAL,
      careerStage: CareerStage.WORKING_PROFESSIONAL,
      bio: 'Ex-Google Brain Scientist. Researcher in Large Language Models, cognitive modeling, and computer vision systems.',
      skills: [
        { name: 'Python', level: 'Advanced', years: 12 },
        { name: 'TensorFlow', level: 'Advanced', years: 8 },
        { name: 'PyTorch', level: 'Advanced', years: 7 }
      ],
      availability: {
        text: 'Weekend slots open',
        schedule: [
          { day: 'Saturday', slots: ['09:00', '10:00', '11:00'] },
          { day: 'Sunday', slots: ['14:00', '15:00'] }
        ]
      },
      totalSessions: 68,
      averageRating: 5.0,
      totalReviews: 45,
      mentorProfile: {
        specializations: ['Machine Learning Systems', 'Neural Language Processing', 'AI Research'],
        industries: ['Healthcare AI', 'Research Labs'],
        languages: ['English', 'Hindi'],
        experienceYears: 15,
        educationBackground: 'Ph.D. in Computer Science (Stanford)',
        certifications: ['Google Professional Data Engineer']
      },
      onboardingCompleted: true
    },
    {
      name: 'Sarah Connor (Security Shield)',
      email: 'security_mentor@ascendpath.dev',
      username: 'sarah_shield',
      passwordHash,
      role: Role.GUIDE,
      roles: [Role.GUIDE],
      isVerified: true,
      respectPoints: 120,
      fameScore: 45,
      guideRank: GuideRank.RISING,
      educationLevel: EducationLevel.PROFESSIONAL,
      careerStage: CareerStage.WORKING_PROFESSIONAL,
      bio: 'Cybersecurity Sentinel and Whitehat Penetration Tester. Helping learners discover network defense.',
      skills: [
        { name: 'Penetration Testing', level: 'Advanced', years: 4 },
        { name: 'Network Security', level: 'Advanced', years: 5 }
      ],
      availability: {
        text: 'Open for session bookings on Wednesday mornings',
        schedule: [
          { day: 'Wednesday', slots: ['09:00', '10:00', '11:00'] }
        ]
      },
      totalSessions: 6,
      averageRating: 4.8,
      totalReviews: 3,
      mentorProfile: {
        specializations: ['Offensive Hacking', 'Zero-Trust Architectures'],
        industries: ['Defense', 'Fintech'],
        languages: ['English'],
        experienceYears: 5,
        educationBackground: 'B.S. in Cybersecurity Operations',
        certifications: ['OSCP']
      },
      onboardingCompleted: true
    },
    {
      name: 'Leo Stark (Struggling Learner)',
      email: 'struggling_learner@ascendpath.dev',
      username: 'leo_stark',
      passwordHash,
      role: Role.USER,
      roles: [Role.USER],
      isVerified: true,
      respectPoints: 10,
      fameScore: 0,
      educationLevel: EducationLevel.COLLEGE,
      careerStage: CareerStage.CAREER_SWITCHER,
      bio: 'Attempting to transition from retail sales to Backend Web Development. Struggling with async database connections.',
      skills: [{ name: 'HTML/CSS', level: 'Intermediate', years: 1 }],
      onboardingCompleted: true,
      onboarding: {
        primaryGoal: 'Transition into Junior Node.js Developer roles',
        experienceLevel: 'Beginner',
        careerStage: CareerStage.CAREER_SWITCHER,
        targetRole: 'Backend Engineer',
        interestedDomains: ['Backend Web Development'],
        weeklyCommitment: '4_7_hours',
        budgetRange: 'low_cost',
        preferredLanguages: ['English']
      }
    },
    {
      name: 'Aisha Rahman (Active Learner)',
      email: 'active_learner@ascendpath.dev',
      username: 'aisha_dev',
      passwordHash,
      role: Role.PATHFINDER,
      roles: [Role.USER, Role.PATHFINDER],
      isVerified: true,
      respectPoints: 150,
      fameScore: 0,
      educationLevel: EducationLevel.COLLEGE,
      careerStage: CareerStage.COLLEGE_STUDENT,
      bio: 'Computer Science sophomore. Highly engaged in building software projects and practicing clean architectures.',
      skills: [{ name: 'JavaScript', level: 'Intermediate', years: 2 }],
      onboardingCompleted: true,
      onboarding: {
        primaryGoal: 'Land a Summer Internship',
        experienceLevel: 'Intermediate',
        careerStage: CareerStage.COLLEGE_STUDENT,
        targetRole: 'Fullstack Engineer',
        interestedDomains: ['Web Development'],
        weeklyCommitment: '16_plus_hours',
        budgetRange: 'moderate',
        preferredLanguages: ['English', 'Hindi']
      }
    },
    {
      name: 'Timmy Green (Confused Beginner)',
      email: 'confused_beginner@ascendpath.dev',
      username: 'timmy_g',
      passwordHash,
      role: Role.USER,
      roles: [Role.USER],
      isVerified: true,
      respectPoints: 2,
      fameScore: 0,
      educationLevel: EducationLevel.SCHOOL,
      careerStage: CareerStage.SCHOOL_STUDENT,
      bio: 'High school sophomore curious about coding, but lost on what tech path matches my interests.',
      skills: [],
      onboardingCompleted: true,
      onboarding: {
        primaryGoal: 'Discover what tech path matches my interests',
        experienceLevel: 'Beginner',
        careerStage: CareerStage.SCHOOL_STUDENT,
        targetRole: 'Explorer',
        interestedDomains: [],
        weeklyCommitment: '0_3_hours',
        budgetRange: 'free_only',
        preferredLanguages: ['English']
      }
    }
  ];

  usersList.push(...namedUsers);

  // 2. Generate 10 Bulk Mentors (Guides)
  for (let i = 1; i <= 10; i++) {
    const fName = rng.pick(firstNames);
    const lName = rng.pick(lastNames);
    const name = `${fName} ${lName} (Mentor #${i})`;
    const email = `guide_${i}@ascendpath.dev`;
    const username = `guide_username_${i}`;

    const guideSkills = rng.pickMultiple(techSkills, 4).map((s) => ({ name: s, level: 'Advanced', years: rng.nextInt(3, 10) }));

    usersList.push({
      name,
      email,
      username,
      passwordHash,
      role: Role.GUIDE,
      roles: [Role.GUIDE],
      isVerified: true,
      respectPoints: rng.nextInt(50, 400),
      fameScore: rng.nextInt(30, 85),
      guideRank: rng.pick(Object.values(GuideRank)),
      educationLevel: EducationLevel.PROFESSIONAL,
      careerStage: CareerStage.WORKING_PROFESSIONAL,
      bio: rng.pick(bios),
      skills: guideSkills,
      availability: {
        text: 'Standard booking schedule configured',
        schedule: [
          { day: rng.pick(['Monday', 'Tuesday', 'Wednesday']), slots: ['10:00', '11:00', '15:00'] },
          { day: rng.pick(['Thursday', 'Friday']), slots: ['14:00', '16:00'] }
        ]
      },
      totalSessions: rng.nextInt(2, 20),
      averageRating: parseFloat((4 + rng.next()).toFixed(1)),
      totalReviews: rng.nextInt(1, 10),
      mentorProfile: {
        specializations: [guideSkills[0].name, guideSkills[1].name],
        industries: [rng.pick(['SaaS', 'Cloud', 'Cybersecurity']), rng.pick(['Web', 'AI', 'EdTech'])],
        languages: ['English', rng.pick(['Spanish', 'French', 'Hindi'])],
        experienceYears: rng.nextInt(4, 12),
        educationBackground: rng.pick(['B.S. Computer Science', 'M.S. Software Engineering']),
        certifications: [rng.pick(['AWS Cloud Practitioner', 'Professional Developer'])]
      },
      onboardingCompleted: true
    });
  }

  // 3. Generate 40 Bulk Learners
  for (let i = 1; i <= 40; i++) {
    const fName = rng.pick(firstNames);
    const lName = rng.pick(lastNames);
    const name = `${fName} ${lName} (Learner #${i})`;
    const email = `learner_${i}@ascendpath.dev`;
    const username = `learner_username_${i}`;

    const learnerSkills = rng.pickMultiple(techSkills, 2).map((s) => ({ name: s, level: 'Beginner', years: rng.nextInt(0, 2) }));
    const stage = rng.pick(Object.values(CareerStage));

    usersList.push({
      name,
      email,
      username,
      passwordHash,
      role: Role.USER,
      roles: [Role.USER],
      isVerified: true,
      respectPoints: rng.nextInt(0, 30),
      fameScore: 0,
      educationLevel: rng.pick(Object.values(EducationLevel)),
      careerStage: stage,
      bio: rng.pick(bios),
      skills: learnerSkills,
      onboardingCompleted: true,
      onboarding: {
        primaryGoal: 'Learn and advance engineering careers.',
        experienceLevel: rng.pick(['Beginner', 'Intermediate']),
        careerStage: stage,
        targetRole: rng.pick(['Frontend Developer', 'Data Analyst', 'Security Analyst']),
        interestedDomains: [],
        weeklyCommitment: rng.pick(['0_3_hours', '4_7_hours', '8_15_hours', '16_plus_hours']),
        budgetRange: rng.pick(['free_only', 'low_cost', 'moderate', 'premium']),
        preferredLanguages: ['English']
      }
    });
  }

  const created = await User.insertMany(usersList);
  console.log(`✅ Seeded ${created.length} users into the database (named demo + 50 bulk users).`);
  return created;
};

if (require.main === module) {
  seedUsers()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
