import mongoose from 'mongoose';
import { User, Role } from '../../src/modules/users/user.model';
import { CareerDomain } from '../../src/modules/taxonomy/careerDomain.model';
import { CareerGoal } from '../../src/modules/taxonomy/careerGoal.model';
import { CareerRoadmap } from '../../src/modules/roadmaps/roadmap.model';
import { Opportunity } from '../../src/modules/opportunities/opportunity.model';
import { connectDb, SeededRandom } from './helper';

export const seedOpportunities = async () => {
  await connectDb();

  console.log('💼 Wiping and seeding 30+ comprehensive Opportunity entries...');
  await Opportunity.deleteMany({});

  const rng = new SeededRandom(9999);

  const guides = await User.find({ role: Role.GUIDE });
  const cs = await CareerDomain.findOne({ slug: 'computer-science' });
  const ds = await CareerDomain.findOne({ slug: 'data-science' });
  const cyber = await CareerDomain.findOne({ slug: 'cybersecurity' });
  const jobGoal = await CareerGoal.findOne({ slug: 'land-first-job' });

  const csDomains = cs ? [cs._id as mongoose.Types.ObjectId] : [];
  const goalIds = jobGoal ? [jobGoal._id as mongoose.Types.ObjectId] : [];

  const feRoadmap = await CareerRoadmap.findOne({ slug: 'frontend-engineering-react' });
  const aiRoadmap = await CareerRoadmap.findOne({ slug: 'ai-machine-learning-foundations' });

  const companies = ['Vercel', 'OpenAI', 'Crowdstrike', 'Figma', 'Stripe', 'Google', 'Amazon', 'Meta', 'Microsoft', 'Shopify', 'Gitlab', 'Hashicorp', 'Cloudflare'];
  const titles = [
    'Junior Web Developer Intern',
    'AI Research Associate',
    'Infrastructure Security Analyst',
    'Product Layout Designer',
    'Fullstack Node.js Engineer',
    'Data Science Fellow',
    'Developer Relations Coordinator',
    'MERN Stack coding Apprentice',
    'Cloud Systems Engineer',
    'Automation scripting Architect'
  ];

  const types = ['internship', 'job', 'freelance', 'scholarship', 'fellowship', 'bootcamp'];

  // Seed named ones first
  const elena = await User.findOne({ email: 'frontend_mentor@ascendpath.dev' });
  if (elena) {
    await Opportunity.create({
      title: 'Frontend Developer Intern',
      slug: 'vercel-frontend-developer-intern',
      opportunityType: 'internship',
      organizationName: 'Vercel',
      organizationLogo: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec',
      domains: ['Frontend Web Development'],
      careerDomains: csDomains,
      careerGoals: goalIds,
      requiredSkills: ['React', 'TypeScript', 'CSS Architecture'],
      preferredSkills: ['Next.js', 'TailwindCSS v4'],
      difficulty: 'beginner',
      eligibilityCriteria: 'Enrolled in CS degree or equivalent coding portfolio.',
      location: 'Remote, US',
      remoteStatus: 'remote',
      stipend: '$4000 per month',
      applicationDeadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
      applicationLink: 'https://vercel.com',
      readinessSignals: ['Completed React sections', 'Zustand selectors completed'],
      recommendedRoadmaps: feRoadmap ? [feRoadmap._id] : [],
      verificationStatus: 'approved',
      isFeatured: true,
      creatorId: elena._id
    });
  }

  // Seed 30 Bulk Opportunities
  for (let i = 0; i < 30; i++) {
    const org = rng.pick(companies);
    const title = rng.pick(titles);
    const creator = rng.pick(guides);

    await Opportunity.create({
      title: `${title} - #${i + 1}`,
      slug: `${slugify(org)}-${slugify(title)}-${i + 1}`,
      opportunityType: rng.pick(types) as any,
      organizationName: org,
      organizationLogo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3',
      domains: ['Computer Science'],
      careerDomains: csDomains,
      careerGoals: goalIds,
      requiredSkills: rng.pickMultiple(['React', 'TypeScript', 'Python', 'NumPy', 'Penetration Testing', 'SQL', 'Git'], 3),
      preferredSkills: [rng.pick(['Next.js', 'Docker', 'AWS', 'Zustand', 'PyTorch'])],
      difficulty: rng.pick(['beginner', 'intermediate', 'advanced']),
      eligibilityCriteria: 'Familiarity with standard career taxonomy profiles.',
      location: rng.pick(['Remote, US', 'New York, NY', 'San Francisco, CA', 'Austin, TX']),
      remoteStatus: rng.pick(['remote', 'hybrid', 'onsite']),
      stipend: rng.chance(0.5) ? '$2000 - $3500 per month' : undefined,
      salaryRange: rng.chance(0.5) ? '$70,000 - $95,000 per year' : undefined,
      applicationDeadline: new Date(Date.now() + rng.nextInt(5, 60) * 24 * 60 * 60 * 1000),
      applicationLink: `https://${slugify(org)}.com/careers`,
      readinessSignals: ['Completed foundations section of domain roadmap'],
      recommendedRoadmaps: feRoadmap && rng.chance(0.5) ? [feRoadmap._id] : aiRoadmap ? [aiRoadmap._id] : [],
      verificationStatus: 'approved',
      isFeatured: rng.chance(0.2),
      creatorId: creator._id
    });
  }

  console.log('✅ 30+ comprehensive Opportunities seeded successfully!');
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

if (require.main === module) {
  seedOpportunities()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
