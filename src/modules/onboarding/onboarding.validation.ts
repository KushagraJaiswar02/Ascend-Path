import { z } from 'zod';

export const onboardingGoals = [
  'land_first_job',
  'switch_domains',
  'improve_current_skills',
  'prepare_for_interviews',
  'find_mentor_guidance',
  'build_projects',
  'become_a_mentor',
] as const;

export const experienceLevels = ['beginner', 'intermediate', 'advanced'] as const;

export const onboardingDomains = [
  'Frontend',
  'Backend',
  'Full Stack',
  'DevOps',
  'AI/ML',
  'Cybersecurity',
  'Mobile',
  'DSA',
  'System Design',
  'Cloud',
] as const;

export const submitOnboardingSchema = z.object({
  body: z.object({
    primaryGoal: z.enum(onboardingGoals),
    experienceLevel: z.enum(experienceLevels),
    targetRole: z.string().min(2).max(120).trim(),
    interestedDomains: z.array(z.enum(onboardingDomains)).min(1).max(6),
    preferredLearningStyle: z.enum(['roadmaps', 'mentor_sessions', 'projects', 'forum_discussion', 'mixed']).optional(),
    weeklyCommitmentHours: z.number().int().min(1).max(80).optional(),
  }),
});

export type SubmitOnboardingInput = z.infer<typeof submitOnboardingSchema>['body'];
