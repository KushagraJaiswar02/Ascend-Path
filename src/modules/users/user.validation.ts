import { z } from 'zod';
import { EducationLevel } from './user.model';

const skillItemSchema = z.union([
  z.string(),
  z.object({
    name: z.string().min(1),
    level: z.string().optional(),
    years: z.number().optional(),
  })
]);

export const registerUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim(),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    educationLevel: z.nativeEnum(EducationLevel).optional(),
    bio: z.string().optional(),
    domains: z.array(z.string()).optional(),
    skills: z.array(skillItemSchema).optional(),
    interests: z.array(z.string()).optional(),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').trim().optional(),
    educationLevel: z.nativeEnum(EducationLevel).optional(),
    bio: z.string().optional(),
    domains: z.array(z.string()).optional(),
    skills: z.array(skillItemSchema).optional(),
    interests: z.array(z.string()).optional(),
    avatar: z.string().url('Invalid URL format for avatar').optional(),
    pingAvailable: z.boolean().optional(),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
