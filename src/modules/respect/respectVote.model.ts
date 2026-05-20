import mongoose, { Document, Schema } from 'mongoose';

export enum RespectReason {
  FORUM_POST = 'forum_post',
  FORUM_REPLY = 'forum_reply',
  SOLUTION_MARKED = 'solution_marked',
  PING_RESPONSE = 'ping_response',
  SESSION = 'session',
}

export interface IRespectVote extends Document {
  voterId: mongoose.Types.ObjectId;
  targetUserId: mongoose.Types.ObjectId;
  points: number;
  reason: RespectReason;
  sourceId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const respectVoteSchema = new Schema<IRespectVote>(
  {
    voterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, required: true },
    reason: {
      type: String,
      enum: Object.values(RespectReason),
      required: true,
    },
    sourceId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate votes for the same reason on the same source
respectVoteSchema.index({ voterId: 1, sourceId: 1, reason: 1 }, { unique: true });

export const RespectVote = mongoose.model<IRespectVote>('RespectVote', respectVoteSchema);
