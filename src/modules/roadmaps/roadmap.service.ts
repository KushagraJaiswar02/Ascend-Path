import { roadmapRepository } from './roadmap.repository';
import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { canActAsGuide, hasCapability, UserCapability } from '../users/userCapabilities';
import { CareerRoadmap, RoadmapSection, RoadmapStep } from './roadmap.model';
import {
  CreateRoadmapInput,
  UpdateRoadmapInput,
  CreateSectionInput,
  UpdateSectionInput,
  CreateStepInput,
  UpdateStepInput,
  UpdateProgressInput
} from './roadmap.validation';
import { eventEmitter } from '../../utils/eventEmitter';
import mongoose from 'mongoose';
import { taxonomyService } from '../taxonomy/taxonomy.service';

// Helper to generate unique, SEO-friendly URL slugs
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  let slug = baseSlug || 'roadmap';
  let exists = await CareerRoadmap.findOne({ slug });
  let count = 0;
  
  while (exists) {
    count++;
    slug = `${baseSlug}-${count}`;
    exists = await CareerRoadmap.findOne({ slug });
  }
  
  return slug;
}

// Helper to check if a user owns a roadmap
async function checkRoadmapOwnership(userId: string, roadmapId: string): Promise<boolean> {
  const roadmap = await roadmapRepository.getRoadmapById(roadmapId);
  if (!roadmap) throw { statusCode: 404, message: 'Roadmap not found' };
  return roadmap.createdBy._id.toString() === userId;
}

