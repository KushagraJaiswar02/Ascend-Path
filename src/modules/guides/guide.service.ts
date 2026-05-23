import { guideRepository } from './guide.repository';
import { sanitizePublicGuide } from './guide.dto';
import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { GetGuidesQueryInput, UpdateGuideProfileInput } from './guide.validation';
import { fameService } from '../users/fame.service';

export const guideService = {
  /**
   * Lists public guides, parsing query parameters and applying security sanitization.
   */
  async listPublicGuides(query: GetGuidesQueryInput) {
    const {
      search,
      domains,
      skills,
      minRating,
      minFameScore,
      minSessions,
      isBeginnerFriendly,
      isTopRated,
      isMostActive,
      availability,
      page,
      limit,
      sortBy
    } = query;

    // Parse comma-separated domains and skills into arrays
    const domainsArray = domains ? domains.split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const skillsArray = skills ? skills.split(',').map(s => s.trim()).filter(Boolean) : undefined;

    const result = await guideRepository.findPublicGuides(
      {
        search,
        domains: domainsArray,
        skills: skillsArray,
        minRating,
        minFameScore,
        minSessions,
        isBeginnerFriendly,
        isTopRated,
        isMostActive,
        availability
      },
      sortBy,
      page,
      limit
    );

    const sanitizedGuides = result.guides.map(sanitizePublicGuide);

    return {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      guides: sanitizedGuides,
    };
  },

  /**
   * Compiles the public identity profile for a Guide by joining stats, reviews, and roadmaps.
   */
  async getPublicGuideProfile(id: string) {
    const guide = await guideRepository.findPublicGuideById(id);
    if (!guide) {
      throw { statusCode: 404, message: 'Guide profile not found or is private' };
    }

    // Load recent reviews, roadmaps, and booking slots concurrently
    const [reviews, roadmaps, openSessions] = await Promise.all([
      guideRepository.getGuideReviews(id),
      guideRepository.getGuideRoadmaps(id),
      guideRepository.getGuideOpenSessions(id),
    ]);

    const sanitizedGuide = sanitizePublicGuide(guide);

    return {
      guide: sanitizedGuide,
      reviews,
      roadmaps,
      openSessions,
      roadmapCount: roadmaps.length,
    };
  },

  /**
   * Securely updates the authenticated Guide's own profile settings.
   */
  async updateGuideProfile(userId: string, data: UpdateGuideProfileInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    if (user.role !== Role.GUIDE) {
      throw { statusCode: 403, message: 'Only accounts registered as Guides can update guide profiles' };
    }

    // Build update object
    const updateData: any = {};
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.domains !== undefined) updateData.domains = data.domains;
    if (data.skills !== undefined) updateData.skills = data.skills;
    if (data.interests !== undefined) updateData.interests = data.interests;
    if (data.profileVisibility !== undefined) updateData.profileVisibility = data.profileVisibility;
    if (data.onboardingCompleted !== undefined) updateData.onboardingCompleted = data.onboardingCompleted;

    if (data.socialLinks !== undefined) {
      updateData.socialLinks = {
        ...user.socialLinks,
        ...data.socialLinks,
      };
    }

    if (data.availability !== undefined) {
      updateData.availability = {
        ...user.availability,
        ...data.availability,
      };
    }

    const updatedUser = await userRepository.updateUser(userId, updateData);
    if (!updatedUser) {
      throw { statusCode: 500, message: 'Failed to update guide profile' };
    }

    // Refresh Fame Score in case skills or availability changed
    await fameService.updateFameScore(userId).catch(console.error);

    return sanitizePublicGuide(updatedUser);
  },
};
