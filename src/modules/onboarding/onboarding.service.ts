import { eventEmitter } from '../../utils/eventEmitter';
import { userRepository } from '../users/user.repository';
import { onboardingRepository } from './onboarding.repository';
import { buildPersonalizationCopy, scoreReason } from './onboarding.dto';
import { SubmitOnboardingInput } from './onboarding.validation';
import { taxonomyService } from '../taxonomy/taxonomy.service';
import { recommendationEngineService } from '../recommendations/recommendationEngine.service';

const fallbackClusterRoadmaps = [
  'Foundation and orientation path',
  'Mentor-guided next steps',
  'Portfolio, exam, or application readiness',
];

export const onboardingService = {
  async submit(userId: string, input: SubmitOnboardingInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const domainIds = input.careerDomains.length
      ? input.careerDomains
      : await taxonomyService.normalizeDomainIds(input.interestedDomains);
    const normalized = {
      careerDomains: await taxonomyService.assertActiveDomains(domainIds),
      careerGoals: await taxonomyService.assertActiveGoals(input.careerGoals),
    };

    const updated = await onboardingRepository.saveUserOnboarding(userId, input, normalized);
    eventEmitter.emit('ONBOARDING_COMPLETED', {
      userId,
      primaryGoal: input.primaryGoal,
      careerStage: input.careerStage,
      domains: input.interestedDomains,
      careerDomains: domainIds,
      targetRole: input.targetRole,
    });

    const recommendations = await recommendationEngineService.getRecommendations(userId, 'onboarding', 4, true);
    return { user: updated, recommendations };
  },

  async getRecommendations(userId: string) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };
    if (!user.onboarding?.careerStage || (!user.onboarding?.careerDomains?.length && !user.onboarding?.interestedDomains?.length)) {
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

    const preferences = user.onboarding as unknown as SubmitOnboardingInput;
    const contextual = await recommendationEngineService.getRecommendations(userId, 'dashboard', 4);
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
      contextual,
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
    const target = preferences.targetRole || preferences.careerStage || 'career';
    return ([`${target} fundamentals`, ...fallbackClusterRoadmaps]).slice(0, 3).map((title, index) => ({
      title,
      domain: domain || 'Career exploration',
      difficulty: preferences.experienceLevel || 'beginner',
      reason: `Suggested from your ${domain || 'career'} interest while matching catalog content is still growing.`,
      priority: index + 1,
    }));
  },

  buildQuickActions(preferences: SubmitOnboardingInput) {
    const actions = [
      { label: 'Explore matched roadmaps', href: `/explore?domain=${encodeURIComponent(preferences.interestedDomains?.[0] || '')}`, priority: 1 },
      { label: 'Find matched mentors', href: `/explore?tab=guides&domain=${encodeURIComponent(preferences.interestedDomains?.[0] || '')}`, priority: 2 },
      { label: 'Ask the community', href: '/forum', priority: 3 },
    ];

    if (preferences.primaryGoal === 'become_a_mentor') {
      actions.unshift({ label: 'Apply to become a mentor', href: '/mentor/apply', priority: 0 });
    }

    return actions.sort((a, b) => a.priority - b.priority);
  },
};
