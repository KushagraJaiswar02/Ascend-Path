import { CareerRoadmap, ICareerRoadmap, RoadmapSection, IRoadmapSection, RoadmapStep, IRoadmapStep } from './roadmap.model';
import { UserProgress, IUserProgress } from './userProgress.model';
import mongoose from 'mongoose';

export const roadmapRepository = {
  // --- Roadmap Operations ---
  async createRoadmap(data: Partial<ICareerRoadmap>): Promise<ICareerRoadmap> {
    const roadmap = new CareerRoadmap(data);
    return await roadmap.save();
  },

  async getRoadmaps(filters: any, sortBy: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    
    let sortObj: any = { enrollmentCount: -1, createdAt: -1 };
    if (sortBy === 'averageRating') {
      sortObj = { averageRating: -1, enrollmentCount: -1 };
    } else if (sortBy === 'newest') {
      sortObj = { createdAt: -1 };
    }

    const roadmaps = await CareerRoadmap.find(filters)
      .populate('createdBy', 'name role respectPoints avatar')
      .skip(skip)
      .limit(limit)
      .sort(sortObj);
      
    const total = await CareerRoadmap.countDocuments(filters);
    
    return {
      roadmaps,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRoadmaps: total,
    };
  },

  async getRoadmapById(id: string): Promise<ICareerRoadmap | null> {
    return await CareerRoadmap.findOne({ _id: id, moderationStatus: { $nin: ['deleted', 'hidden'] } }).populate('createdBy', 'name role respectPoints bio avatar');
  },

  async getRoadmapBySlug(slug: string): Promise<ICareerRoadmap | null> {
    return await CareerRoadmap.findOne({ slug, moderationStatus: { $nin: ['deleted', 'hidden'] } }).populate('createdBy', 'name role respectPoints bio avatar');
  },

  async updateRoadmap(id: string, updateData: Partial<ICareerRoadmap>): Promise<ICareerRoadmap | null> {
    return await CareerRoadmap.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  async deleteRoadmap(id: string): Promise<void> {
    await CareerRoadmap.findByIdAndDelete(id);
    // Cascade delete sections and steps
    await RoadmapSection.deleteMany({ roadmapId: id });
    await RoadmapStep.deleteMany({ roadmapId: id });
    await UserProgress.deleteMany({ roadmapId: id });
  },

  // --- Curriculum Hierarchy Retrieval ---
  async findFullRoadmapTree(idOrSlug: string) {
    const query: any = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug, moderationStatus: { $nin: ['deleted', 'hidden'] } }
      : { slug: idOrSlug, moderationStatus: { $nin: ['deleted', 'hidden'] } };

    const roadmap = await CareerRoadmap.findOne(query).populate('createdBy', 'name role respectPoints bio avatar');
    if (!roadmap) return null;

    const sections = await RoadmapSection.find({ roadmapId: roadmap._id }).sort({ order: 1 });
    const steps = await RoadmapStep.find({ roadmapId: roadmap._id }).sort({ order: 1 });

    return {
      ...roadmap.toObject(),
      sections: sections.map(sec => ({
        ...sec.toObject(),
        steps: steps
          .filter(step => step.sectionId.toString() === sec._id.toString())
          .map(step => step.toObject()),
      })),
    };
  },

  // --- Section Operations ---
  async createSection(data: Partial<IRoadmapSection>): Promise<IRoadmapSection> {
    const sec = new RoadmapSection(data);
    return await sec.save();
  },

  async getSectionById(id: string): Promise<IRoadmapSection | null> {
    return await RoadmapSection.findById(id);
  },

  async updateSection(id: string, data: Partial<IRoadmapSection>): Promise<IRoadmapSection | null> {
    return await RoadmapSection.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async deleteSection(id: string): Promise<void> {
    await RoadmapSection.findByIdAndDelete(id);
    await RoadmapStep.deleteMany({ sectionId: id });
  },

  // --- Step Operations ---
  async createStep(data: Partial<IRoadmapStep>): Promise<IRoadmapStep> {
    const step = new RoadmapStep(data);
    return await step.save();
  },

  async getStepById(id: string): Promise<IRoadmapStep | null> {
    return await RoadmapStep.findById(id);
  },

  async getStepsByRoadmap(roadmapId: string): Promise<IRoadmapStep[]> {
    return await RoadmapStep.find({ roadmapId }).sort({ order: 1 });
  },

  async updateStep(id: string, data: Partial<IRoadmapStep>): Promise<IRoadmapStep | null> {
    return await RoadmapStep.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  },

  async deleteStep(id: string): Promise<void> {
    await RoadmapStep.findByIdAndDelete(id);
  },

  // --- Progress / Enrollment Operations ---
  async findProgress(userId: string, roadmapId: string): Promise<IUserProgress | null> {
    return await UserProgress.findOne({ userId, roadmapId });
  },

  async getProgressById(id: string): Promise<IUserProgress | null> {
    return await UserProgress.findById(id);
  },

  async createProgress(userId: string, roadmapId: string): Promise<IUserProgress> {
    const progress = new UserProgress({
      userId,
      roadmapId,
      completedSteps: [],
      progressPercentage: 0,
      startedAt: new Date(),
      lastActiveAt: new Date(),
      streakCount: 1,
      notes: {},
      bookmarkedSteps: [],
    });
    return await progress.save();
  },

  async incrementEnrollmentCount(roadmapId: string): Promise<void> {
    await CareerRoadmap.findByIdAndUpdate(roadmapId, { $inc: { enrollmentCount: 1, followerCount: 1 } });
  },

  async updateProgressState(id: string, updateData: Partial<IUserProgress>): Promise<IUserProgress | null> {
    return await UserProgress.findByIdAndUpdate(id, updateData, { new: true });
  },

  async findUserActiveProgress(userId: string): Promise<IUserProgress[]> {
    const progress = await UserProgress.find({ userId })
      .populate({
        path: 'roadmapId',
        match: { moderationStatus: { $nin: ['deleted', 'hidden'] } },
        populate: { path: 'createdBy', select: 'name avatar' }
      })
      .sort({ lastActiveAt: -1 });

    return progress.filter((item) => item.roadmapId);
  },
};
