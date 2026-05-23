require('ts-node/register');
require('dotenv').config();

const mongoose = require('mongoose');
const { User, Role } = require('../src/modules/users/user.model');
const { CareerRoadmap, RoadmapSection, RoadmapStep } = require('../src/modules/roadmaps/roadmap.model');
const { UserProgress } = require('../src/modules/roadmaps/userProgress.model');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ascendPath';

async function run() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB for structured roadmaps seeding...');

  // 1. Clear previous roadmaps, sections, steps, and progress records
  console.log('Cleaning up previous roadmap database data...');
  await Promise.all([
    CareerRoadmap.deleteMany({}),
    RoadmapSection.deleteMany({}),
    RoadmapStep.deleteMany({}),
    UserProgress.deleteMany({}),
  ]);

  // 2. Find guide users
  const guides = await User.find({ role: Role.GUIDE });
  const students = await User.find({ role: Role.EXPLORER });

  if (guides.length === 0) {
    console.error('Seeding aborted: Make sure to run guide profile seeding first so guides exist!');
    await mongoose.disconnect();
    return;
  }

  const sarah = guides.find(g => g.name === 'Sarah Connor') || guides[0];
  const dev = guides.find(g => g.name === 'Dev Kapoor') || guides[0];
  const student = students[0];

  console.log(`Associated DevOps Roadmap with: ${sarah.name}`);
  console.log(`Associated Full Stack Roadmap with: ${dev.name}`);

  // 3. Create DevOps Roadmap
  const devopsRoadmap = await CareerRoadmap.create({
    title: 'DevOps & Infrastructure Engineering',
    slug: 'devops-infrastructure-engineering',
    description: 'Learn the modern pipeline engineering, container ecosystems, cloud architectures, and CI/CD tools that power scalable global products.',
    thumbnail: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?q=80&w=600&auto=format&fit=crop',
    domains: ['DevOps', 'System Design'],
    tags: ['Docker', 'Kubernetes', 'AWS', 'Linux', 'Terraform', 'CI/CD'],
    difficulty: 'intermediate',
    estimatedWeeks: 12,
    createdBy: sarah._id,
    enrollmentCount: 0,
    averageRating: 4.8,
    isPublished: true,
    prerequisites: ['Basic scripting in Python or Bash', 'Understanding of basic web request networking'],
    learningOutcomes: [
      'Containerize multi-service applications using Docker',
      'Orchestrate containers at production scale using Kubernetes',
      'Architect highly-available cloud infrastructure using AWS networks',
      'Build continuous deployment pipelines with zero-downtime rollouts'
    ],
    visibility: 'public',
    isPublic: true,
    targetRole: 'DevOps Engineer',
    domain: 'DevOps',
  });

  // DevOps Sections
  const sec1 = await RoadmapSection.create({
    roadmapId: devopsRoadmap._id,
    title: '1. Core Linux & Shell Configuration',
    description: 'The foundation of systems engineering lies in shell literacy, resource scheduling, and POSIX configurations.',
    order: 0,
  });

  const sec2 = await RoadmapSection.create({
    roadmapId: devopsRoadmap._id,
    title: '2. Containerization Ecosystem (Docker)',
    description: 'Learn to isolate app dependencies, manage network namespaces, build layered cache images, and orchestrate with Compose.',
    order: 1,
  });

  const sec3 = await RoadmapSection.create({
    roadmapId: devopsRoadmap._id,
    title: '3. Orchestration & Kubernetes',
    description: 'Transition containers into a fully distributed cluster. Master services, ingress controllers, volume claims, and scaling.',
    order: 2,
  });

  // DevOps Steps
  // Section 1 steps
  const step1_1 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec1._id,
    title: 'POSIX Architecture & Shell Literacy',
    description: 'Deep dive into standard Unix directories (/var, /etc, /bin), execution permissions (chmod/chown), and stdin/stdout/stderr pipes.',
    type: 'video',
    resources: [
      { type: 'video', title: 'Linux Standard Directory Structure Guide', url: 'https://youtube.com/watch?v=HbgzrKJvDRw' },
      { type: 'article', title: 'Guide to Standard Input, Output, and Error redirection', url: 'https://linuxhandbook.com/redirection/' }
    ],
    estimatedMinutes: 25,
    difficulty: 'beginner',
    order: 0,
    isOptional: false,
  });

  const step1_2 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec1._id,
    title: 'Common Shell Diagnostics & Process Monitoring',
    description: 'How to monitor CPU spikes, memory leaks, disk storage, and open port bindings using top, htop, df, du, netstat, and lsof.',
    type: 'article',
    resources: [
      { type: 'article', title: 'Ultimate Linux Performance Monitoring Cheat Sheet', url: 'https://medium.com/systems-basics/linux-diagnostics' }
    ],
    estimatedMinutes: 20,
    difficulty: 'beginner',
    order: 1,
    isOptional: false,
  });

  const step1_3 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec1._id,
    title: 'Bash Scripting: Automated Log Purger',
    description: 'Write an automated bash script that parses /var/log, isolates lines with error status codes, zips them, and sends a slack notification webhook.',
    type: 'assignment',
    resources: [
      { type: 'article', title: 'Bash scripting for beginners', url: 'https://linuxconfig.org/bash-scripting-tutorial-for-beginners' }
    ],
    estimatedMinutes: 45,
    difficulty: 'intermediate',
    order: 2,
    isOptional: false,
  });

  const step1_4 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec1._id,
    title: 'Optional: Oh-My-Zsh & Custom Tmux Multiplexers',
    description: 'Boost terminal productivity by utilizing standard terminal multiplexers, zsh autocompletions, and syntax highlighting plugins.',
    type: 'external resource',
    resources: [
      { type: 'article', title: 'A Beginner Guide to Tmux Workspace Management', url: 'https://tmuxcheatsheet.com/' }
    ],
    estimatedMinutes: 15,
    difficulty: 'beginner',
    order: 3,
    isOptional: true,
  });

  // Section 2 steps
  const step2_1 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec2._id,
    title: 'Virtualization vs Containerization',
    description: 'Understand kernel resource isolation mechanisms (cgroups and kernel namespaces) compared to hypervisor-level guest OS virtual machines.',
    type: 'article',
    resources: [
      { type: 'article', title: 'Under the Hood: Demystifying Cgroups & Namespaces', url: 'https://docker.com/blog/namespaces-cgroups-containers/' }
    ],
    estimatedMinutes: 15,
    difficulty: 'intermediate',
    order: 0,
    isOptional: false,
  });

  const step2_2 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec2._id,
    title: 'Crafting Optimized Multi-Stage Dockerfiles',
    description: 'Learn to use alpine base layers, prune developmental package cache, configure non-root security contexts, and run multi-stage production builds.',
    type: 'assignment',
    resources: [
      { type: 'article', title: 'Best Practices for Writing Production-grade Dockerfiles', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/' }
    ],
    estimatedMinutes: 35,
    difficulty: 'intermediate',
    order: 1,
    isOptional: false,
  });

  const step2_3 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec2._id,
    title: 'Docker Compose for Full Stack App orchestration',
    description: 'Launch a local environment containing a NodeJS backend, a React frontend, and a MongoDB container. Manage bridged subnets, named persistent volumes, and healthcheck dependencies.',
    type: 'project',
    resources: [
      { type: 'video', title: 'Docker Compose Local Network Orchestration', url: 'https://youtube.com/watch?v=dockercompose-tutorial' }
    ],
    estimatedMinutes: 60,
    difficulty: 'intermediate',
    order: 2,
    isOptional: false,
  });

  // Section 3 steps
  const step3_1 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec3._id,
    title: 'Kubernetes Cluster Control Plane Architecture',
    description: 'Deep dive into the main architecture parts: API Server, etcd cluster database, Controller Manager, Scheduler, kubelet daemon, and container runtime interface.',
    type: 'video',
    resources: [
      { type: 'video', title: 'Visual Guide to the Kubernetes Control Plane', url: 'https://youtube.com/watch?v=k8s-controlplane' }
    ],
    estimatedMinutes: 30,
    difficulty: 'advanced',
    order: 0,
    isOptional: false,
  });

  const step3_2 = await RoadmapStep.create({
    roadmapId: devopsRoadmap._id,
    sectionId: sec3._id,
    title: 'Deploying High-Availability Web Apps with LoadBalancer',
    description: 'Write YAML declarations config for standard Deployments, ClusterIP & NodePort Services, Ingress Routes, Horizontal Pod Autoscalers (HPA), and Secrets.',
    type: 'assignment',
    resources: [
      { type: 'article', title: 'Production Deployments YAML templates', url: 'https://kubernetes.io/docs/concepts/workloads/controllers/deployment/' }
    ],
    estimatedMinutes: 50,
    difficulty: 'advanced',
    order: 1,
    isOptional: false,
  });


  // 4. Create Full Stack Web Development Roadmap
  const fullstackRoadmap = await CareerRoadmap.create({
    title: 'Full Stack JavaScript & Systems Architecture',
    slug: 'fullstack-javascript-systems-architecture',
    description: 'From fluid interactive UI experiences to concurrent clustered backend systems, caching strategies, and data indexes.',
    thumbnail: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?q=80&w=600&auto=format&fit=crop',
    domains: ['Frontend Development', 'Backend Development'],
    tags: ['React', 'TypeScript', 'NodeJS', 'MongoDB', 'Redis', 'Express'],
    difficulty: 'advanced',
    estimatedWeeks: 16,
    createdBy: dev._id,
    enrollmentCount: 0,
    averageRating: 4.9,
    isPublished: true,
    prerequisites: ['HTML5 / CSS3 proficiency', 'Intermedate ES6+ JavaScript scripting skills'],
    learningOutcomes: [
      'Master reactive SPA patterns using React and complex custom hooks',
      'Build non-blocking high-throughput backend APIs using Node.js',
      'Optimize database queries with indexes and Mongoose aggregation pipelines',
      'Scale real-time capabilities utilizing Redis caching and Pub/Sub connections'
    ],
    visibility: 'public',
    isPublic: true,
    targetRole: 'Full Stack Engineer',
    domain: 'Software Engineering',
  });

  // Full Stack Sections
  const fsSec1 = await RoadmapSection.create({
    roadmapId: fullstackRoadmap._id,
    title: '1. Modern React & Performance Engineering',
    description: 'Optimize interactive render frames, hook cycles, memoization selectors, and layout paint metrics.',
    order: 0,
  });

  const fsSec2 = await RoadmapSection.create({
    roadmapId: fullstackRoadmap._id,
    title: '2. Clustered Backend Node & Database Performance',
    description: 'Build robust web servers that handle heavy concurrent user streams, query indices, and memory profiling.',
    order: 1,
  });

  // Full Stack Steps
  // Section 1 steps
  const stepFs1_1 = await RoadmapStep.create({
    roadmapId: fullstackRoadmap._id,
    sectionId: fsSec1._id,
    title: 'Component Render Cycles & Memoization',
    description: 'Learn exactly how React schedules tree reconciliations, and how to correctly position React.memo, useMemo, and useCallback to avoid paint lag.',
    type: 'video',
    resources: [
      { type: 'video', title: 'Why Did My Component Re-render? Masterclass', url: 'https://youtube.com/watch?v=react-render-deepdive' }
    ],
    estimatedMinutes: 20,
    difficulty: 'intermediate',
    order: 0,
    isOptional: false,
  });

  const stepFs1_2 = await RoadmapStep.create({
    roadmapId: fullstackRoadmap._id,
    sectionId: fsSec1._id,
    title: 'State Management & Custom Hook Patterns',
    description: 'Design composable, clean custom hooks that encapsulate async fetch states, debounce triggers, and localized local storage integration.',
    type: 'article',
    resources: [
      { type: 'article', title: 'Design patterns for clean custom hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks' }
    ],
    estimatedMinutes: 20,
    difficulty: 'intermediate',
    order: 1,
    isOptional: false,
  });

  const stepFs1_3 = await RoadmapStep.create({
    roadmapId: fullstackRoadmap._id,
    sectionId: fsSec1._id,
    title: 'Mini-Project: Real-time Multi-Filter Guide Discovery Dashboard',
    description: 'Create a responsive React view panel implementing debounced grid queries, TanStack cache queries, and responsive grid layouts.',
    type: 'project',
    resources: [
      { type: 'article', title: 'TanStack Query (React Query) Best Practices', url: 'https://tanstack.com/query/v5' }
    ],
    estimatedMinutes: 90,
    difficulty: 'advanced',
    order: 2,
    isOptional: false,
  });

  // Section 2 steps
  const stepFs2_1 = await RoadmapStep.create({
    roadmapId: fullstackRoadmap._id,
    sectionId: fsSec2._id,
    title: 'NodeJS Event Loop & Microtask Queue Scheduling',
    description: 'Demystify the non-blocking I/O loop: Poll phase, Check phase, Timers, process.nextTick, and Promise microtask queues.',
    type: 'video',
    resources: [
      { type: 'video', title: 'Everything You Need to Know About the NodeJS Event Loop', url: 'https://youtube.com/watch?v=evloop-nodes' }
    ],
    estimatedMinutes: 30,
    difficulty: 'advanced',
    order: 0,
    isOptional: false,
  });

  const stepFs2_2 = await RoadmapStep.create({
    roadmapId: fullstackRoadmap._id,
    sectionId: fsSec2._id,
    title: 'Aggregations & Compound Index Tuning',
    description: 'Analyze query execution plans (explain(\"executionStats\")) in MongoDB. Master compound index bounds, and construct aggregation stages ($lookup, $facet, $match, $sort).',
    type: 'assignment',
    resources: [
      { type: 'article', title: 'Optimizing MongoDB Query Indexes and Aggregations', url: 'https://mongodb.com/docs/manual/core/aggregation-pipeline/' }
    ],
    estimatedMinutes: 40,
    difficulty: 'advanced',
    order: 1,
    isOptional: false,
  });

  const stepFs2_3 = await RoadmapStep.create({
    roadmapId: fullstackRoadmap._id,
    sectionId: fsSec2._id,
    title: 'Optional: Redis Cache Layer Implementation',
    description: 'Install and hook Redis client. Set up an Express cache middleware that intercept requests, checks cache hits, and saves heavy database pipelines.',
    type: 'external resource',
    resources: [
      { type: 'article', title: 'How to Cache Express APIs with Redis', url: 'https://redis.io/docs/develop/cache/' }
    ],
    estimatedMinutes: 30,
    difficulty: 'advanced',
    order: 2,
    isOptional: true,
  });

  // 5. Seed progress records for student
  if (student) {
    console.log(`Enrolling student (${student.name}) into both DevOps and Full Stack roadmaps...`);
    
    // DevOps progress - 2 out of 8 required steps completed (25%)
    await UserProgress.create({
      userId: student._id,
      roadmapId: devopsRoadmap._id,
      completedSteps: [step1_1._id, step1_2._id],
      progressPercentage: 25,
      streakCount: 3,
      startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastActiveAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      notes: new Map([
        [step1_1._id.toString(), 'Unix directories follow the FHS (Filesystem Hierarchy Standard). Ingress/Egress redirection uses > and < operators.'],
        [step1_2._id.toString(), 'htop is great, but lsof -i :<port> is my lifesaver for identifying dead server node lock processes.']
      ]),
      bookmarkedSteps: [step2_2._id],
    });

    // Full Stack progress - 1 out of 5 required steps completed (20%)
    await UserProgress.create({
      userId: student._id,
      roadmapId: fullstackRoadmap._id,
      completedSteps: [stepFs1_1._id],
      progressPercentage: 20,
      streakCount: 1,
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastActiveAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      notes: new Map([
        [stepFs1_1._id.toString(), 'Component renders are triggered by state, prop, or context changes. Memo filters checks shallow prop differences.']
      ]),
      bookmarkedSteps: [stepFs2_2._id],
    });

    // Increment enrollment counts
    await CareerRoadmap.findByIdAndUpdate(devopsRoadmap._id, { enrollmentCount: 1 });
    await CareerRoadmap.findByIdAndUpdate(fullstackRoadmap._id, { enrollmentCount: 1 });
  }

  console.log('\n=============================================================');
  console.log('STRUCTURED CURRICULUM ROADMAPS SEEDING COMPLETED!');
  console.log(`1. Roadmap: DevOps & Infrastructure Engineering`);
  console.log(`   Created By: Sarah Connor | Sections: 3 | Steps: 8 required, 1 optional`);
  console.log(`2. Roadmap: Full Stack JavaScript & Systems Architecture`);
  console.log(`   Created By: Dev Kapoor | Sections: 2 | Steps: 5 required, 1 optional`);
  console.log(`=============================================================`);

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error('Failed to seed structured roadmaps:', error);
  await mongoose.disconnect();
  process.exit(1);
});
