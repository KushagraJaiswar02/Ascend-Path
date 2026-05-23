import { ISessionReflection } from './sessionReflection.model';

export const toSessionReflectionDTO = (reflection: ISessionReflection | any) => {
  const source = typeof reflection.toObject === 'function' ? reflection.toObject() : reflection;
  return {
    ...source,
    analyticsSignals: {
      hasMenteeReflection: !!source.menteeReflection?.submittedAt,
      hasMentorFollowup: !!source.mentorFollowup?.submittedAt,
      recommendedRoadmapStepCount: source.mentorFollowup?.recommendedRoadmapSteps?.length || 0,
      recommendedResourceCount: source.mentorFollowup?.recommendedResources?.length || 0,
      recommendedProjectCount: source.mentorFollowup?.recommendedProjects?.length || 0,
    },
  };
};
