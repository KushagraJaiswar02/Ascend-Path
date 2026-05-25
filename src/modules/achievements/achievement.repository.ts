import mongoose from 'mongoose';
import { VerifiedAchievement, IVerifiedAchievement } from './verifiedAchievement.model';

export const achievementRepository = {
  async createAchievement(data: any): Promise<IVerifiedAchievement> {
    return await VerifiedAchievement.create(data);
  },

  async findAchievementById(id: string): Promise<IVerifiedAchievement | null> {
    return await VerifiedAchievement.findById(id).populate('userId', 'name email avatar role');
  },

  async findAchievementByCredentialId(credentialId: string): Promise<IVerifiedAchievement | null> {
    return await VerifiedAchievement.findOne({ credentialId })
      .populate('userId', 'name email avatar role specialization headline');
  },

  async findAchievementsByUserId(userId: string): Promise<IVerifiedAchievement[]> {
    return await VerifiedAchievement.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ issuedAt: -1 });
  },
};
