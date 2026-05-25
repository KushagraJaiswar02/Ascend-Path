import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');
const optionalObjectId = objectId.optional();
const attachmentSchema = z.object({
  label: z.string().min(1).max(120).trim(),
  url: z.string().url().max(1000),
  type: z.string().max(80).trim().optional(),
});

export const createConversationSchema = z.object({
  body: z.object({
    mentorId: objectId,
    message: z.string().min(2).max(4000).trim(),
    startedFrom: z.enum(['roadmap', 'opportunity', 'mentor-profile', 'dashboard', 'domain-page', 'ping']).default('mentor-profile'),
    linkedRoadmapId: optionalObjectId,
    linkedOpportunityId: optionalObjectId,
    linkedDomainId: optionalObjectId,
  }),
});

export const sendMessageSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    messageType: z.enum(['text', 'resource', 'roadmap', 'opportunity', 'session-request']).default('text'),
    content: z.string().min(1).max(4000).trim(),
    attachments: z.array(attachmentSchema).max(6).default([]),
    linkedRoadmapId: optionalObjectId,
    linkedOpportunityId: optionalObjectId,
  }),
});

export const conversationParamsSchema = z.object({
  params: z.object({ id: objectId }),
});

export const escalationSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    topic: z.string().min(2).max(160).trim(),
    objective: z.string().min(10).max(1200).trim(),
    roadmapArea: z.string().max(160).trim().optional(),
    urgency: z.enum(['low', 'normal', 'high']).default('normal'),
    preferredSlots: z.array(z.string().min(2).max(120).trim()).max(5).default([]),
    expectedHelpType: z.enum(['code_review', 'mock_interview', 'roadmap_clarification', 'portfolio_review', 'career_confusion', 'debugging_help', 'other']).default('roadmap_clarification'),
  }),
});

export const escalationResponseSchema = z.object({
  params: z.object({ id: objectId, requestId: objectId }),
  body: z.object({
    action: z.enum(['accept', 'decline', 'alternate', 'async', 'workshop']),
    mentorResponse: z.string().max(1200).trim().optional(),
    proposedSlots: z.array(z.string().min(2).max(120).trim()).max(5).default([]),
    scheduledAt: z.string().datetime().optional(),
    durationMinutes: z.number().int().min(15).max(180).default(45),
  }),
});

export const pinAdviceSchema = z.object({
  params: z.object({ id: objectId }),
  body: z.object({
    advice: z.string().min(2).max(2000).trim(),
  }),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>['body'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
export type EscalationInput = z.infer<typeof escalationSchema>['body'];
export type EscalationResponseInput = z.infer<typeof escalationResponseSchema>['body'];
