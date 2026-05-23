import { reputationService } from '../reputation/reputation.service';

export const fameService = {
  /**
   * Delegates fame score calculations to the centralized, production-grade ReputationService.
   */
  async updateFameScore(userId: string): Promise<void> {
    await reputationService.recalculateFameScore(userId);
  }
};
