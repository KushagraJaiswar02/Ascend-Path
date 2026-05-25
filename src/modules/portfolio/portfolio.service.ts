import mongoose from 'mongoose';
import { portfolioRepository } from './portfolio.repository';
import { IPortfolioProject } from './portfolioProject.model';
import { careerCompanionService } from '../companion/careerCompanion.service';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { User, Role } from '../users/user.model';

export const portfolioService = {
  async createProject(userId: string, data: any): Promise<IPortfolioProject> {
    const project = await portfolioRepository.createProject({
      ...data,
      userId: new mongoose.Types.ObjectId(userId),
      isMentorReviewed: false,
    });

    // Record Career Companion Timeline Event for project creation
    await careerCompanionService.recordTimelineEvent(userId, {
      type: 'roadmap_step_completed', // fallback standard type, or similar
      title: `Added Portfolio Project: ${project.title}`,
      summary: `Showcased a new project: ${project.description.slice(0, 120)}...`,
      entityId: project._id.toString(),
      entityType: 'PortfolioProject',
      visibility: 'mentor_summary',
    }).catch(() => null);

    return project;
  },

  async getProjectsByUser(userId: string): Promise<IPortfolioProject[]> {
    return await portfolioRepository.findProjectsByUserId(userId);
  },

  async getProjectById(id: string): Promise<IPortfolioProject | null> {
    return await portfolioRepository.findProjectById(id);
  },

  async updateProject(userId: string, id: string, data: any): Promise<IPortfolioProject> {
    const project = await portfolioRepository.findProjectById(id);
    if (!project) throw { statusCode: 404, message: 'Portfolio project not found' };

    if (project.userId._id.toString() !== userId) {
      throw { statusCode: 403, message: 'Unauthorized to update this project' };
    }

    const updated = await portfolioRepository.updateProject(id, data);
    if (!updated) throw { statusCode: 500, message: 'Failed to update project' };
    return updated;
  },

  async deleteProject(userId: string, id: string): Promise<void> {
    const project = await portfolioRepository.findProjectById(id);
    if (!project) throw { statusCode: 404, message: 'Portfolio project not found' };

    if (project.userId._id.toString() !== userId) {
      throw { statusCode: 403, message: 'Unauthorized to delete this project' };
    }

    await portfolioRepository.deleteProject(id);
  },

  async reviewProject(mentorId: string, id: string, reviewNotes: string): Promise<IPortfolioProject> {
    const mentor = await User.findById(mentorId);
    if (!mentor || !['admin', 'guide', 'super_admin'].includes(mentor.role)) {
      throw { statusCode: 403, message: 'Only mentors/admins can review portfolio projects' };
    }

    const project = await portfolioRepository.findProjectById(id);
    if (!project) throw { statusCode: 404, message: 'Portfolio project not found' };

    const updated = await portfolioRepository.updateProject(id, {
      isMentorReviewed: true,
      reviewedBy: new mongoose.Types.ObjectId(mentorId) as any,
      mentorReviewNotes: reviewNotes,
    });

    if (!updated) throw { statusCode: 500, message: 'Failed to submit project review' };

    // Record Career Companion Timeline Event for project endorsement
    await careerCompanionService.recordTimelineEvent(project.userId._id.toString(), {
      type: 'achievement',
      title: `Project Reviewed & Endorsed: ${updated.title}`,
      summary: `Mentor ${mentor.name} reviewed and endorsed your project with notes: "${reviewNotes.slice(0, 150)}..."`,
      entityId: updated._id.toString(),
      entityType: 'PortfolioProject',
      visibility: 'mentor_summary',
    }).catch(() => null);

    // Send notification to the student
    await notificationService.createNotification({
      recipientId: project.userId._id.toString(),
      type: NotificationType.SESSION_ACCEPTED, // fallback type
      title: 'Project Endorsement Verified',
      message: `Mentor ${mentor.name} endorsed your project "${updated.title}"!`,
      entityId: updated._id.toString(),
      entityType: 'PortfolioProject',
    }).catch(() => null);

    return updated;
  },
};
