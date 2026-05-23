import { z } from 'zod';

export const getGuidesQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    domains: z.string().optional(), // Comma-separated list of domains
    skills: z.string().optional(), // Comma-separated list of skills
    minRating: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(1).max(5)).optional(),
    minFameScore: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(0)).optional(),
    minSessions: z.preprocess((val) => (val ? Number(val) : undefined), z.number().min(0)).optional(),
    isBeginnerFriendly: z.preprocess((val) => (val === undefined || val === '' ? undefined : (val === 'true' || val === '1' || val === true)), z.boolean()).optional(),
    isTopRated: z.preprocess((val) => (val === undefined || val === '' ? undefined : (val === 'true' || val === '1' || val === true)), z.boolean()).optional(),
    isMostActive: z.preprocess((val) => (val === undefined || val === '' ? undefined : (val === 'true' || val === '1' || val === true)), z.boolean()).optional(),
    availability: z.string().optional(), // Day of the week
    page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).default(1),
    limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).default(20),
    sortBy: z.enum(['fameScore', 'averageRating', 'totalSessions', 'newest', 'mostActive']).default('fameScore'),
  }),
});

export const updateGuideProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(1000, 'Bio cannot exceed 1000 characters').optional(),
    domains: z.array(z.string()).optional(),
    skills: z.array(
      z.object({
        name: z.string().min(1, 'Skill name is required'),
        level: z.string().optional(),
        years: z.number().optional(),
      })
    ).optional(),
    interests: z.array(z.string()).optional(),
    socialLinks: z.object({
      github: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
      linkedin: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
      website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
    }).optional(),
    availability: z.object({
      text: z.string().max(100).default('Available for bookings').optional(),
      schedule: z.array(
        z.object({
          day: z.string().min(1),
          slots: z.array(z.string()),
        })
      ).optional(),
    }).optional(),
    profileVisibility: z.boolean().optional(),
    onboardingCompleted: z.boolean().optional(),
  }),
});

export type GetGuidesQueryInput = z.infer<typeof getGuidesQuerySchema>['query'];
export type UpdateGuideProfileInput = z.infer<typeof updateGuideProfileSchema>['body'];