export const roadmapService = {
  // --- Roadmap Services ---
  async createRoadmap(userId: string, data: CreateRoadmapInput) {
    const user = await userRepository.findUserById(userId);
    if (!user) throw { statusCode: 404, message: 'User not found' };

    const canCreateRoadmap =
      user.role === Role.PATHFINDER ||
      user.role === Role.ARCHITECT ||
      (canActAsGuide(user) && hasCapability(user, UserCapability.ROADMAPS_CREATE) && user.mentorProfileStatus === 'approved');

    if (!canCreateRoadmap) {
      throw { statusCode: 403, message: 'Only Pathfinders and approved mentors can create roadmaps' };
    }

    const slug = await generateUniqueSlug(data.title);
    const careerDomains = data.careerDomains?.length
      ? await taxonomyService.assertActiveDomains(data.careerDomains)
      : [];
    const careerGoals = data.careerGoals?.length
      ? await taxonomyService.assertActiveGoals(data.careerGoals)
      : [];
    const nextRoadmaps = (data.nextRoadmaps || []).map((id) => new mongoose.Types.ObjectId(id));
    const prerequisiteRoadmaps = (data.prerequisiteRoadmaps || []).map((id) => new mongoose.Types.ObjectId(id));
    const recommendedSequence = (data.recommendedSequence || []).map((id) => new mongoose.Types.ObjectId(id));

    return await roadmapRepository.createRoadmap({
      ...data,
      careerDomains: careerDomains as any,
      careerGoals: careerGoals as any,
      nextRoadmaps: nextRoadmaps as any,
      prerequisiteRoadmaps: prerequisiteRoadmaps as any,
      recommendedSequence: recommendedSequence as any,
      slug,
      createdBy: new mongoose.Types.ObjectId(userId) as any,
      // Backward compatibility fields
      domain: data.domains?.[0] || data.domain || 'Technology',
      isPublic: data.isPublished || data.visibility === 'public',
    });
  },

  async updateRoadmap(userId: string, roadmapId: string, data: UpdateRoadmapInput) {
    const isOwner = await checkRoadmapOwnership(userId, roadmapId);
    if (!isOwner) throw { statusCode: 403, message: 'You can only update your own roadmaps' };

    const updateData: any = { ...data };
    if (data.title) {
      updateData.slug = await generateUniqueSlug(data.title);
    }
    if (data.domains) {
      updateData.domain = data.domains[0];
    }
    if (data.careerDomains) {
      updateData.careerDomains = await taxonomyService.assertActiveDomains(data.careerDomains);
    }
    if (data.careerGoals) {
      updateData.careerGoals = await taxonomyService.assertActiveGoals(data.careerGoals);
    }
    if (data.nextRoadmaps) updateData.nextRoadmaps = data.nextRoadmaps.map((id) => new mongoose.Types.ObjectId(id));
    if (data.prerequisiteRoadmaps) updateData.prerequisiteRoadmaps = data.prerequisiteRoadmaps.map((id) => new mongoose.Types.ObjectId(id));
    if (data.recommendedSequence) updateData.recommendedSequence = data.recommendedSequence.map((id) => new mongoose.Types.ObjectId(id));
    if (data.isPublished !== undefined) {
      updateData.isPublic = data.isPublished;
    }

    return await roadmapRepository.updateRoadmap(roadmapId, updateData);
  },

  async deleteRoadmap(userId: string, roadmapId: string) {
    const isOwner = await checkRoadmapOwnership(userId, roadmapId);
    if (!isOwner) throw { statusCode: 403, message: 'You can only delete your own roadmaps' };

    await roadmapRepository.deleteRoadmap(roadmapId);
  },

  async getRoadmaps(page: number, limit: number, domain?: string, difficulty?: string, search?: string, sortBy = 'fameScore') {
    const filters: any = { visibility: 'public', isPublished: true, moderationStatus: { $nin: ['deleted', 'hidden'] } };

    if (domain) {
      const resolved = mongoose.Types.ObjectId.isValid(domain)
        ? { id: domain }
        : await taxonomyService.resolveDomain(domain);
      if (resolved?.id) {
        filters.$or = [
          { careerDomains: new mongoose.Types.ObjectId(resolved.id) },
          { domains: { $regex: new RegExp(domain.trim(), 'i') } },
          { domain: { $regex: new RegExp(domain.trim(), 'i') } },
        ];
      } else {
        filters.$or = [
          { domains: { $regex: new RegExp(domain.trim(), 'i') } },
          { domain: { $regex: new RegExp(domain.trim(), 'i') } },
        ];
      }
    }
    if (difficulty) {
      filters.difficulty = difficulty.toLowerCase().trim();
    }
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filters.$or = [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { tags: { $regex: searchRegex } }
      ];
    }

    return await roadmapRepository.getRoadmaps(filters, sortBy, page, limit);
  },

  async getRoadmapById(idOrSlug: string) {
    const roadmapTree = await roadmapRepository.findFullRoadmapTree(idOrSlug);
    if (!roadmapTree) throw { statusCode: 404, message: 'Roadmap curriculum not found' };
    return roadmapTree;
  },

  // --- Section Services ---
  async createSection(userId: string, roadmapId: string, data: CreateSectionInput) {
    const isOwner = await checkRoadmapOwnership(userId, roadmapId);
    if (!isOwner) throw { statusCode: 403, message: 'Only the roadmap creator can append sections' };

    return await roadmapRepository.createSection({
      ...data,
      roadmapId: new mongoose.Types.ObjectId(roadmapId) as any,
    });
  },

  async updateSection(userId: string, sectionId: string, data: UpdateSectionInput) {
    const sec = await roadmapRepository.getSectionById(sectionId);
    if (!sec) throw { statusCode: 404, message: 'Section not found' };

    const isOwner = await checkRoadmapOwnership(userId, sec.roadmapId.toString());
    if (!isOwner) throw { statusCode: 403, message: 'Only the roadmap creator can update sections' };

    return await roadmapRepository.updateSection(sectionId, data);
  },

  async deleteSection(userId: string, sectionId: string) {
    const sec = await roadmapRepository.getSectionById(sectionId);
    if (!sec) throw { statusCode: 404, message: 'Section not found' };

    const isOwner = await checkRoadmapOwnership(userId, sec.roadmapId.toString());
    if (!isOwner) throw { statusCode: 403, message: 'Only the roadmap creator can delete sections' };

    await roadmapRepository.deleteSection(sectionId);
  },

  // --- Step Services ---
  async createStep(userId: string, sectionId: string, data: CreateStepInput) {
    const sec = await roadmapRepository.getSectionById(sectionId);
    if (!sec) throw { statusCode: 404, message: 'Section not found' };

    const isOwner = await checkRoadmapOwnership(userId, sec.roadmapId.toString());
    if (!isOwner) throw { statusCode: 403, message: 'Only the roadmap creator can append steps' };

    let linkedSessionId: mongoose.Types.ObjectId | undefined = undefined;
    if (data.linkedSessionId) {
      linkedSessionId = new mongoose.Types.ObjectId(data.linkedSessionId);
    }

    return await roadmapRepository.createStep({
      ...data,
      sectionId: new mongoose.Types.ObjectId(sectionId) as any,
      roadmapId: sec.roadmapId,
      linkedSessionId,
    });
  },

  async updateStep(userId: string, stepId: string, data: UpdateStepInput) {
    const step = await roadmapRepository.getStepById(stepId);
    if (!step) throw { statusCode: 404, message: 'Step not found' };

    const isOwner = await checkRoadmapOwnership(userId, step.roadmapId.toString());
    if (!isOwner) throw { statusCode: 403, message: 'Only the roadmap creator can update steps' };

    const updateData: any = { ...data };
    if (data.linkedSessionId) {
      updateData.linkedSessionId = new mongoose.Types.ObjectId(data.linkedSessionId);
    } else if (data.linkedSessionId === null) {
      updateData.linkedSessionId = undefined;
    }

    return await roadmapRepository.updateStep(stepId, updateData);
  },

  async deleteStep(userId: string, stepId: string) {
    const step = await roadmapRepository.getStepById(stepId);
    if (!step) throw { statusCode: 404, message: 'Step not found' };

    const isOwner = await checkRoadmapOwnership(userId, step.roadmapId.toString());
    if (!isOwner) throw { statusCode: 403, message: 'Only the roadmap creator can delete steps' };

    await roadmapRepository.deleteStep(stepId);
  },

  // --- Progression Engine & Enrollments ---
  async enrollUser(userId: string, roadmapId: string) {
    const roadmap = await roadmapRepository.getRoadmapById(roadmapId);
    if (!roadmap) throw { statusCode: 404, message: 'Roadmap not found' };

    const existingProgress = await roadmapRepository.findProgress(userId, roadmapId);
    if (existingProgress) {
      throw { statusCode: 400, message: 'You are already enrolled in this roadmap curriculum' };
    }

    const progress = await roadmapRepository.createProgress(userId, roadmapId);
    await roadmapRepository.incrementEnrollmentCount(roadmapId);

    return progress;
  },

  // Centralized helper to calculate progress % excluding optional steps
  async calculateProgressPercentage(userId: string, roadmapId: string): Promise<{ percentage: number; completedRequired: string[]; totalRequiredCount: number }> {
    const steps = await roadmapRepository.getStepsByRoadmap(roadmapId);
    const progress = await roadmapRepository.findProgress(userId, roadmapId);
    if (!progress) return { percentage: 0, completedRequired: [], totalRequiredCount: 0 };

    const requiredSteps = steps.filter(s => !s.isOptional);
    const completedStepIds = progress.completedSteps.map(id => id.toString());

    if (requiredSteps.length === 0) {
      // If roadmap has zero required steps, ratio defaults to total steps
      if (steps.length === 0) return { percentage: 0, completedRequired: [], totalRequiredCount: 0 };
      const completedAll = steps.filter(s => completedStepIds.includes(s._id.toString()));
      const pct = Math.round((completedAll.length / steps.length) * 100);
      return { percentage: pct, completedRequired: completedAll.map(s => s._id.toString()), totalRequiredCount: steps.length };
    }

    const completedRequired = requiredSteps.filter(s => completedStepIds.includes(s._id.toString()));
    const pct = Math.round((completedRequired.length / requiredSteps.length) * 100);

    return {
      percentage: pct,
      completedRequired: completedRequired.map(s => s._id.toString()),
      totalRequiredCount: requiredSteps.length,
    };
  },

  async toggleStepCompletion(userId: string, stepId: string, completed: boolean) {
    const step = await roadmapRepository.getStepById(stepId);
    if (!step) throw { statusCode: 404, message: 'Roadmap step not found' };

    const progress = await roadmapRepository.findProgress(userId, step.roadmapId.toString());
    if (!progress) throw { statusCode: 400, message: 'You must enroll in this roadmap before marking completions' };

    let completedSteps = [...progress.completedSteps];
    const sIdStr = step._id.toString();

    if (completed) {
      if (!completedSteps.some(id => id.toString() === sIdStr)) {
        completedSteps.push(step._id);
      }
    } else {
      completedSteps = completedSteps.filter(id => id.toString() !== sIdStr);
    }

    // Streaks calculation:
    // Check calendar difference between now and lastActiveAt
    const now = new Date();
    const lastActive = new Date(progress.lastActiveAt);

    const msDiff = now.getTime() - lastActive.getTime();
    const hrsDiff = msDiff / (1000 * 60 * 60);

    let streak = progress.streakCount || 0;
    if (hrsDiff > 1.5 && hrsDiff <= 36) {
      // If completed another step between 1.5 and 36 hours later, advance streak
      streak += 1;
    } else if (hrsDiff > 36) {
      // Reset streak if lapsed
      streak = 1;
    } else if (streak === 0) {
      streak = 1;
    }

    progress.completedSteps = completedSteps;
    progress.lastActiveAt = now;
    progress.streakCount = streak;
    await progress.save();

    // Dynamically calculate and save progress %
    const { percentage } = await this.calculateProgressPercentage(userId, step.roadmapId.toString());
    progress.progressPercentage = percentage;

    let isJustCompleted = false;
    if (percentage === 100 && !progress.completedAt) {
      progress.completedAt = now;
      isJustCompleted = true;
    } else if (percentage < 100) {
      progress.completedAt = undefined;
    }

    const savedProgress = await progress.save();

    // Emit domain events asynchronously
    if (completed) {
      eventEmitter.emit('ROADMAP_STEP_COMPLETED', {
        roadmapId: step.roadmapId.toString(),
        stepId: step._id.toString(),
        userId,
        stepTitle: step.title || 'Curriculum Step',
        progressPercentage: savedProgress.progressPercentage,
      });
      eventEmitter.emit('STEP_COMPLETED', {
        roadmapId: step.roadmapId.toString(),
        stepId: step._id.toString(),
        userId,
        stepTitle: step.title || 'Curriculum Step',
      });
    }

    if (isJustCompleted) {
      roadmapRepository.getRoadmapById(step.roadmapId.toString()).then((roadmap) => {
        if (roadmap) {
          eventEmitter.emit('ROADMAP_COMPLETED', {
            roadmapId: step.roadmapId.toString(),
            userId,
            title: roadmap.title || 'Your enrolled roadmap',
          });
        }
      }).catch(console.error);
    }

    return savedProgress;
  },

  async updateProgressDetails(userId: string, roadmapId: string, data: UpdateProgressInput) {
    const progress = await roadmapRepository.findProgress(userId, roadmapId);
    if (!progress) throw { statusCode: 400, message: 'No active enrollment for this curriculum' };

    if (data.notes !== undefined) {
      progress.notes = new Map(Object.entries(data.notes));
    }
    if (data.bookmarkedSteps !== undefined) {
      progress.bookmarkedSteps = data.bookmarkedSteps.map(id => new mongoose.Types.ObjectId(id)) as any;
    }

    return await progress.save();
  },

  async getUserProgress(userId: string, roadmapId: string) {
    const progress = await roadmapRepository.findProgress(userId, roadmapId);
    if (!progress) throw { statusCode: 404, message: 'Active enrollment progress not found' };
    return progress;
  },

  async getUserActiveProgress(userId: string) {
    return await roadmapRepository.findUserActiveProgress(userId);
  },
};
