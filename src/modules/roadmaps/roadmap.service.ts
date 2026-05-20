import { roadmapRepository } from './roadmap.repository';
import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { CreateRoadmapInput, UpdateRoadmapInput, UpdateProgressInput } from './roadmap.validation';

export const roadmapService = {
  async createRoadmap(userId: string, data: CreateRoadmapInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw new Error('User not found');

    if (user.role !== Role.PATHFINDER && user.role !== Role.GUIDE) {
      throw new Error('Only Pathfinders and Guides can create roadmaps');
    }

    return await roadmapRepository.createRoadmap({
      ...data,
      createdBy: userId as any,
    });
  },

  async updateRoadmap(userId: string, roadmapId: string, data: UpdateRoadmapInput) {
    const roadmap = await roadmapRepository.getRoadmapById(roadmapId);
    if (!roadmap) throw new Error('Roadmap not found');

    if (roadmap.createdBy._id.toString() !== userId) {
      throw new Error('You can only update your own roadmaps');
    }

    return await roadmapRepository.updateRoadmap(roadmapId, data);
  },

  async deleteRoadmap(userId: string, roadmapId: string) {
    const roadmap = await roadmapRepository.getRoadmapById(roadmapId);
    if (!roadmap) throw new Error('Roadmap not found');

    if (roadmap.createdBy._id.toString() !== userId) {
      throw new Error('You can only delete your own roadmaps');
    }

    await roadmapRepository.deleteRoadmap(roadmapId);
  },

  async getRoadmaps(page: number, limit: number, domain?: string) {
    const filters: any = { isPublic: true };
    if (domain) {
      filters.domain = { $regex: new RegExp(domain, 'i') };
    }
    return await roadmapRepository.getRoadmaps(filters, page, limit);
  },

  async getRoadmapById(roadmapId: string) {
    const roadmap = await roadmapRepository.getRoadmapById(roadmapId);
    if (!roadmap) throw new Error('Roadmap not found');
    return roadmap;
  },

  async followRoadmap(userId: string, roadmapId: string) {
    const roadmap = await roadmapRepository.getRoadmapById(roadmapId);
    if (!roadmap) throw new Error('Roadmap not found');

    const existingProgress = await roadmapRepository.findProgress(userId, roadmapId);
    if (existingProgress) {
      throw new Error('You are already following this roadmap');
    }

    const progress = await roadmapRepository.createProgress(userId, roadmapId);
    await roadmapRepository.incrementFollowerCount(roadmapId);

    return progress;
  },

  async updateProgress(userId: string, roadmapId: string, data: UpdateProgressInput) {
    const roadmap = await roadmapRepository.getRoadmapById(roadmapId);
    if (!roadmap) throw new Error('Roadmap not found');

    if (data.stepIndex < 0 || data.stepIndex >= roadmap.steps.length) {
      throw new Error('Invalid step index');
    }

    const progress = await roadmapRepository.findProgress(userId, roadmapId);
    if (!progress) {
      throw new Error('You are not following this roadmap');
    }

    let completedSteps = [...progress.completedSteps];

    if (data.completed) {
      if (!completedSteps.includes(data.stepIndex)) {
        completedSteps.push(data.stepIndex);
      }
    } else {
      completedSteps = completedSteps.filter((index) => index !== data.stepIndex);
    }

    // Calculate dynamic percentage
    const progressPercentage = Math.round((completedSteps.length / roadmap.steps.length) * 100);

    return await roadmapRepository.updateProgress(progress._id.toString(), completedSteps, progressPercentage);
  },
};
