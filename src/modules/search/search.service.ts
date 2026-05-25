import { User, Role } from '../users/user.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import { Post } from '../posts/post.model';
import { Session, SessionStatus } from '../sessions/session.model';
import { userRepository } from '../users/user.repository';
import { taxonomyService } from '../taxonomy/taxonomy.service';
import mongoose from 'mongoose';

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
      const resolved = mongoose.Types.ObjectId.isValid(filters.domain)
        ? { id: filters.domain }
        : await taxonomyService.resolveDomain(filters.domain);
      const regex = new RegExp(filters.domain, 'i');
      query.$and.push({
        $or: [
          ...(resolved?.id ? [{ careerDomains: new mongoose.Types.ObjectId(resolved.id) }] : []),
          { domains: { $regex: regex } },
          { 'skills.name': { $regex: regex } },
        ],
      });
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
    } else if (preferences?.careerDomains?.length && !filters.domain) {
      filters.domain = preferences.careerDomains[0].toString();
    }
    return await this.searchGuides(q, filters, sort, page, limit);
  },

  async searchRoadmaps(q: string, filters: any, sort: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const query: any = { isPublic: true, moderationStatus: { $nin: ['deleted', 'hidden'] } };

    // Text search
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    // Filters
    if (filters.domain) {
      const resolved = mongoose.Types.ObjectId.isValid(filters.domain)
        ? { id: filters.domain }
        : await taxonomyService.resolveDomain(filters.domain);
      const regex = new RegExp(filters.domain, 'i');
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            ...(resolved?.id ? [{ careerDomains: new mongoose.Types.ObjectId(resolved.id) }] : []),
            { domains: { $regex: regex } },
            { domain: { $regex: regex } },
          ],
        },
      ];
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
    const query: any = { moderationStatus: { $nin: ['deleted', 'hidden'] } };

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

    if (filters.isSolved || filters.resolution) {
      const resolution = filters.resolution || (filters.isSolved === 'true' ? 'resolved' : 'unresolved');
      if (resolution === 'resolved') {
        query.$and = [...(query.$and || []), { $or: [{ isResolved: true }, { isSolved: true }] }];
      }
      if (resolution === 'unresolved') {
        query.$and = [
          ...(query.$and || []),
          { $or: [{ isResolved: false }, { isResolved: { $exists: false } }] },
          { isSolved: { $ne: true } },
        ];
      }
    }

    // Sorting
    let sortObj: any = { isResolved: -1, isSolved: -1, upvotes: -1, createdAt: -1 };
    if (sort === 'popular' || sort === 'highest_rated') sortObj = { upvotes: -1 };
    if (sort === 'recent') sortObj = { createdAt: -1 };
    if (sort === 'resolved') sortObj = { isResolved: -1, resolvedAt: -1, upvotes: -1 };

    const posts = await Post.find(query)
      .populate('authorId', 'name role respectPoints')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    return { total, page, data: posts };
  },
};
