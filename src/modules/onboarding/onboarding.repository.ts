import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { Post, PostCategory } from '../posts/post.model';
import { Role, User } from '../users/user.model';
import { userRepository } from '../users/user.repository';
import { SubmitOnboardingInput } from './onboarding.validation';

export const onboardingRepository = {
  async saveUserOnboarding(userId: string, onboarding: SubmitOnboardingInput, normalized: { careerDomains: any[]; careerGoals: any[] }) {
    return await userRepository.updateUser(userId, {
      onboardingCompleted: true,
      careerStage: onboarding.careerStage as any,
      careerDomains: normalized.careerDomains as any,
      careerGoals: normalized.careerGoals as any,
      weeklyCommitment: onboarding.weeklyCommitment,
      budgetRange: onboarding.budgetRange,
      preferredLanguages: onboarding.preferredLanguages,
      onboarding: {
        ...(onboarding as any),
        careerDomains: normalized.careerDomains,
        careerGoals: normalized.careerGoals,
      },
    });
  },

  async findRecommendedRoadmaps(preferences: SubmitOnboardingInput, limit = 3) {
    const domainRegexes = (preferences.interestedDomains || []).map((domain) => new RegExp(domain, 'i'));
    const roleRegex = preferences.targetRole ? new RegExp(preferences.targetRole, 'i') : undefined;
    const careerDomains = preferences.careerDomains || [];
    const careerGoals = preferences.careerGoals || [];
    const query: any = {
      $and: [
        {
          $or: [
            ...(careerDomains.length ? [{ careerDomains: { $in: careerDomains } }] : []),
            ...(careerGoals.length ? [{ careerGoals: { $in: careerGoals } }] : []),
            { domains: { $in: domainRegexes } },
            { domain: { $in: domainRegexes } },
            { tags: { $in: domainRegexes } },
            ...(roleRegex ? [{ targetRole: { $regex: roleRegex } }, { title: { $regex: roleRegex } }] : []),
          ],
        },
      ],
      moderationStatus: { $ne: 'deleted' },
      $or: [
        { isPublished: true, visibility: 'public' },
        { isPublic: true },
      ],
    };

    return await CareerRoadmap.find(query)
      .populate('createdBy', 'name role avatar fameScore')
      .sort({
        averageRating: -1,
        enrollmentCount: -1,
        followerCount: -1,
        updatedAt: -1,
      })
      .limit(limit);
  },

  async findRecommendedMentors(preferences: SubmitOnboardingInput, limit = 3) {
    const domainRegexes = (preferences.interestedDomains || []).map((domain) => new RegExp(domain, 'i'));
    const careerDomains = preferences.careerDomains || [];
    return await User.find({
      $and: [
        {
          $or: [
            { role: Role.GUIDE },
            { roles: Role.GUIDE },
            { capabilities: 'discover:listed' },
          ],
        },
        {
          $or: [
            ...(careerDomains.length ? [{ careerDomains: { $in: careerDomains } }] : []),
            { domains: { $in: domainRegexes } },
            { 'skills.name': { $in: domainRegexes } },
            ...(preferences.targetRole ? [{ bio: { $regex: new RegExp(preferences.targetRole, 'i') } }] : []),
          ],
        },
      ],
      mentorProfileStatus: 'approved',
      profileVisibility: true,
      isBanned: false,
    })
      .select('-passwordHash')
      .sort({ fameScore: -1, averageRating: -1, totalSessions: -1 })
      .limit(limit);
  },

  async findRecommendedPosts(preferences: SubmitOnboardingInput, limit = 4) {
    const domainRegexes = (preferences.interestedDomains || []).map((domain) => new RegExp(domain, 'i'));
    return await Post.find({
      moderationStatus: 'visible',
      category: { $in: [PostCategory.CAREER, PostCategory.SKILLS, PostCategory.EDUCATION, PostCategory.GENERAL] },
      $or: [
        { tags: { $in: domainRegexes } },
        ...(preferences.targetRole ? [{ title: { $regex: new RegExp(preferences.targetRole, 'i') } }] : []),
        ...(preferences.experienceLevel ? [{ content: { $regex: new RegExp(preferences.experienceLevel, 'i') } }] : []),
      ],
    })
      .populate('authorId', 'name role avatar respectPoints')
      .sort({ isPinned: -1, upvotes: -1, viewCount: -1, createdAt: -1 })
      .limit(limit);
  },
};
