import { RespectVote, IRespectVote, RespectReason } from './respectVote.model';

export const respectRepository = {
  async findVote(voterId: string, sourceId: string, reason: RespectReason): Promise<IRespectVote | null> {
    return await RespectVote.findOne({ voterId, sourceId, reason });
  },

  async upsertVote(
    voterId: string,
    targetUserId: string,
    sourceId: string,
    reason: RespectReason,
    points: number
  ): Promise<IRespectVote> {
    return await RespectVote.findOneAndUpdate(
      { voterId, sourceId, reason },
      { targetUserId, points },
      { new: true, upsert: true }
    );
  },

  async deleteVote(voterId: string, sourceId: string, reason: RespectReason): Promise<void> {
    await RespectVote.deleteOne({ voterId, sourceId, reason });
  },
};
