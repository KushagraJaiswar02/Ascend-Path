import { z } from 'zod';

export const tagsSchema = z.array(z.string().trim().min(1).max(20)).max(5);

export const roadmapSkeletonSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimatedWeeks: z.number().min(1).max(52),
  steps: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ).min(1).max(10),
});
