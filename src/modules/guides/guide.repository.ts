import { User, Role } from '../users/user.model';
import { Session, SessionStatus } from '../sessions/session.model';
import { CareerRoadmap } from '../roadmaps/roadmap.model';
import mongoose from 'mongoose';

export const guideRepository = {
  /**
   * Fetches paginated guides matching filters and text search criteria.
   */
  async findPublicGuides(filters: {
    search?: string;
    domains?: string[];
    skills?: string[];
    minRating?: number;
    minFameScore?: number;
    minSessions?: number;
    isBeginnerFriendly?: boolean;
    isTopRated?: boolean;
    isMostActive?: boolean;
    availability?: string;
  }, sortBy: 'fameScore' | 'averageRating' | 'totalSessions' | 'newest' | 'mostActive', page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    // Core query for visible, unbanned guides
    const query: any = {
      role: Role.GUIDE,
      profileVisibility: true,
      isBanned: false,
    };

    // Text search (fuzzy search across name, bio, domains, skills)
    if (filters.search) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { bio: { $regex: searchRegex } },
        { domains: { $regex: searchRegex } },
        { 'skills.name': { $regex: searchRegex } },
      ];
    }

    // Domain filtering (match any specified domains)
    if (filters.domains && filters.domains.length > 0) {
      query.domains = {
        $in: filters.domains.map(d => new RegExp(`^${d.trim()}$`, 'i')),
      };
    }

    // Skill filtering (match any specified skills)
    if (filters.skills && filters.skills.length > 0) {
      query['skills.name'] = {
        $in: filters.skills.map(s => new RegExp(`^${s.trim()}$`, 'i')),
      };
    }

    // Rating filtering
    if (filters.minRating) {
      query.averageRating = { $gte: filters.minRating };
    }

    // Fame Score filtering
    if (filters.minFameScore !== undefined) {
      query.fameScore = { $gte: filters.minFameScore };
    }

    // Completed Sessions filtering
    if (filters.minSessions !== undefined) {
      query.totalSessions = { $gte: filters.minSessions };
    }

    // Beginner Friendly (regex on bio or skills levels)
    if (filters.isBeginnerFriendly) {
      query.$or = [
        { bio: { $regex: /beginner|basic|junior|start|intro/i } },
        { 'skills.level': { $regex: /beginner|junior/i } },
      ];
    }

    // Top Rated (avgRating >= 4.5)
    if (filters.isTopRated) {
      query.averageRating = { $gte: 4.5 };
    }

    // Most Active (completedSessions >= 10)
    if (filters.isMostActive) {
      query.totalSessions = { $gte: 10 };
    }

    // Availability Day of the week
    if (filters.availability) {
      query['availability.schedule.day'] = { $regex: new RegExp(`^${filters.availability.trim()}$`, 'i') };
    }

    // Sorting strategies
    let sortObj: any = { fameScore: -1, respectPoints: -1 };
    if (sortBy === 'averageRating') {
      sortObj = { averageRating: -1, fameScore: -1 };
    } else if (sortBy === 'totalSessions') {
      sortObj = { totalSessions: -1, fameScore: -1 };
    } else if (sortBy === 'newest') {
      sortObj = { createdAt: -1 };
    } else if (sortBy === 'mostActive') {
      sortObj = { totalSessions: -1, averageRating: -1 };
    }

    const guides = await User.find(query)
      .select('-passwordHash')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    return {
      guides,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  },

  /**
   * Fetches a single public guide by ID.
   */
  async findPublicGuideById(id: string) {
    return await User.findOne({
      _id: id,
      role: Role.GUIDE,
      profileVisibility: true,
      isBanned: false,
    }).select('-passwordHash');
  },

  /**
   * Aggregates recent reviews (completed sessions with ratings) for a guide.
   */
  async getGuideReviews(guideId: string, limit = 5) {
    return await Session.find({
      guideId: new mongoose.Types.ObjectId(guideId),
      status: SessionStatus.COMPLETED,
      rating: { $exists: true },
    })
      .populate('clientId', 'name avatar respectPoints')
      .sort({ updatedAt: -1 })
      .limit(limit);
  },

  /**
   * Fetches all public roadmaps created by a guide.
   */
  async getGuideRoadmaps(guideId: string) {
    return await CareerRoadmap.find({
      createdBy: new mongoose.Types.ObjectId(guideId),
      isPublic: true,
    })
      .sort({ followerCount: -1, createdAt: -1 });
  },

  /**
   * Fetches all active open session slots for a guide.
   */
  async getGuideOpenSessions(guideId: string) {
    return await Session.find({
      guideId: new mongoose.Types.ObjectId(guideId),
      status: SessionStatus.OPEN,
      scheduledAt: { $gt: new Date() },
    })
      .sort({ scheduledAt: 1 });
  },
};
