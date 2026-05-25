import mongoose, { Document, Schema } from 'mongoose';

export interface ICareerJournalEntry extends Document {
  userId: mongoose.Types.ObjectId;
  entryType: 'reflection' | 'win' | 'setback' | 'note' | 'realization' | 'mentorship_takeaway';
  title: string;
  body: string;
  mood?: 'confident' | 'curious' | 'stuck' | 'uncertain' | 'motivated' | 'tired';
  tags: string[];
  relatedDomainIds: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const careerJournalEntrySchema = new Schema<ICareerJournalEntry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    entryType: {
      type: String,
      enum: ['reflection', 'win', 'setback', 'note', 'realization', 'mentorship_takeaway'],
      default: 'reflection',
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    mood: { type: String, enum: ['confident', 'curious', 'stuck', 'uncertain', 'motivated', 'tired'] },
    tags: { type: [String], default: [] },
    relatedDomainIds: { type: [Schema.Types.ObjectId], ref: 'CareerDomain', default: [] },
    isPrivate: { type: Boolean, default: true },
  },
  { timestamps: true }
);

careerJournalEntrySchema.index({ userId: 1, createdAt: -1 });

export const CareerJournalEntry = mongoose.model<ICareerJournalEntry>('CareerJournalEntry', careerJournalEntrySchema);
