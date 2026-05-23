import { eventEmitter } from '../../utils/eventEmitter';
import { userRepository } from '../users/user.repository';
import { onboardingRepository } from './onboarding.repository';
import { buildPersonalizationCopy, scoreReason } from './onboarding.dto';
import { SubmitOnboardingInput } from './onboarding.validation';

const fallbackDomainRoadmaps: Record<string, string[]> = {
  'AI/ML': ['Python foundations', 'Machine learning basics', 'ML portfolio projects'],
  Backend: ['Node.js APIs', 'Database design', 'Authentication and deployment'],
  Frontend: ['React foundations', 'TypeScript UI systems', 'Frontend portfolio projects'],
  DevOps: ['Linux basics', 'Cloud deployment', 'CI/CD fundamentals'],
  DSA: ['Data structures basics', 'Problem solving patterns', 'Interview practice'],
};

export const onboardingService = {
  async submit(userId: string, input: SubmitOnboardingInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const updated = await onboardingRepository.saveUserOnboarding(userId, input);
    eventEmitter.emit('ONBOARDING_COMPLETED', {
      userId,
      primaryGoal: input.primaryGoal,
      domains: input.interestedDomains,
      targetRole: input.targetRole,
    });

    const recommendations = await this.getRecommendations(userId);
    return { user: updated, recommendations };
  },

  async getRecommendations(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    if (!user.onboarding?.primaryGoal || !user.onboarding?.experienceLevel || !user.onboarding?.targetRole) {
      return {
        onboardingCompleted: false,
        personalization: buildPersonalizationCopy(null),
        roadmaps: [],
        mentors: [],
        posts: [],
        quickActions: [
          { label: 'Complete onboarding', href: '/onboarding', priority: 1 },
        ],
      };
    }

    const preferences = user.onboarding as SubmitOnboardingInput;
    const [roadmaps, mentors, posts] = await Promise.all([
      onboardingRepository.findRecommendedRoadmaps(preferences, 3),
      onboardingRepository.findRecommendedMentors(preferences, 3),
      onboardingRepository.findRecommendedPosts(preferences, 4),
    ]);

    const fallbackRoadmaps = roadmaps.length > 0 ? [] : this.buildFallbackRoadmaps(preferences);

    return {
      onboardingCompleted: user.onboardingCompleted,
      personalization: buildPersonalizationCopy(preferences),
      preferences,
      roadmaps: roadmaps.map((roadmap) => ({
        item: roadmap,
        score: 80,
        reason: scoreReason('roadmap', preferences),
      })),
      fallbackRoadmaps,
      mentors: mentors.map((mentor) => ({
        item: mentor,
        score: 75,
        reason: scoreReason('mentor', preferences),
      })),
      posts: posts.map((post) => ({
        item: post,
        score: 65,
        reason: scoreReason('post', preferences),
      })),
      quickActions: this.buildQuickActions(preferences),
    };
  },

  buildFallbackRoadmaps(preferences: SubmitOnboardingInput) {
    const domain = preferences.interestedDomains[0];
    return (fallbackDomainRoadmaps[domain] || [`${preferences.targetRole} fundamentals`, 'Portfolio project path', 'Interview readiness path']).slice(0, 3).map((title, index) => ({
      title,
      domain,
      difficulty: preferences.experienceLevel,
      reason: `Suggested from your ${domain} interest while matching catalog content is still growing.`,
      priority: index + 1,
    }));
  },

  buildQuickActions(preferences: SubmitOnboardingInput) {
    const actions = [
      { label: 'Explore matched roadmaps', href: `/explore?domain=${encodeURIComponent(preferences.interestedDomains[0])}`, priority: 1 },
      { label: 'Find matched mentors', href: `/explore?tab=guides&domain=${encodeURIComponent(preferences.interestedDomains[0])}`, priority: 2 },
      { label: 'Ask the community', href: '/forum', priority: 3 },
    ];

    if (preferences.primaryGoal === 'become_a_mentor') {
      actions.unshift({ label: 'Apply to become a mentor', href: '/mentor/apply', priority: 0 });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  },
};
