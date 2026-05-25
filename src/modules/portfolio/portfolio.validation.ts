import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150),
    description: z.string().min(10).max(2000),
    images: z.array(z.string().url()).optional().default([]),
    githubLink: z.string().url().optional().or(z.string().length(0)),
    demoLink: z.string().url().optional().or(z.string().length(0)),
    technologies: z.array(z.string()).optional().default([]),
    domains: z.array(z.string()).optional().default([]),
    roadmapId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Roadmap ID').optional().or(z.string().length(0)),
    projectReflections: z.string().min(10).max(3000),
    learningOutcomes: z.array(z.string()).optional().default([]),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(150).optional(),
    description: z.string().min(10).max(2000).optional(),
    images: z.array(z.string().url()).optional(),
    githubLink: z.string().url().optional().or(z.string().length(0)),
    demoLink: z.string().url().optional().or(z.string().length(0)),
    technologies: z.array(z.string()).optional(),
    domains: z.array(z.string()).optional(),
    roadmapId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Roadmap ID').optional().or(z.string().length(0)),
    projectReflections: z.string().min(10).max(3000).optional(),
    learningOutcomes: z.array(z.string()).optional(),
  }),
});

export const reviewProjectSchema = z.object({
  body: z.object({
    reviewNotes: z.string().min(5).max(1500),
  }),
});
