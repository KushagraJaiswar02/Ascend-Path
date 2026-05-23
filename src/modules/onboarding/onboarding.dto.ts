const goalLabels: Record<string, string> = {
  land_first_job: 'land your first job',
  switch_domains: 'switch domains',
  improve_current_skills: 'improve your current skills',
  prepare_for_interviews: 'prepare for interviews',
  find_mentor_guidance: 'find mentor guidance',
  build_projects: 'build stronger projects',
  become_a_mentor: 'become a mentor',
};

export const buildPersonalizationCopy = (onboarding: any) => {
  const role = onboarding?.targetRole || 'your career goal';
  const domain = onboarding?.interestedDomains?.[0] || 'career growth';
  const goal = goalLabels[onboarding?.primaryGoal] || 'move forward';
  return {
    headline: `Continue your ${role} journey`,
    subheading: `Recommended ${domain} roadmaps, mentors, and discussions to help you ${goal}.`,
    primaryAction: onboarding?.primaryGoal === 'find_mentor_guidance' ? 'Book a mentor session' : 'Start a roadmap',
  };
};

export const scoreReason = (kind: 'roadmap' | 'mentor' | 'post', onboarding: any) => {
  const domain = onboarding?.interestedDomains?.[0];
  if (kind === 'mentor') return domain ? `Strong match for ${domain} and your ${onboarding.experienceLevel} level.` : 'Recommended from mentor reputation signals.';
  if (kind === 'post') return domain ? `Useful discussion for ${domain} learners.` : 'Popular beginner-friendly community thread.';
  return domain ? `Aligned with ${domain}, ${onboarding.targetRole}, and your weekly commitment.` : 'Ranked by fit and learner momentum.';
};
