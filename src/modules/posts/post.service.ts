import { postRepository } from './post.repository';
import { CreatePostInput, UpdatePostInput, CreateReplyInput } from './post.validation';
import { PostCategory } from './post.model';
import { respectService } from '../respect/respect.service';
import { RespectReason } from '../respect/respectVote.model';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { logger } from '../../utils/logger';

export const postService = {
  async createPost(userId: string, data: CreatePostInput) {
    return await postRepository.createPost({
      ...data,
      authorId: userId as any,
    });
  },

  async getPosts(page: number, limit: number, category?: string, tags?: string, search?: string) {
    return await postRepository.getPosts(page, limit, {
      category: category as PostCategory,
      tags,
      search,
    });
  },

  async getPostById(id: string) {
    const post = await postRepository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    // Increment view count asynchronously
    postRepository.incrementViewCount(id).catch((e) => logger.error('Failed to increment view count:', e));
    return post;
  },

  async updatePost(userId: string, postId: string, data: UpdatePostInput) {
    const post = await postRepository.getPostById(postId);
    if (!post) throw new Error('Post not found');

    if (post.authorId._id.toString() !== userId) {
      throw new Error('Unauthorized to edit this post');
    }

    if (post.isLocked) {
      throw new Error('Post is locked');
    }

    return await postRepository.updatePost(postId, data);
  },

  async deletePost(userId: string, postId: string) {
    const post = await postRepository.getPostById(postId);
    if (!post) throw new Error('Post not found');

    if (post.authorId._id.toString() !== userId) {
      throw new Error('Unauthorized to delete this post');
    }

    await postRepository.deletePost(postId);
  },

  async createReply(userId: string, postId: string, data: CreateReplyInput) {
    const post = await postRepository.getPostById(postId);
    if (!post) throw new Error('Post not found');

    if (post.isLocked) {
      throw new Error('Cannot reply to a locked post');
    }

    const newReply = await postRepository.createReply({
      postId: postId as any,
      authorId: userId as any,
      content: data.content,
    });

    // Notify post author if they are not the ones replying
    if (post.authorId._id.toString() !== userId) {
      notificationService.createNotification({
        userId: post.authorId._id.toString(),
        type: NotificationType.POST_REPLY,
        message: `Someone replied to your post.`,
        link: `/forum/post/${postId}`
      }).catch((e) => logger.error('Failed to notify post author of reply:', e));
    }

    return newReply;
  },

  async getReplies(postId: string, page: number, limit: number) {
    return await postRepository.getRepliesByPost(postId, page, limit);
  },

  async markSolution(userId: string, postId: string, replyId: string) {
    const post = await postRepository.getPostById(postId);
    if (!post) throw new Error('Post not found');

    if (post.authorId._id.toString() !== userId) {
      throw new Error('Only the author can mark a solution');
    }

    const reply = await postRepository.getReplyById(replyId);
    if (!reply || reply.postId.toString() !== postId) {
      throw new Error('Reply not found or does not belong to this post');
    }

    const result = await postRepository.updatePost(postId, {
      isSolved: true,
      solutionReplyId: replyId as any,
    });

    // Award +20 points to the reply author for providing a solution
    try {
      await respectService.grantOneTimePoints(
        userId,
        reply.authorId._id.toString(),
        postId,
        RespectReason.SOLUTION_MARKED,
        20
      );
    } catch (e) {
      // Ignored if it was already marked or they marked their own solution
    }

    return result;
  },

  async handleVote(voters: any[], currentUpvotes: number, currentDownvotes: number, userId: string, voteValue: 1 | -1) {
    let upvotes = currentUpvotes;
    let downvotes = currentDownvotes;
    const existingVoteIndex = voters.findIndex((v) => v.userId.toString() === userId);

    if (existingVoteIndex !== -1) {
      const existingVote = voters[existingVoteIndex];
      if (existingVote.vote === voteValue) {
        // Remove vote if clicking the same button
        if (voteValue === 1) upvotes -= 1;
        else downvotes -= 1;
        voters.splice(existingVoteIndex, 1);
      } else {
        // Change vote
        if (voteValue === 1) {
          upvotes += 1;
          downvotes -= 1;
        } else {
          upvotes -= 1;
          downvotes += 1;
        }
        voters[existingVoteIndex].vote = voteValue;
      }
    } else {
      // New vote
      if (voteValue === 1) upvotes += 1;
      else downvotes += 1;
      voters.push({ userId, vote: voteValue });
    }

    return { voters, upvotes, downvotes };
  },

  async votePost(userId: string, postId: string, vote: 1 | -1) {
    const post = await postRepository.getPostById(postId);
    if (!post) throw new Error('Post not found');

    // Handle respect points allocation (throws if self-voting)
    const pointValue = vote === 1 ? 5 : -3;
    await respectService.handleVoteAction(
      userId,
      post.authorId._id.toString(),
      postId,
      RespectReason.FORUM_POST,
      pointValue
    );

    const result = await this.handleVote(post.voters, post.upvotes, post.downvotes, userId, vote);
    await postRepository.votePost(postId, result.voters, result.upvotes, result.downvotes);
    return result;
  },

  async voteReply(userId: string, replyId: string, vote: 1 | -1) {
    const reply = await postRepository.getReplyById(replyId);
    if (!reply) throw new Error('Reply not found');

    // Handle respect points allocation (throws if self-voting)
    const pointValue = vote === 1 ? 5 : -3;
    await respectService.handleVoteAction(
      userId,
      reply.authorId._id.toString(),
      replyId,
      RespectReason.FORUM_REPLY,
      pointValue
    );

    const result = await this.handleVote(reply.voters, reply.upvotes, reply.downvotes, userId, vote);
    await postRepository.voteReply(replyId, result.voters, result.upvotes, result.downvotes);
    return result;
  },
};
