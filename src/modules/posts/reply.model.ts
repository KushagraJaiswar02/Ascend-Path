import mongoose, { Document, Schema } from 'mongoose';
import { IVote } from './post.model';

export interface IReply extends Document {
  postId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  upvotes: number;
  downvotes: number;
  voters: IVote[];
  createdAt: Date;
  updatedAt: Date;
}

const replySchema = new Schema<IReply>(
  {
    postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vote: { type: Number, enum: [1, -1], required: true },
        _id: false,
      },
    ],
  },
  { timestamps: true }
);

// Index for getting replies for a post
replySchema.index({ postId: 1, createdAt: 1 });
replySchema.index({ authorId: 1 });

export const Reply = mongoose.model<IReply>('Reply', replySchema);
