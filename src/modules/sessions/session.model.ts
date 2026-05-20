import mongoose, { Document, Schema } from 'mongoose';

export enum SessionStatus {
  OPEN = 'open',
  BOOKED = 'booked',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface ISession extends Document {
  guideId: mongoose.Types.ObjectId;
  clientId?: mongoose.Types.ObjectId;
  title: string;
  topic: string;
  description?: string;
  scheduledAt: Date;
  durationMinutes: number;
  price: number;
  status: SessionStatus;
  meetingLink?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    guideId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: Schema.Types.ObjectId, ref: 'User' },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    price: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: Object.values(SessionStatus),
      default: SessionStatus.OPEN,
    },
    meetingLink: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
  },
  { timestamps: true }
);

// Indexes for faster lookups
sessionSchema.index({ guideId: 1, status: 1 });
sessionSchema.index({ clientId: 1, status: 1 });
sessionSchema.index({ scheduledAt: 1 });

export const Session = mongoose.model<ISession>('Session', sessionSchema);
