import mongoose, { Document, Schema } from 'mongoose';

export enum PingStatus {
  PENDING = 'pending',
  ANSWERED = 'answered',
  CLOSED = 'closed',
  EXPIRED = 'expired',
}

export interface IPingRequest extends Document {
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  question: string;
  context?: string;
  status: PingStatus;
  response?: string;
  responseRating?: number;
  conversationId?: mongoose.Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const pingSchema = new Schema<IPingRequest>(
  {
    fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    context: { type: String },
    status: {
      type: String,
      enum: Object.values(PingStatus),
      default: PingStatus.PENDING,
    },
    response: { type: String },
    responseRating: { type: Number, min: 1, max: 5 },
    conversationId: { type: Schema.Types.ObjectId, ref: 'MentorshipConversation' },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // Default 48 hours
    },
  },
  { timestamps: true }
);

// Indexes
pingSchema.index({ fromUserId: 1 });
pingSchema.index({ toUserId: 1 });
pingSchema.index({ status: 1, expiresAt: 1 });

export const PingRequest = mongoose.model<IPingRequest>('PingRequest', pingSchema);
