import mongoose, { Document, Schema } from 'mongoose';

export enum PostCategory {
  CAREER = 'career',
  SKILLS = 'skills',
  EDUCATION = 'education',
  GENERAL = 'general',
}

export interface IVote {
  userId: mongoose.Types.ObjectId;
  vote: 1 | -1;
}

export interface IPost extends Document {
  title: string;
  content: string;
  authorId: mongoose.Types.ObjectId;
  category: PostCategory;
  tags: string[];
  upvotes: number;
  downvotes: number;
  voters: IVote[];
  isSolved: boolean;
  solutionReplyId?: mongoose.Types.ObjectId;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: Object.values(PostCategory),
      default: PostCategory.GENERAL,
    },
    tags: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vote: { type: Number, enum: [1, -1], required: true },
        _id: false,
      },
    ],
    isSolved: { type: Boolean, default: false },
    solutionReplyId: { type: Schema.Types.ObjectId, ref: 'Reply' },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for common queries
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ authorId: 1 });

export const Post = mongoose.model<IPost>('Post', postSchema);
