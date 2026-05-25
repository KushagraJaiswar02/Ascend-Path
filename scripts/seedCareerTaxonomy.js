require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/ascendpath';

const slugify = (value) => value.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
const normalize = (value) => value.toLowerCase().trim().replace(/&/g, ' and ').replace(/\+/g, ' plus ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

const clusterSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  icon: String,
  color: String,
  description: String,
  order: Number,
  isActive: Boolean,
}, { timestamps: true });

const domainSchema = new mongoose.Schema({
  clusterId: { type: mongoose.Schema.Types.ObjectId, ref: 'CareerCluster' },
  name: String,
  slug: { type: String, unique: true },
  aliases: [String],
  normalizedAliases: [String],
  description: String,
  trendingScore: Number,
  isActive: Boolean,
}, { timestamps: true });

const goalSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  description: String,
  order: Number,
  applicableStages: [String],
  isActive: Boolean,
}, { timestamps: true });

const CareerCluster = mongoose.model('CareerCluster', clusterSchema);
const CareerDomain = mongoose.model('CareerDomain', domainSchema);
const CareerGoal = mongoose.model('CareerGoal', goalSchema);

const clusters = [
  ['Technology & Engineering', 'cpu', '#2563eb', 'Software, hardware, engineering, data, security, and emerging technical careers.'],
  ['Medicine & Healthcare', 'heart-pulse', '#dc2626', 'Clinical, allied health, wellness, public health, and medical education paths.'],
  ['Commerce & Business', 'briefcase-business', '#16a34a', 'Finance, management, marketing, operations, entrepreneurship, and business careers.'],
  ['Arts & Humanities', 'book-open', '#9333ea', 'Humanities, social sciences, writing, languages, psychology, and public-facing scholarship.'],
  ['Law & Governance', 'scale', '#7c2d12', 'Law, policy, public administration, governance, judiciary, and civic systems.'],
  ['Design & Creative Arts', 'palette', '#ea580c', 'Design, media, visual communication, content, craft, and creative practice.'],
  ['Government & Civil Services', 'landmark', '#0f766e', 'Civil services, public sector exams, defense, railways, banking exams, and government careers.'],
  ['Education & Teaching', 'graduation-cap', '#4f46e5', 'Teaching, training, academic careers, edtech, tutoring, and curriculum design.'],
  ['Vocational & Skilled Trades', 'wrench', '#64748b', 'Practical trades, technical diplomas, apprenticeships, and skill-based careers.'],
  ['Sports, Fitness & Wellness', 'dumbbell', '#be123c', 'Sports, coaching, fitness, wellness, nutrition, and performance careers.'],
];

