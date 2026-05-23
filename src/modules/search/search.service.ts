import { User, Role } from '../users/user.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { Post } from '../posts/post.model';
import { Session, SessionStatus } from '../sessions/session.model';
import { userRepository } from '../users/user.repository';

export const searchService = {
  async searchGuides(q: string, filters: any, sort: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query: any = {
      $and: [{
        $or: [
          { role: Role.GUIDE },
          { roles: Role.GUIDE },
          { capabilities: 'discover:listed' },
        ],
      }],
      mentorProfileStatus: 'approved',
      profileVisibility: true,
      isBanned: false,
    };

    // Text search
    if (q) {
      query.$and.push({ $or: [
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
      ]});
    }

    // Filters
    if (filters.domain) {
      // Assuming 'skills' array acts as the domain for a user
      query.skills = { $regex: new RegExp(filters.domain, 'i') };
    }

    if (filters.minFameScore) {
      query.fameScore = { $gte: Number(filters.minFameScore) };
    }

    // Free sessions filter
    if (filters.isFree === 'true') {
      const freeSessions = await Session.find({ price: 0, status: SessionStatus.OPEN }).select('guideId');
      const freeGuideIds = freeSessions.map(s => s.guideId);
      query._id = { $in: freeGuideIds };
    }

    // Sorting
    let sortObj: any = { fameScore: -1 }; // Default: highest fame
    if (sort === 'recent') sortObj = { createdAt: -1 };

    const guides = await User.find(query)
      .select('-passwordHash')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return { total, page, data: guides };
  },

  async searchGuidesForUser(userId: string, q: string, filters: any, sort: string, page: number, limit: number) {
    const user = await userRepository.findUserById(userId);
    const preferences = user?.onboarding;
    if (preferences?.interestedDomains?.length && !filters.domain) {
      filters.domain = preferences.interestedDomains[0];
    }
    return await this.searchGuides(q, filters, sort, page, limit);
  },

  async searchRoadmaps(q: string, filters: any, sort: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query: any = { isPublic: true };

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    // Filters
    if (filters.domain) {
      query.domain = { $regex: new RegExp(filters.domain, 'i') };
    }

    if (filters.maxEstimatedWeeks) {
      query.estimatedWeeks = { $lte: Number(filters.maxEstimatedWeeks) };
    }

    // Sorting
    let sortObj: any = { followerCount: -1 }; // Default: most popular
    if (sort === 'recent') sortObj = { createdAt: -1 };

    const roadmaps = await CareerRoadmap.find(query)
      .populate('createdBy', 'name role respectPoints')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await CareerRoadmap.countDocuments(query);

    return { total, page, data: roadmaps };
  },

  async searchPosts(q: string, filters: any, sort: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }

    // Filters
    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.tags) {
      const tagsArray = Array.isArray(filters.tags) ? filters.tags : filters.tags.split(',');
      query.tags = { $in: tagsArray };
    }

    if (filters.isSolved) {
      query.isSolved = filters.isSolved === 'true';
    }

    // Sorting
    let sortObj: any = { createdAt: -1 }; // Default: most recent
    if (sort === 'popular' || sort === 'highest_rated') sortObj = { upvotes: -1 };

    const posts = await Post.find(query)
      .populate('authorId', 'name role respectPoints')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    return { total, page, data: posts };
  },
};
