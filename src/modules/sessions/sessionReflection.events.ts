export const SessionReflectionEvent = {
  SESSION_REFLECTION_REQUESTED: 'SESSION_REFLECTION_REQUESTED',
  SESSION_REFLECTION_SUBMITTED: 'SESSION_REFLECTION_SUBMITTED',
  MENTOR_FOLLOWUP_ADDED: 'MENTOR_FOLLOWUP_ADDED',
} as const;

export type SessionReflectionEvent = (typeof SessionReflectionEvent)[keyof typeof SessionReflectionEvent];
