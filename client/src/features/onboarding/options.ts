import type { PrimaryGoal } from './types';

export const goalLabels: Record<PrimaryGoal, string> = {
  land_first_job: 'Land first job',
  switch_domains: 'Switch domains',
  improve_current_skills: 'Improve current skills',
  prepare_for_interviews: 'Prepare for interviews',
  find_mentor_guidance: 'Find mentor guidance',
  build_projects: 'Build projects',
  become_a_mentor: 'Become a mentor',
};

export const goalOptions = Object.keys(goalLabels) as PrimaryGoal[];

export const onboardingDomains = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'AI/ML', 'Cybersecurity', 'Mobile', 'DSA', 'System Design', 'Cloud'];
