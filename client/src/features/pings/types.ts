import { z } from 'zod';

export const pingUserSchema = z.object({
  _id: z.string(),
  name: z.string().catch('Deleted User'),
  avatar: z.string().optional().catch(''),
  role: z.string().optional().catch('unknown'),
});

export const pingSchema = z.object({
  _id: z.string(),
  senderId: pingUserSchema.catch({ _id: 'deleted-user', name: 'Deleted User', avatar: '', role: 'unknown' }),
  receiverId: pingUserSchema.catch({ _id: 'deleted-user', name: 'Deleted User', avatar: '', role: 'unknown' }),
  question: z.string().default('No question details provided.'),
  context: z.string().optional(),
  status: z.enum(['pending', 'answered', 'closed', 'expired']).default('pending'),
  response: z.string().optional(),
  rating: z.number().optional(),
  createdAt: z.string().default(() => new Date().toISOString()),
  expiresAt: z.string().default(() => new Date().toISOString()),
});

export type Ping = z.infer<typeof pingSchema>;
export type PingUser = z.infer<typeof pingUserSchema>;

/**
 * Defensively parses pings payload returned from the API, filling in safe fallbacks on failure.
 */
export const safeParsePings = (data: any): Ping[] => {
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    try {
      const parsed = pingSchema.safeParse(item);
      if (parsed.success) {
        return parsed.data;
      }
      // If parsing failed partially, let's build a safe minimal representation rather than throwing
      return {
        _id: item?._id || `fallback-${Math.random()}`,
        senderId: {
          _id: item?.senderId?._id || 'deleted-user',
          name: item?.senderId?.name || 'Deleted User',
          avatar: item?.senderId?.avatar || '',
          role: item?.senderId?.role || 'unknown',
        },
        receiverId: {
          _id: item?.receiverId?._id || 'deleted-user',
          name: item?.receiverId?.name || 'Deleted User',
          avatar: item?.receiverId?.avatar || '',
          role: item?.receiverId?.role || 'unknown',
        },
        question: item?.question || 'No question details provided.',
        context: item?.context || undefined,
        status: ['pending', 'answered', 'closed', 'expired'].includes(item?.status) ? item.status : 'pending',
        response: item?.response || undefined,
        rating: typeof item?.rating === 'number' ? item.rating : undefined,
        createdAt: item?.createdAt || new Date().toISOString(),
        expiresAt: item?.expiresAt || new Date().toISOString(),
      };
    } catch {
      return {
        _id: `fallback-${Math.random()}`,
        senderId: { _id: 'deleted-user', name: 'Deleted User', avatar: '', role: 'unknown' },
        receiverId: { _id: 'deleted-user', name: 'Deleted User', avatar: '', role: 'unknown' },
        question: 'Could not load this ping question details.',
        status: 'pending',
        createdAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
      };
    }
  });
};
