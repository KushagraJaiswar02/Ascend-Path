import { respectRepository } from './respect.repository';
import { userRepository } from '../users/user.repository';
import { userService } from '../users/user.service';
import { RespectReason } from './respectVote.model';

export const respectService = {
  /**
   * Handles upvoting or downvoting. Prevents self-voting.
   * Dynamically calculates delta if user switches votes or removes a vote.
   * @param newPoints e.g., +5 for upvote, -3 for downvote
   */
  async handleVoteAction(
    voterId: string,
    targetUserId: string,
    sourceId: string,
    reason: RespectReason,
    newPoints: number
  ) {
    if (voterId === targetUserId) {
      throw new Error('Cannot vote on your own content');
    }

    const existingVote = await respectRepository.findVote(voterId, sourceId, reason);
    let delta = 0;

    if (existingVote) {
      if (existingVote.points === newPoints) {
        // User clicked the same vote button, so remove the vote
        delta = -existingVote.points;
        await respectRepository.deleteVote(voterId, sourceId, reason);
      } else {
        // User changed their vote
        delta = newPoints - existingVote.points;
        await respectRepository.upsertVote(voterId, targetUserId, sourceId, reason, newPoints);
      }
    } else {
      // New vote
      delta = newPoints;
      await respectRepository.upsertVote(voterId, targetUserId, sourceId, reason, newPoints);
    }

    if (delta !== 0) {
      await userRepository.incrementRespectPoints(targetUserId, delta);
      
      // Evaluate if role should be upgraded
      await userService.evaluateUserRole(targetUserId);
    }

    return delta;
  },

  /**
   * Grants a one-time point allocation (e.g., solution marked).
   * Ensures the points are only given once using the unique compound index.
   */
  async grantOneTimePoints(
    granterId: string,
    targetUserId: string,
    sourceId: string,
    reason: RespectReason,
    points: number
  ) {
    if (granterId === targetUserId) {
      throw new Error('Cannot grant points to yourself');
    }

    const existingVote = await respectRepository.findVote(granterId, sourceId, reason);
    
    if (!existingVote) {
      await respectRepository.upsertVote(granterId, targetUserId, sourceId, reason, points);
      await userRepository.incrementRespectPoints(targetUserId, points);
      
      // Evaluate if role should be upgraded
      await userService.evaluateUserRole(targetUserId);
      return points;
    }
    
    return 0; // Already granted
  },
};
