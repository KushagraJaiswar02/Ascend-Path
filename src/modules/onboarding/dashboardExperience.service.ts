import { userRepository } from '../users/user.repository';

type FeatureKey =
  | 'starter_roadmap'
  | 'starter_mentor'
  | 'first_session'
  | 'simple_opportunity'
  | 'growth_insight'
  | 'momentum'
  | 'pathway_visualization'
  | 'mentor_continuity'
  | 'opportunity_readiness'
  | 'advanced_recommendations'
  | 'specialization_branching'
  | 'opportunity_tracking'
  | 'portfolio_guidance'
  | 'professional_identity'
  | 'application_analytics'
  | 'advanced_mentorship';

const starterFeatures: FeatureKey[] = [
  'starter_roadmap',
  'starter_mentor',
  'first_session',
  'simple_opportunity',
  'growth_insight',
];

const confidenceWeight: Record<string, number> = {
  unsure: 0,
  exploring: 1,
  somewhat_clear: 2,
  highly_focused: 3,
};

export const dashboardExperienceService = {
  async getForUser(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const onboarding = (user.onboarding || {}) as NonNullable<typeof user.onboarding>;
    const progressSignals = {
      onboardingCompleted: Boolean(user.onboardingCompleted),
      confidence: onboarding.directionClarity || 'exploring',
      hasCareerDomains: Boolean(onboarding.careerDomains?.length || onboarding.interestedDomains?.length),
      hasCareerGoals: Boolean(onboarding.careerGoals?.length || onboarding.primaryGoal),
      hasMentorActivity: user.totalSessions > 0,
      engagementScore: Math.min(3, Math.floor((user.respectPoints || 0) / 25) + Math.floor((user.totalSessions || 0) / 2)),
    };

    if (!progressSignals.onboardingCompleted) {
      return {
        onboardingRequired: true,
        personalizationReady: false,
        level: 0,
        label: 'Onboarding',
        mode: 'onboarding',
        exposedFeatures: [],
        hiddenFeatures: this.hiddenExcept([]),
        reasoning: [
          'Learner onboarding is incomplete, so the platform should gather direction before showing ecosystem systems.',
        ],
        progressSignals,
      };
    }

    const score =
      1 +
      (progressSignals.hasCareerDomains ? 1 : 0) +
      (progressSignals.hasCareerGoals ? 1 : 0) +
      confidenceWeight[progressSignals.confidence] +
      (progressSignals.hasMentorActivity ? 2 : 0) +
      progressSignals.engagementScore;

    const level = score >= 9 ? 4 : score >= 7 ? 3 : score >= 5 ? 2 : 1;
    const exposedFeatures = this.featuresForLevel(level);

    return {
      onboardingRequired: false,
      personalizationReady: true,
      level,
      label: this.labelForLevel(level),
      mode: level === 1 ? 'starter' : level === 2 ? 'active_learner' : level === 3 ? 'advanced_explorer' : 'career_builder',
      exposedFeatures,
      hiddenFeatures: this.hiddenExcept(exposedFeatures),
      reasoning: this.reasoningForLevel(level, progressSignals.confidence),
      progressSignals,
    };
  },

  featuresForLevel(level: number): FeatureKey[] {
    if (level <= 1) return starterFeatures;
    if (level === 2) return [...starterFeatures, 'momentum', 'pathway_visualization', 'mentor_continuity', 'opportunity_readiness'];
    if (level === 3) return [...this.featuresForLevel(2), 'advanced_recommendations', 'specialization_branching', 'opportunity_tracking', 'portfolio_guidance'];
    return [...this.featuresForLevel(3), 'professional_identity', 'application_analytics', 'advanced_mentorship'];
  },

  hiddenExcept(exposed: FeatureKey[]) {
    const all: FeatureKey[] = [
      ...starterFeatures,
      'momentum',
      'pathway_visualization',
      'mentor_continuity',
      'opportunity_readiness',
      'advanced_recommendations',
      'specialization_branching',
      'opportunity_tracking',
      'portfolio_guidance',
      'professional_identity',
      'application_analytics',
      'advanced_mentorship',
    ];
    return all.filter((feature) => !exposed.includes(feature));
  },

  labelForLevel(level: number) {
    return ['Onboarding', 'Starter', 'Active Learner', 'Advanced Explorer', 'Career Builder'][level] || 'Starter';
  },

  reasoningForLevel(level: number, confidence: string) {
    if (level === 1) {
      return [
        `Direction clarity is "${confidence}", so the dashboard keeps cognitive load low.`,
        'Starter mode prioritizes one next action, one roadmap, one mentor entry point, one opportunity, and one growth insight.',
      ];
    }
    if (level === 2) return ['The learner has enough signal for momentum, pathway visualization, and mentor continuity without full ecosystem density.'];
    if (level === 3) return ['The learner is ready for branching recommendations, opportunity tracking, and portfolio guidance.'];
    return ['The learner has matured into career-building workflows with professional identity and application analytics unlocked.'];
  },
};
