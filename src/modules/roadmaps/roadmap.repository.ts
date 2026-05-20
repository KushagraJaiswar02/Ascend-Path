import { CareerRoadmap, ICareerRoadmap } from './roadmap.model';
import { UserProgress, IUserProgress } from './userProgress.model';

export const roadmapRepository = {
  // --- Roadmap Operations ---
  async createRoadmap(data: Partial<ICareerRoadmap>): Promise<ICareerRoadmap> {
    const roadmap = new CareerRoadmap(data);
    return await roadmap.save();
  },

  async getRoadmaps(filters: any, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;
    
    const roadmaps = await CareerRoadmap.find(filters)
      .populate('createdBy', 'name role respectPoints')
      .skip(skip)
      .limit(limit)
      .sort({ followerCount: -1, createdAt: -1 });
      
    const total = await CareerRoadmap.countDocuments(filters);
    
    return {
      roadmaps,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRoadmaps: total,
    };
  },

  async getRoadmapById(id: string): Promise<ICareerRoadmap | null> {
    return await CareerRoadmap.findById(id).populate('createdBy', 'name role respectPoints bio');
  },

  async updateRoadmap(id: string, updateData: Partial<ICareerRoadmap>): Promise<ICareerRoadmap | null> {
    return await CareerRoadmap.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  async deleteRoadmap(id: string): Promise<void> {
    await CareerRoadmap.findByIdAndDelete(id);
  },

  async incrementFollowerCount(id: string): Promise<void> {
    await CareerRoadmap.findByIdAndUpdate(id, { $inc: { followerCount: 1 } });
  },

  // --- Progress Operations ---
  async findProgress(userId: string, roadmapId: string): Promise<IUserProgress | null> {
    return await UserProgress.findOne({ userId, roadmapId });
  },

  async createProgress(userId: string, roadmapId: string): Promise<IUserProgress> {
    const progress = new UserProgress({ userId, roadmapId, completedSteps: [], progressPercentage: 0 });
    return await progress.save();
  },

  async updateProgress(id: string, completedSteps: number[], progressPercentage: number): Promise<IUserProgress | null> {
    return await UserProgress.findByIdAndUpdate(
      id,
      { completedSteps, progressPercentage },
      { new: true }
    );
  },
};
