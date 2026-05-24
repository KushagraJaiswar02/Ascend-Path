import { Post, IPost, PostCategory } from './post.model';
import { Reply, IReply } from './reply.model';

export const postRepository = {
  async createPost(postData: Partial<IPost>): Promise<IPost> {
    const post = new Post(postData);
    return await post.save();
  },

  async getPostById(id: string): Promise<IPost | null> {
    return await Post.findOne({ _id: id, moderationStatus: { $nin: ['deleted', 'hidden'] } }).populate('authorId', 'name avatar role respectPoints');
  },

  async getPosts(
    page: number = 1,
    limit: number = 20,
    filters: { category?: PostCategory; tags?: string; search?: string; resolution?: 'resolved' | 'unresolved'; authorId?: string }
  ) {
    const query: any = { moderationStatus: { $nin: ['deleted', 'hidden'] } };
    const and: any[] = [];

    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.authorId) {
      query.authorId = filters.authorId;
    }
    if (filters.tags) {
      // Tags might be a comma-separated string
      const tagsArray = filters.tags.split(',').map((t) => t.trim());
      query.tags = { $in: tagsArray };
    }
    if (filters.search) {
      // Basic text search using regex (case-insensitive)
      and.push({ $or: [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ] });
    }
    if (filters.resolution === 'resolved') {
      and.push({ $or: [{ isResolved: true }, { isSolved: true }] });
    }
    if (filters.resolution === 'unresolved') {
      and.push({ $or: [{ isResolved: false }, { isResolved: { $exists: false } }] }, { isSolved: { $ne: true } });
    }
    if (and.length) query.$and = and;

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('authorId', 'name avatar role respectPoints')
        .sort({ isPinned: -1, isResolved: -1, isSolved: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const postsWithReplyCount = await Promise.all(
      posts.map(async (post) => {
        const replyCount = await Reply.countDocuments({ postId: post._id, moderationStatus: { $nin: ['deleted', 'hidden'] } });
        return { ...post, replyCount };
      })
    );

    return { posts: postsWithReplyCount, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updatePost(id: string, updateData: Partial<IPost>): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  async getResolvedPosts(page: number = 1, limit: number = 20) {
    return await this.getPosts(page, limit, { resolution: 'resolved' });
  },

  async deletePost(id: string): Promise<void> {
    await Post.findByIdAndDelete(id);
    await Reply.deleteMany({ postId: id }); // Delete all associated replies
  },

  async deleteReply(id: string): Promise<void> {
    await Reply.findByIdAndDelete(id);
  },

  async createReply(replyData: Partial<IReply>): Promise<IReply> {
    const reply = new Reply(replyData);
    return await reply.save();
  },

  async getRepliesByPost(postId: string, page: number = 1, limit: number = 20) {
    const post = await Post.findOne({ _id: postId, moderationStatus: { $nin: ['deleted', 'hidden'] } }).select('acceptedReplyId solutionReplyId').lean();
    if (!post) {
      return { replies: [], total: 0, page, limit, totalPages: 0 };
    }
    const acceptedId = post.acceptedReplyId?.toString() || post.solutionReplyId?.toString();
    const includeAccepted = !!acceptedId && page === 1;
    const pageLimit = includeAccepted ? Math.max(limit - 1, 0) : limit;
    const skip = includeAccepted ? 0 : (page - 1) * limit - (acceptedId ? 1 : 0);
    const replyQuery: any = { postId, moderationStatus: { $nin: ['deleted', 'hidden'] } };
    if (acceptedId) replyQuery._id = { $ne: acceptedId };

    const [acceptedReply, replies, total] = await Promise.all([
      includeAccepted
        ? Reply.findOne({ _id: acceptedId, postId, moderationStatus: { $nin: ['deleted', 'hidden'] } }).populate('authorId', 'name avatar role respectPoints').lean()
        : Promise.resolve(null),
      Reply.find(replyQuery)
        .populate('authorId', 'name avatar role respectPoints')
        .sort({ createdAt: 1 })
        .skip(Math.max(skip, 0))
        .limit(pageLimit)
        .lean(),
      Reply.countDocuments({ postId, moderationStatus: { $nin: ['deleted', 'hidden'] } }),
    ]);

    const orderedReplies = acceptedReply ? [acceptedReply, ...replies] : replies;

    return {
      replies: orderedReplies.map((reply: any) => ({
        ...reply,
        isAccepted: acceptedId ? reply._id.toString() === acceptedId : false,
        isSolution: acceptedId ? reply._id.toString() === acceptedId : false,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getReplyById(id: string): Promise<IReply | null> {
    return await Reply.findOne({ _id: id, moderationStatus: { $nin: ['deleted', 'hidden'] } });
  },

  async votePost(id: string, voters: any[], upvotes: number, downvotes: number): Promise<void> {
    await Post.findByIdAndUpdate(id, { voters, upvotes, downvotes });
  },

  async voteReply(id: string, voters: any[], upvotes: number, downvotes: number): Promise<void> {
    await Reply.findByIdAndUpdate(id, { voters, upvotes, downvotes });
  },

  async incrementViewCount(id: string): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });
  },
};
