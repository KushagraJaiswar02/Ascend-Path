import mongoose from 'mongoose';
import { Opportunity, IOpportunity } from './opportunity.model';
import { Application, IApplication } from './application.model';

export const opportunityRepository = {
  async createOpportunity(data: any): Promise<IOpportunity> {
    return await Opportunity.create(data);
  },

  async findOpportunityById(id: string): Promise<IOpportunity | null> {
    return await Opportunity.findById(id)
      .populate('recommendedRoadmaps', 'title slug difficulty')
      .populate('careerDomains', 'name slug')
      .populate('careerGoals', 'name slug');
  },

  async findOpportunityBySlug(slug: string): Promise<IOpportunity | null> {
    return await Opportunity.findOne({ slug })
      .populate('recommendedRoadmaps', 'title slug difficulty')
      .populate('careerDomains', 'name slug')
      .populate('careerGoals', 'name slug');
  },

  async updateOpportunity(id: string, update: Partial<IOpportunity>): Promise<IOpportunity | null> {
    return await Opportunity.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  },

  async deleteOpportunity(id: string): Promise<IOpportunity | null> {
    return await Opportunity.findByIdAndDelete(id);
  },

  async listOpportunities(filters: {
    q?: string;
    opportunityType?: string;
    difficulty?: string;
    remoteStatus?: string;
    careerDomains?: string[];
    careerGoals?: string[];
    isFeatured?: boolean;
    verificationStatus?: string;
    skip: number;
    limit: number;
  }): Promise<{ opportunities: IOpportunity[]; total: number }> {
    const query: any = {};

    if (filters.q) {
      query.$text = { $search: filters.q };
    }
    if (filters.opportunityType) {
      query.opportunityType = filters.opportunityType;
    }
    if (filters.difficulty) {
      query.difficulty = filters.difficulty;
    }
    if (filters.remoteStatus) {
      query.remoteStatus = filters.remoteStatus;
    }
    if (filters.isFeatured !== undefined) {
      query.isFeatured = filters.isFeatured;
    }
    if (filters.verificationStatus) {
      query.verificationStatus = filters.verificationStatus;
    }
    if (filters.careerDomains && filters.careerDomains.length > 0) {
      query.careerDomains = { $in: filters.careerDomains.map(id => new mongoose.Types.ObjectId(id)) };
    }
    if (filters.careerGoals && filters.careerGoals.length > 0) {
      query.careerGoals = { $in: filters.careerGoals.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // Ensure we don't return expired opportunities for non-moderators by default
    // Wait, the client might query expired. Let's filter out expired if requested or keep it.
    // Let's just list according to verification status.
    const [opportunities, total] = await Promise.all([
      Opportunity.find(query)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip(filters.skip)
        .limit(filters.limit)
        .populate('careerDomains', 'name slug')
        .populate('careerGoals', 'name slug')
        .populate('recommendedRoadmaps', 'title slug'),
      Opportunity.countDocuments(query),
    ]);

    return { opportunities, total };
  },

  async listAllForAdmin(skip: number, limit: number): Promise<{ opportunities: IOpportunity[]; total: number }> {
    const [opportunities, total] = await Promise.all([
      Opportunity.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('careerDomains', 'name slug')
        .populate('careerGoals', 'name slug')
        .populate('recommendedRoadmaps', 'title slug'),
      Opportunity.countDocuments({}),
    ]);
    return { opportunities, total };
  },

  // Applications Data Access
  async createApplication(data: {
    userId: mongoose.Types.ObjectId;
    opportunityId: mongoose.Types.ObjectId;
    status?: string;
  }): Promise<IApplication> {
    return await Application.create(data as any);
  },

  async findApplicationById(id: string): Promise<IApplication | null> {
    return await Application.findById(id)
      .populate('opportunityId')
      .populate({
        path: 'connectedProjects',
        select: 'title description technologies isMentorReviewed githubLink demoLink mentorReviewNotes learningOutcomes projectReflections',
      })
      .populate({
        path: 'connectedAchievements',
        select: 'title description type category credentialId issuedAt',
      });
  },

  async findApplicationByUserAndOpportunity(userId: string, opportunityId: string): Promise<IApplication | null> {
    return await Application.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      opportunityId: new mongoose.Types.ObjectId(opportunityId),
    })
      .populate('opportunityId')
      .populate({
        path: 'connectedProjects',
        select: 'title description technologies isMentorReviewed githubLink demoLink mentorReviewNotes learningOutcomes projectReflections',
      })
      .populate({
        path: 'connectedAchievements',
        select: 'title description type category credentialId issuedAt',
      });
  },

  async listApplicationsForUser(userId: string): Promise<IApplication[]> {
    return await Application.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate({
        path: 'opportunityId',
        populate: [
          { path: 'careerDomains', select: 'name slug' },
          { path: 'recommendedRoadmaps', select: 'title slug' },
        ],
      })
      .populate({
        path: 'connectedProjects',
        select: 'title description technologies isMentorReviewed githubLink demoLink mentorReviewNotes learningOutcomes projectReflections',
      })
      .populate({
        path: 'connectedAchievements',
        select: 'title description type category credentialId issuedAt',
      })
      .sort({ updatedAt: -1 });
  },

  async updateApplication(id: string, update: any): Promise<IApplication | null> {
    return await Application.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('opportunityId')
      .populate({
        path: 'connectedProjects',
        select: 'title description technologies isMentorReviewed githubLink demoLink mentorReviewNotes learningOutcomes projectReflections',
      })
      .populate({
        path: 'connectedAchievements',
        select: 'title description type category credentialId issuedAt',
      });
  },
};
