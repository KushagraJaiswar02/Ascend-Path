import { z } from 'zod';

export const experienceLevels = ['beginner', 'intermediate', 'advanced'] as const;

export const careerStages = [
  'school_student',
  'college_student',
  'graduate',
  'working_professional',
  'career_switcher',
  'exam_aspirant',
  'freelancer',
  'vocational_learner',
] as const;

export const weeklyCommitments = ['0_3_hours', '4_7_hours', '8_15_hours', '16_plus_hours'] as const;
export const budgetRanges = ['free_only', 'low_cost', 'moderate', 'premium', 'flexible'] as const;
export const clarityLevels = ['unsure', 'exploring', 'somewhat_clear', 'highly_focused'] as const;

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');
const optionalText = (min = 2, max = 120) =>
  z.union([
    z.string().trim().min(min).max(max),
    z.literal('').transform(() => undefined),
  ]).optional();

export const submitOnboardingSchema = z.object({
  body: z.object({
    primaryGoal: optionalText(),
    careerGoals: z.array(objectId).max(8).default([]),
    experienceLevel: z.enum(experienceLevels).optional(),
    careerStage: z.enum(careerStages),
    targetRole: optionalText(),
    interestedDomains: z.array(z.string().min(1).max(120).trim()).max(24).default([]),
    careerDomains: z.array(objectId).max(24).default([]),
    preferredLearningStyle: z.enum(['roadmaps', 'mentor_sessions', 'projects', 'forum_discussion', 'mixed']).optional(),
    mentorshipPreference: z.enum(['mentor_guided', 'occasional_checkins', 'peer_community', 'self_paced']).optional(),
    directionClarity: z.enum(clarityLevels).optional(),
    weeklyCommitment: z.enum(weeklyCommitments).optional(),
    weeklyCommitmentHours: z.number().int().min(1).max(80).optional(),
    budgetRange: z.enum(budgetRanges).optional(),
    preferredLanguages: z.array(z.string().min(2).max(40).trim()).max(8).default([]),
  }),
}).refine((payload) => payload.body.careerDomains.length > 0 || payload.body.interestedDomains.length > 0, {
  message: 'Select at least one career domain',
  path: ['body', 'careerDomains'],
}).refine((payload) => payload.body.careerGoals.length > 0 || Boolean(payload.body.primaryGoal), {
  message: 'Select at least one career goal',
  path: ['body', 'careerGoals'],
});

export type SubmitOnboardingInput = z.infer<typeof submitOnboardingSchema>['body'];
