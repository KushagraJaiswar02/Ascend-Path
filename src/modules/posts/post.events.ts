export const PostDomainEvent = {
  ANSWER_ACCEPTED: 'ANSWER_ACCEPTED',
  POST_RESOLVED: 'POST_RESOLVED',
} as const;

export type PostDomainEvent = (typeof PostDomainEvent)[keyof typeof PostDomainEvent];
