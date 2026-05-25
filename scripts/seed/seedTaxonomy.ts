import mongoose from 'mongoose';
import { CareerCluster } from '../../src/modules/taxonomy/careerCluster.model';
import { CareerDomain } from '../../src/modules/taxonomy/careerDomain.model';
import { CareerGoal } from '../../src/modules/taxonomy/careerGoal.model';
import { PathwayConnection } from '../../src/modules/pathways/pathwayConnection.model';
import { connectDb } from './helper';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

const normalize = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const clusters = [
  ['Technology & Engineering', 'cpu', '#2563eb', 'Software, hardware, engineering, data, security, and emerging technical careers.'],
  ['Medicine & Healthcare', 'heart-pulse', '#dc2626', 'Clinical, allied health, wellness, public health, and medical education paths.'],
  ['Commerce & Business', 'briefcase-business', '#16a34a', 'Finance, management, marketing, operations, entrepreneurship, and business careers.'],
  ['Arts & Humanities', 'book-open', '#9333ea', 'Humanities, social sciences, writing, languages, psychology, and public-facing scholarship.'],
  ['Law & Governance', 'scale', '#7c2d12', 'Law, policy, public administration, governance, judiciary, and civic systems.'],
  ['Design & Creative Arts', 'palette', '#ea580c', 'Design, media, visual communication, content, craft, and creative practice.'],
  ['Government & Civil Services', 'landmark', '#0f766e', 'Civil services, public sector exams, defense, railways, banking exams, and government careers.']
];

const domains: Record<string, [string, string[]][]> = {
  'Technology & Engineering': [
    ['Computer Science', ['CS', 'Software Engineering', 'Programming', 'Coding', 'Web Development']],
    ['Data Science', ['Analytics', 'Machine Learning', 'AI/ML', 'Artificial Intelligence', 'Data Engineering']],
    ['Cybersecurity', ['InfoSec', 'Security Engineering', 'Ethical Hacking', 'Penetration Testing']]
  ],
  'Medicine & Healthcare': [
    ['MBBS', ['Medicine', 'Doctor', 'Medical School']]
  ],
  'Commerce & Business': [
    ['Finance', ['Investment Banking', 'Financial Analysis', 'Accounting']],
    ['Marketing', ['Digital Marketing', 'Brand Management', 'Growth Marketing']]
  ],
  'Design & Creative Arts': [
    ['UX Design', ['UI/UX', 'UI UX', 'Product Design', 'User Experience Design']]
  ]
};

const goals = [
  ['Crack entrance exam', 'Prepare for entrance, eligibility, public sector, or professional exams.'],
  ['Get internship', 'Find and prepare for internship opportunities.'],
  ['Land first job', 'Build a job-ready profile and enter the workforce.'],
  ['Career switch', 'Move from one field or role into another.'],
  ['Study abroad', 'Plan applications, exams, funding, and international pathways.'],
  ['Freelancing', 'Build independent client, portfolio, and pricing systems.']
];

export const seedTaxonomy = async () => {
  await connectDb();

  console.log('🗂️  Seeding Career Taxonomy tree...');

  const clusterDocs: Record<string, any> = {};
  const domainDocs: Record<string, any> = {};

  // 1. Seed Clusters
  for (let i = 0; i < clusters.length; i++) {
    const [name, icon, color, description] = clusters[i];
    const doc = await CareerCluster.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), icon, color, description, order: i + 1, isActive: true },
      { upsert: true, new: true }
    );
    clusterDocs[name] = doc;
  }

  // 2. Seed Domains
  for (const [clusterName, items] of Object.entries(domains)) {
    for (const [name, aliases] of items) {
      const allAliases = [...new Set([name, ...aliases])];
      const doc = await CareerDomain.findOneAndUpdate(
        { slug: slugify(name) },
        {
          clusterId: clusterDocs[clusterName]._id,
          name,
          slug: slugify(name),
          aliases: allAliases,
          normalizedAliases: allAliases.map(normalize),
          trendingScore: Math.floor(60 + Math.random() * 35),
          isActive: true
        },
        { upsert: true, new: true }
      );
      domainDocs[name] = doc;
    }
  }

  // 3. Seed Goals
  const createdGoals: any[] = [];
  for (let i = 0; i < goals.length; i++) {
    const [name, description] = goals[i];
    const doc = await CareerGoal.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), description, order: i + 1, applicableStages: [], isActive: true },
      { upsert: true, new: true }
    );
    createdGoals.push(doc);
  }

  // 4. Seed Pathway Connections (Adjacent Graphs)
  console.log('🕸️  Seeding directional Pathway Connections graph...');
  const connections = [
    {
      sourceDomain: domainDocs['Computer Science']._id,
      targetDomain: domainDocs['UX Design']._id,
      relationshipType: 'adjacent_career',
      overlapStrength: 70,
      requiredSkills: ['UI Principles', 'Figma', 'Wireframing', 'User Research'],
      opportunityOutcomes: ['UI Developer', 'Product Designer', 'Frontend Engineer'],
      decisionSignals: ['Do you enjoy aesthetics as much as logic?', 'Do you prefer creating interactive interfaces?'],
      estimatedTimelineWeeks: 12
    },
    {
      sourceDomain: domainDocs['Computer Science']._id,
      targetDomain: domainDocs['Data Science']._id,
      relationshipType: 'specialization',
      overlapStrength: 85,
      requiredSkills: ['Statistics', 'Python', 'Pandas', 'Linear Algebra', 'Machine Learning Models'],
      opportunityOutcomes: ['Data Scientist', 'AI Engineer', 'ML Operations Specialist'],
      decisionSignals: ['Do you like statistics?', 'Do you enjoy extracting insights from large data logs?'],
      estimatedTimelineWeeks: 18
    },
    {
      sourceDomain: domainDocs['Computer Science']._id,
      targetDomain: domainDocs['Cybersecurity']._id,
      relationshipType: 'specialization',
      overlapStrength: 80,
      requiredSkills: ['Network Protocols', 'Linux Systems', 'Penetration Testing', 'Cryptography'],
      opportunityOutcomes: ['Penetration Tester', 'Security Operations Analyst', 'Network Architect'],
      decisionSignals: ['Are you interested in system defense and protection frameworks?'],
      estimatedTimelineWeeks: 16
    }
  ];

  for (const conn of connections) {
    await PathwayConnection.findOneAndUpdate(
      { sourceDomain: conn.sourceDomain, targetDomain: conn.targetDomain },
      conn,
      { upsert: true }
    );
  }

  console.log(`✅ Taxonomy seeding completed successfully!`);
};

if (require.main === module) {
  seedTaxonomy()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
