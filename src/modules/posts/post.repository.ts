import { Post, IPost, PostCategory } from './post.model';
import { Reply, IReply } from './reply.model';

export const postRepository = {
  async createPost(postData: Partial<IPost>): Promise<IPost> {
    const post = new Post(postData);
    return await post.save();
  },

  async getPostById(id: string): Promise<IPost | null> {
    return await Post.findById(id).populate('authorId', 'name avatar role respectPoints');
  },

  async getPosts(
    page: number = 1,
    limit: number = 20,
    filters: { category?: PostCategory; tags?: string; search?: string }
  ) {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }
    if (filters.tags) {
      // Tags might be a comma-separated string
      const tagsArray = filters.tags.split(',').map((t) => t.trim());
      query.tags = { $in: tagsArray };
    }
    if (filters.search) {
      // Basic text search using regex (case-insensitive)
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { content: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('authorId', 'name avatar role respectPoints')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const postsWithReplyCount = await Promise.all(
      posts.map(async (post) => {
        const replyCount = await Reply.countDocuments({ postId: post._id });
        return { ...post, replyCount };
      })
    );

    return { posts: postsWithReplyCount, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async updatePost(id: string, updateData: Partial<IPost>): Promise<IPost | null> {
    return await Post.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
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
    const skip = (page - 1) * limit;

    const [replies, total] = await Promise.all([
      Reply.find({ postId })
        .populate('authorId', 'name avatar role respectPoints')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Reply.countDocuments({ postId }),
    ]);

    return { replies, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async getReplyById(id: string): Promise<IReply | null> {
    return await Reply.findById(id);
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
