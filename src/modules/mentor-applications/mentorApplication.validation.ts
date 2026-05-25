import { z } from 'zod';
import { MentorApplicationStatus } from './mentorApplication.model';

const urlField = z.string().url('Must be a valid URL').or(z.literal('')).optional();
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

const uploadSchema = z.object({
  url: z.string().url('Upload must include a valid asset URL'),
  provider: z.enum(['cloudinary', 's3', 'external']),
  publicId: z.string().max(300).optional(),
  mimeType: z.string().max(120).optional(),
  sizeBytes: z.number().int().min(0).max(10 * 1024 * 1024).optional(),
  originalName: z.string().max(180).optional(),
});

const availabilitySchema = z.object({
  text: z.string().min(10).max(300),
  hoursPerWeek: z.number().int().min(1).max(80).optional(),
  timezone: z.string().min(2).max(80).optional(),
  schedule: z.array(
    z.object({
      day: z.string().min(2).max(20),
      slots: z.array(z.string().min(3).max(40)).max(12),
    })
  ).max(14).default([]),
});

const applicationBody = z.object({
  bio: z.string().min(80).max(2000),
  domains: z.array(z.string().min(2).max(80)).min(1).max(12),
  careerDomains: z.array(objectId).max(12).default([]),
  mentorshipFocus: z.array(objectId).max(12).default([]),
  skills: z.array(z.string().min(2).max(80)).min(3).max(40),
  specializations: z.array(z.string().min(2).max(120)).max(30).default([]),
  industries: z.array(z.string().min(2).max(120)).max(20).default([]),
  languages: z.array(z.string().min(2).max(40)).max(12).default([]),
  experienceYears: z.number().int().min(0).max(60),
  currentRole: z.string().max(120).optional(),
  company: z.string().max(120).optional(),
  linkedinUrl: urlField,
  githubUrl: urlField,
  portfolioUrl: urlField,
  resumeUrl: urlField,
  uploads: z.object({
    resume: uploadSchema.optional(),
    certifications: z.array(uploadSchema).max(10).default([]),
    portfolioAssets: z.array(uploadSchema).max(10).default([]),
  }).optional(),
  motivation: z.string().min(80).max(2000),
  expertiseSummary: z.string().min(80).max(1600),
  educationBackground: z.string().max(600).optional(),
  certifications: z.array(z.string().min(2).max(160)).max(30).default([]),
  examExpertise: z.array(z.string().min(2).max(120)).max(30).default([]),
  availability: availabilitySchema,
});

export const createMentorApplicationSchema = z.object({
  body: applicationBody,
});

export const updateMyMentorApplicationSchema = z.object({
  body: applicationBody.partial(),
});

export const listMentorApplicationsSchema = z.object({
  query: z.object({
    status: z.nativeEnum(MentorApplicationStatus).optional(),
    search: z.string().optional(),
    page: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1)).default(1),
    limit: z.preprocess((val) => (val ? Number(val) : undefined), z.number().int().min(1).max(100)).default(20),
  }),
});

export const reviewMentorApplicationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.nativeEnum(MentorApplicationStatus),
    rejectionReason: z.string().max(1200).optional(),
    changeRequest: z.string().max(1200).optional(),
    internalNotes: z.string().max(3000).optional(),
  }),
});

export const uploadIntentSchema = z.object({
  body: z.object({
    assetType: z.enum(['resume', 'certification', 'portfolio_asset']),
    fileName: z.string().min(1).max(180),
    mimeType: z.enum([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/webp',
    ]),
    sizeBytes: z.number().int().min(1).max(10 * 1024 * 1024),
  }),
});

export type CreateMentorApplicationInput = z.infer<typeof createMentorApplicationSchema>['body'];
export type UpdateMentorApplicationInput = z.infer<typeof updateMyMentorApplicationSchema>['body'];
export type ListMentorApplicationsInput = z.infer<typeof listMentorApplicationsSchema>['query'];
export type ReviewMentorApplicationInput = z.infer<typeof reviewMentorApplicationSchema>['body'];
export type UploadIntentInput = z.infer<typeof uploadIntentSchema>['body'];
