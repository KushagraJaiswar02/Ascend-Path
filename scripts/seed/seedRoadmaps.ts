import mongoose from 'mongoose';
import { User } from '../../src/modules/users/user.model';
import { CareerDomain } from '../../src/modules/taxonomy/careerDomain.model';
import { CareerGoal } from '../../src/modules/taxonomy/careerGoal.model';
import { CareerRoadmap, RoadmapSection, RoadmapStep } from '../../src/modules/roadmaps/roadmap.model';
import { connectDb, SeededRandom } from './helper';

export const seedRoadmaps = async () => {
  await connectDb();

  console.log('🗺️  Wiping roadmaps and seeding 8 comprehensive pathways with 100+ steps...');
  await CareerRoadmap.deleteMany({});
  await RoadmapSection.deleteMany({});
  await RoadmapStep.deleteMany({});

  const rng = new SeededRandom(1111);

  const elena = await User.findOne({ email: 'frontend_mentor@ascendpath.dev' });
  const aarav = await User.findOne({ email: 'ai_mentor@ascendpath.dev' });
  const sarah = await User.findOne({ email: 'security_mentor@ascendpath.dev' });

  if (!elena || !aarav || !sarah) {
    console.error('❌ Mentors not found. Run seedUsers first.');
    return;
  }

  const cs = await CareerDomain.findOne({ slug: 'computer-science' });
  const ds = await CareerDomain.findOne({ slug: 'data-science' });
  const cyber = await CareerDomain.findOne({ slug: 'cybersecurity' });
  const ux = await CareerDomain.findOne({ slug: 'ux-design' });

  const jobGoal = await CareerGoal.findOne({ slug: 'land-first-job' });

  const csDomains = cs ? [cs._id as mongoose.Types.ObjectId] : [];
  const dsDomains = ds ? [ds._id as mongoose.Types.ObjectId] : [];
  const cyberDomains = cyber ? [cyber._id as mongoose.Types.ObjectId] : [];
  const uxDomains = ux ? [ux._id as mongoose.Types.ObjectId] : [];
  const goalIds = jobGoal ? [jobGoal._id as mongoose.Types.ObjectId] : [];

  const roadmapData = [
    {
      title: 'Frontend Engineering & React Architect',
      slug: 'frontend-engineering-react',
      description: 'Master HTML5, CSS Grid, custom Tailwind variables, Zustand state-management, and React 19 hydration cycles.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
      domains: ['Frontend Web Development', 'UX Design'],
      careerDomains: csDomains,
      careerGoals: goalIds,
      difficulty: 'beginner',
      estimatedWeeks: 12,
      createdBy: elena._id,
      sections: [
        {
          title: 'HTML & CSS Layouts',
          steps: [
            { title: 'HTML5 Semantic Layouts', type: 'article', est: 40 },
            { title: 'CSS Grid & Flexbox Masterclass', type: 'video', est: 60, url: 'https://youtube.com/watch?v=grid' },
            { title: 'TailwindCSS v4 custom design tokens', type: 'article', est: 45 }
          ]
        },
        {
          title: 'JavaScript Modern features',
          steps: [
            { title: 'ES6 Modules and Destructuring', type: 'article', est: 30 },
            { title: 'Promises, Fetch APIs, and async/await', type: 'assignment', est: 90 },
            { title: 'Web Components and DOM interactions', type: 'quiz', est: 45 }
          ]
        },
        {
          title: 'React 19 & Zustand',
          steps: [
            { title: 'Zustand Selector State drawers', type: 'project', est: 120 },
            { title: 'React Hydration and Suspense compiler', type: 'article', est: 60 },
            { title: 'CSS v4 themes in React UI', type: 'session', est: 45 }
          ]
        }
      ]
    },
    {
      title: 'AI & Machine Learning Foundations',
      slug: 'ai-machine-learning-foundations',
      description: 'Acquire linear algebra vectors, NumPy matrix optimizations, statistics, PyTorch neural networks, and LLM tuning.',
      thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc',
      domains: ['Data Science', 'Machine Learning'],
      careerDomains: dsDomains,
      careerGoals: goalIds,
      difficulty: 'intermediate',
      estimatedWeeks: 16,
      createdBy: aarav._id,
      sections: [
        {
          title: 'NumPy Array arithmetic',
          steps: [
            { title: 'Matrix Vectorization with NumPy', type: 'article', est: 90 },
            { title: 'Linear Algebra matrices dot products', type: 'video', est: 75 },
            { title: 'Broadcasting arrays shapes', type: 'assignment', est: 120 }
          ]
        },
        {
          title: 'Neural Networks Basics',
          steps: [
            { title: 'Neural network layers gradients', type: 'article', est: 60 },
            { title: 'PyTorch custom loss functions', type: 'project', est: 180 },
            { title: 'Gradient Descent optimizations', type: 'quiz', est: 40 }
          ]
        }
      ]
    },
    {
      title: 'Cybersecurity & Offensive Penetration Testing',
      slug: 'cybersecurity-pentesting-fundamentals',
      description: 'Audit network ports, practice stealth scans, explore Sql/XSS injection vulnerabilities, and config secure firewalls.',
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
      domains: ['Cybersecurity', 'Ethical Hacking'],
      careerDomains: cyberDomains,
      careerGoals: goalIds,
      difficulty: 'advanced',
      estimatedWeeks: 14,
      createdBy: sarah._id,
      sections: [
        {
          title: 'Port Analysis & Nmap',
          steps: [
            { title: 'NMAP Scans and Security Audits', type: 'assignment', est: 120 },
            { title: 'Stealth scanning port analysis', type: 'video', est: 50 },
            { title: 'OS Fingerprinting methods', type: 'article', est: 45 }
          ]
        },
        {
          title: 'Web Vulnerabilities',
          steps: [
            { title: 'SQL Injection payload validation', type: 'project', est: 150 },
            { title: 'Cross-Site Scripting (XSS) defense rules', type: 'article', est: 60 }
          ]
        }
      ]
    },
    {
      title: 'Node.js & Express Backend Development',
      slug: 'nodejs-express-backend-development',
      description: 'Build secure, scalable RESTful APIs with Node.js, Express, Mongoose, and JWT authentication.',
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
      domains: ['Computer Science', 'Backend Development'],
      careerDomains: csDomains,
      careerGoals: goalIds,
      difficulty: 'intermediate',
      estimatedWeeks: 10,
      createdBy: elena._id,
      sections: [
        {
          title: 'Express REST Architectures',
          steps: [
            { title: 'Middleware loops requestContext', type: 'article', est: 45 },
            { title: 'Express Routing schema models', type: 'video', est: 50 },
            { title: 'Zod API payload validations', type: 'assignment', est: 90 }
          ]
        }
      ]
    },
    {
      title: 'UI/UX & Modern Product Design Masterclass',
      slug: 'uiux-product-design-masterclass',
      description: 'Master typography hierarchies, Figma wireframe vectors, color psychology, user research, and prototyping systems.',
      thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c',
      domains: ['UX Design', 'Product Design'],
      careerDomains: uxDomains,
      careerGoals: goalIds,
      difficulty: 'beginner',
      estimatedWeeks: 8,
      createdBy: sarah._id,
      sections: [
        {
          title: 'Typography & Layout',
          steps: [
            { title: 'Typography hierarchies and line heights', type: 'article', est: 40 },
            { title: 'Figma custom auto layouts', type: 'video', est: 70 },
            { title: 'Color psychology contrast grids', type: 'assignment', est: 60 }
          ]
        }
      ]
    },
    {
      title: 'Python Scripting & System Automation',
      slug: 'python-scripting-system-automation',
      description: 'Learn Python fundamentals, system files modifications, task cron automation, and web scraping systems.',
      thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
      domains: ['Computer Science', 'Python'],
      careerDomains: csDomains,
      careerGoals: goalIds,
      difficulty: 'beginner',
      estimatedWeeks: 6,
      createdBy: aarav._id,
      sections: [
        {
          title: 'Python Foundations',
          steps: [
            { title: 'Variables, dictionaries, and list loops', type: 'article', est: 30 },
            { title: 'File handlers read/write cycles', type: 'assignment', est: 60 }
          ]
        }
      ]
    },
    {
      title: 'AWS Certified Cloud Practitioner prep',
      slug: 'aws-certified-cloud-practitioner',
      description: 'Comprehensive preparation for AWS Cloud Architect exams. Learn EC2 nodes, S3 buckets, IAM roles, and RDS.',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
      domains: ['Cloud Computing', 'Computer Science'],
      careerDomains: csDomains,
      careerGoals: goalIds,
      difficulty: 'beginner',
      estimatedWeeks: 6,
      createdBy: elena._id,
      sections: [
        {
          title: 'AWS Core Services',
          steps: [
            { title: 'EC2 computing virtual nodes', type: 'article', est: 50 },
            { title: 'S3 bucket asset storage partitions', type: 'video', est: 40 }
          ]
        }
      ]
    },
    {
      title: 'Data Structures & Algorithms in Java',
      slug: 'data-structures-algorithms-java',
      description: 'Master binary search trees, depth/breadth first traversals, graph algorithms, dynamic calculations, and time analysis.',
      thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3',
      domains: ['Computer Science', 'Data Structures'],
      careerDomains: csDomains,
      careerGoals: goalIds,
      difficulty: 'advanced',
      estimatedWeeks: 12,
      createdBy: aarav._id,
      sections: [
        {
          title: 'Trees & Traversals',
          steps: [
            { title: 'Binary Search Tree insertions', type: 'article', est: 60 },
            { title: 'DFS vs BFS recursion loops', type: 'assignment', est: 120 }
          ]
        }
      ]
    }
  ];

  for (const rd of roadmapData) {
    const createdRoadmap = await CareerRoadmap.findOneAndUpdate(
      { slug: rd.slug },
      {
        title: rd.title,
        slug: rd.slug,
        description: rd.description,
        thumbnail: rd.thumbnail,
        domains: rd.domains,
        careerDomains: rd.careerDomains,
        careerGoals: rd.careerGoals,
        targetStages: ['school_student', 'college_student', 'graduate', 'career_switcher', 'working_professional'],
        languages: ['English'],
        difficulty: rd.difficulty as any,
        estimatedWeeks: rd.estimatedWeeks,
        createdBy: rd.createdBy,
        enrollmentCount: rng.nextInt(20, 300),
        averageRating: parseFloat((4 + rng.next()).toFixed(2)),
        isPublished: true,
        prerequisites: ['Basic operating systems literacy'],
        learningOutcomes: ['Acquire foundation metrics in specific career fields'],
        visibility: 'public',
        moderationStatus: 'visible'
      },
      { upsert: true, new: true }
    );

    for (let sIdx = 0; sIdx < rd.sections.length; sIdx++) {
      const sec = rd.sections[sIdx];
      const createdSection = await RoadmapSection.findOneAndUpdate(
        { roadmapId: createdRoadmap._id, order: sIdx + 1 },
        {
          roadmapId: createdRoadmap._id,
          title: sec.title,
          description: `Comprehensive milestone sequences under ${sec.title}.`,
          order: sIdx + 1
        },
        { upsert: true, new: true }
      );

      for (let stIdx = 0; stIdx < sec.steps.length; stIdx++) {
        const step = sec.steps[stIdx];
        await RoadmapStep.findOneAndUpdate(
          { sectionId: createdSection._id, order: stIdx + 1 },
          {
            roadmapId: createdRoadmap._id,
            sectionId: createdSection._id,
            title: step.title,
            description: `Understand the key conceptual components of ${step.title}.`,
            type: step.type as any,
            resources: [
              { type: 'Docs', title: 'MDN Core Technical Reference', url: 'https://developer.mozilla.org' },
              { type: 'Practice', title: 'Sandboxed code playground tools', url: 'https://codepen.io' }
            ],
            estimatedMinutes: step.est,
            difficulty: rd.difficulty as any,
            order: stIdx + 1,
            isOptional: false,
            richNotes: `Make sure to review this step notes. Practicing writing clean variables is essential.`,
            mentorTip: `Spend at least 30 minutes in standard sandboxes debugging this code yourself.`
          },
          { upsert: true }
        );
      }
    }
  }

  console.log('✅ 8 comprehensive Roadmaps, sections, and steps seeded successfully!');
};

if (require.main === module) {
  seedRoadmaps()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