const domains = {
  'Technology & Engineering': [
    ['Computer Science', ['CS', 'Software Engineering', 'Programming', 'Coding']],
    ['Data Science', ['Analytics', 'Machine Learning', 'AI/ML', 'Artificial Intelligence']],
    ['Cybersecurity', ['InfoSec', 'Security Engineering', 'Ethical Hacking']],
    ['Mechanical Engineering', ['Mech', 'Manufacturing Engineering']],
    ['Civil Engineering', ['Construction Engineering', 'Structural Engineering']],
    ['Electronics & Communication', ['ECE', 'Electronics Engineering']],
  ],
  'Medicine & Healthcare': [
    ['MBBS', ['Medicine', 'Doctor', 'Medical School']],
    ['Nursing', ['BSc Nursing', 'GNM']],
    ['Physiotherapy', ['Physical Therapy', 'BPT']],
    ['Pharmacy', ['BPharm', 'Pharmacology']],
    ['Public Health', ['Healthcare Management', 'Epidemiology']],
  ],
  'Commerce & Business': [
    ['Finance', ['Investment Banking', 'Financial Analysis', 'Accounting']],
    ['Marketing', ['Digital Marketing', 'Brand Management', 'Growth Marketing']],
    ['Entrepreneurship', ['Startup', 'Business Owner', 'Founder']],
    ['Human Resources', ['HR', 'People Operations']],
    ['Operations & Supply Chain', ['Operations', 'Logistics', 'Supply Chain']],
  ],
  'Arts & Humanities': [
    ['Psychology', ['Counselling', 'Clinical Psychology']],
    ['English Literature', ['Literature', 'Creative Writing']],
    ['Journalism & Mass Communication', ['Journalism', 'Media Studies']],
    ['Economics', ['Economics Honours', 'Policy Economics']],
  ],
  'Law & Governance': [
    ['Law', ['LLB', 'Legal Studies', 'Corporate Law']],
    ['Public Policy', ['Policy', 'Governance']],
    ['Judiciary Exams', ['Judicial Services', 'PCS J']],
  ],
  'Design & Creative Arts': [
    ['UX Design', ['UI/UX', 'UI UX', 'Product Design', 'User Experience Design']],
    ['Graphic Design', ['Visual Design', 'Communication Design']],
    ['Animation & VFX', ['Animation', 'VFX', 'Motion Design']],
    ['Fashion Design', ['Apparel Design', 'Textile Design']],
  ],
  'Government & Civil Services': [
    ['Civil Services', ['UPSC', 'IAS', 'IPS', 'State PSC']],
    ['Banking Exams', ['IBPS', 'SBI PO', 'RBI Grade B']],
    ['Defence Services', ['NDA', 'CDS', 'AFCAT']],
    ['Railway Exams', ['RRB', 'Railways']],
  ],
  'Education & Teaching': [
    ['School Teaching', ['Teacher', 'BEd', 'TET']],
    ['Higher Education', ['Professor', 'Research', 'PhD']],
    ['Tutoring & Coaching', ['Online Tutor', 'Coaching']],
  ],
  'Vocational & Skilled Trades': [
    ['Electrician', ['Electrical Trade', 'ITI Electrician']],
    ['Automotive Technician', ['Mechanic', 'Automobile Repair']],
    ['Culinary Arts', ['Chef', 'Cooking', 'Bakery']],
  ],
  'Sports, Fitness & Wellness': [
    ['Fitness Coaching', ['Personal Trainer', 'Gym Trainer']],
    ['Nutrition & Dietetics', ['Dietician', 'Nutritionist']],
    ['Sports Management', ['Athletics Management', 'Sports Business']],
  ],
};

const goals = [
  ['Crack entrance exam', 'Prepare for entrance, eligibility, public sector, or professional exams.'],
  ['Get internship', 'Find and prepare for internship opportunities.'],
  ['Land first job', 'Build a job-ready profile and enter the workforce.'],
  ['Career switch', 'Move from one field or role into another.'],
  ['Study abroad', 'Plan applications, exams, funding, and international pathways.'],
  ['Freelancing', 'Build independent client, portfolio, and pricing systems.'],
  ['Start business', 'Validate, launch, and operate a business or startup.'],
  ['Upskill in current role', 'Grow inside an existing role or profession.'],
  ['Find mentor guidance', 'Get personalized guidance from experienced mentors.'],
];

async function upsert() {
  await mongoose.connect(mongoUri);
  const clusterDocs = {};

  for (let i = 0; i < clusters.length; i += 1) {
    const [name, icon, color, description] = clusters[i];
    const doc = await CareerCluster.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), icon, color, description, order: i + 1, isActive: true },
      { upsert: true, new: true }
    );
    clusterDocs[name] = doc;
  }

  for (const [clusterName, items] of Object.entries(domains)) {
    for (const [name, aliases] of items) {
      const allAliases = [...new Set([name, ...aliases])];
      await CareerDomain.findOneAndUpdate(
        { slug: slugify(name) },
        {
          clusterId: clusterDocs[clusterName]._id,
          name,
          slug: slugify(name),
          aliases: allAliases,
          normalizedAliases: allAliases.map(normalize),
          trendingScore: Math.floor(40 + Math.random() * 50),
          isActive: true,
        },
        { upsert: true, new: true }
      );
    }
  }

  for (let i = 0; i < goals.length; i += 1) {
    const [name, description] = goals[i];
    await CareerGoal.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), description, order: i + 1, applicableStages: [], isActive: true },
      { upsert: true, new: true }
    );
  }

  console.log(`Seeded ${clusters.length} clusters, ${Object.values(domains).flat().length} domains, and ${goals.length} goals.`);
  await mongoose.disconnect();
}

upsert().catch((error) => {
  console.error(error);
  process.exit(1);
});
