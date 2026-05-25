import mongoose from 'mongoose';
import { PortfolioProject, IPortfolioProject } from './portfolioProject.model';

export const portfolioRepository = {
  async createProject(data: any): Promise<IPortfolioProject> {
    return await PortfolioProject.create(data);
  },

  async findProjectById(id: string): Promise<IPortfolioProject | null> {
    return await PortfolioProject.findById(id)
      .populate('userId', 'name avatar role specialization')
      .populate('reviewedBy', 'name avatar role');
  },

  async findProjectsByUserId(userId: string): Promise<IPortfolioProject[]> {
    return await PortfolioProject.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('reviewedBy', 'name avatar role')
      .sort({ createdAt: -1 });
  },

  async updateProject(id: string, update: Partial<IPortfolioProject>): Promise<IPortfolioProject | null> {
    return await PortfolioProject.findByIdAndUpdate(id, update, { new: true, runValidators: true })
      .populate('userId', 'name avatar role')
      .populate('reviewedBy', 'name avatar role');
  },

  async deleteProject(id: string): Promise<IPortfolioProject | null> {
    return await PortfolioProject.findByIdAndDelete(id);
  },
};
