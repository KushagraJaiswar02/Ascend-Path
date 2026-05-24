import { postRepository } from './post.repository';
import { CreatePostInput, UpdatePostInput, CreateReplyInput } from './post.validation';
import { IPost, PostCategory } from './post.model';
import { respectService } from '../respect/respect.service';
import { RespectReason } from '../respect/respectVote.model';
import { userRepository } from '../users/user.repository';
import { reputationService } from '../reputation/reputation.service';
import { eventEmitter } from '../../utils/eventEmitter';
import { logger } from '../../utils/logger';
import { PostDomainEvent } from './post.events';

export const postService = {
  async createPost(userId: string, data: CreatePostInput) {
    return await postRepository.createPost({
      ...data,
      authorId: userId as any,
    });
  },

  async getPosts(page: number, limit: number, category?: string, tags?: string, search?: string, resolution?: 'resolved' | 'unresolved', authorId?: string) {
    return await postRepository.getPosts(page, limit, {
      category: category as PostCategory,
      tags,
      search,
      resolution,
      authorId,
    });
  },

  async getResolvedPosts(page: number, limit: number) {
    return await postRepository.getResolvedPosts(page, limit);
  },

  async getPostById(id: string) {
    const post = await postRepository.getPostById(id);
    if (!post) {
      throw new Error('Post not found');
    }
    return post;
  },

  async incrementPostView(id: string) {
    const post = await postRepository.incrementViewCount(id);
    if (!post) {
      throw new Error('Post not found');
    }
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

    // Notify post author if they are not the ones replying by emitting a domain event
    if (post.authorId._id.toString() !== userId) {
      userRepository.findUserById(userId).then((author) => {
        eventEmitter.emit('POST_REPLY', {
          postId: postId,
          replyId: newReply._id.toString(),
          authorId: userId,
          recipientId: post.authorId._id.toString(),
          postTitle: post.title || 'Your forum post',
          authorName: author?.name || 'Someone',
        });
      }).catch((e) => logger.error('Failed to emit POST_REPLY event:', e));
    }

    return newReply;
  },

  async getReplies(postId: string, page: number, limit: number) {
    return await postRepository.getRepliesByPost(postId, page, limit);
  },

  async acceptAnswer(userId: string, postId: string, replyId: string, options?: { actorRole?: string; reason?: string; moderatorOverride?: boolean }) {
    const post = await postRepository.getPostById(postId);
    if (!post) throw new Error('Post not found');

    const postAuthorId = (post.authorId as any)._id?.toString() || post.authorId.toString();
    if (!options?.moderatorOverride && postAuthorId !== userId) {
      throw new Error('Only the author can accept an answer');
    }

    const reply = await postRepository.getReplyById(replyId);
    if (!reply || reply.postId.toString() !== postId || reply.moderationStatus !== 'visible') {
      throw new Error('Reply not found, hidden, or does not belong to this post');
    }

    const previousAcceptedReplyId =
      post.acceptedReplyId?.toString() || post.solutionReplyId?.toString() || undefined;
    const previousAcceptedReply =
      previousAcceptedReplyId && previousAcceptedReplyId !== replyId
        ? await postRepository.getReplyById(previousAcceptedReplyId)
        : null;
    const acceptedAt = new Date();
    const result = await postRepository.updatePost(postId, {
      acceptedReplyId: replyId as any,
      solutionReplyId: replyId as any,
      isResolved: true,
      isSolved: true,
      resolvedAt: acceptedAt,
      resolvedBy: userId as any,
    });

    const replyAuthorId = reply.authorId.toString();
    try {
      await respectService.assignOneTimePoints(
        postAuthorId,
        replyAuthorId,
        postId,
        RespectReason.SOLUTION_MARKED,
        20
      );
      await reputationService.recalculateFameScore(replyAuthorId);
      if (previousAcceptedReply) {
        await reputationService.recalculateFameScore(previousAcceptedReply.authorId.toString());
      }
    } catch (e) {
      logger.warn('Answer accepted without reputation award:', e);
    }

    const [postAuthor, replyAuthor] = await Promise.all([
      userRepository.findUserById(userId),
      userRepository.findUserById(replyAuthorId),
    ]);

    if (replyAuthorId !== userId) {
      eventEmitter.emit(PostDomainEvent.ANSWER_ACCEPTED, {
        postId,
        replyId,
        actorId: userId,
        recipientId: replyAuthorId,
        postTitle: post.title || 'A forum post',
        actorName: postAuthor?.name || 'The post author',
      });
    }

    eventEmitter.emit(PostDomainEvent.POST_RESOLVED, {
      postId,
      replyId,
      actorId: userId,
      recipientId: postAuthorId,
      postTitle: post.title || 'A forum post',
      acceptedAuthorName: replyAuthor?.name || 'A contributor',
      previousAcceptedReplyId,
      moderatorOverride: !!options?.moderatorOverride,
      reason: options?.reason,
    });

    return result;
  },

  async unacceptAnswer(userId: string, postId: string, options?: { moderatorOverride?: boolean; reason?: string }) {
    const post = await postRepository.getPostById(postId);
    if (!post) throw new Error('Post not found');

    const postAuthorId = (post.authorId as any)._id?.toString() || post.authorId.toString();
    if (!options?.moderatorOverride && postAuthorId !== userId) {
      throw new Error('Only the author can unaccept an answer');
    }

    const previousAcceptedReplyId = post.acceptedReplyId?.toString() || post.solutionReplyId?.toString();
    const previousAcceptedReply = previousAcceptedReplyId ? await postRepository.getReplyById(previousAcceptedReplyId) : null;
    const result = await postRepository.updatePost(postId, {
      acceptedReplyId: null as any,
      solutionReplyId: null as any,
      isResolved: false,
      isSolved: false,
      resolvedAt: null as any,
      resolvedBy: null as any,
    });

    try {
      await respectService.revokeOneTimePoints(postAuthorId, postId, RespectReason.SOLUTION_MARKED);
      if (previousAcceptedReply) {
        await reputationService.recalculateFameScore(previousAcceptedReply.authorId.toString());
      }
    } catch (e) {
      logger.warn('Accepted-answer reputation revoke failed:', e);
    }

    eventEmitter.emit(PostDomainEvent.POST_RESOLVED, {
      postId,
      actorId: userId,
      recipientId: postAuthorId,
      postTitle: post.title || 'A forum post',
      previousAcceptedReplyId,
      cleared: true,
      moderatorOverride: !!options?.moderatorOverride,
      reason: options?.reason,
    });

    return result;
  },

  async markSolution(userId: string, postId: string, replyId: string) {
    return await this.acceptAnswer(userId, postId, replyId);
  },

  async handleVote(voters: IPost['voters'], currentUpvotes: number, currentDownvotes: number, userId: string, voteValue: 1 | -1) {
    let upvotes = currentUpvotes;
    let downvotes = currentDownvotes;
    const existingVote = voters.find((v) => v.userId.toString() === userId);
    const otherVoters = voters.filter((v) => v.userId.toString() !== userId);

    if (existingVote) {
      if (existingVote.vote === voteValue) {
        if (voteValue === 1) upvotes -= 1;
        else downvotes -= 1;
      } else {
        if (voteValue === 1) {
          upvotes += 1;
          downvotes -= 1;
        } else {
          upvotes -= 1;
          downvotes += 1;
        }
        otherVoters.push({ userId: userId as any, vote: voteValue });
      }
    } else {
      if (voteValue === 1) upvotes += 1;
      else downvotes += 1;
      otherVoters.push({ userId: userId as any, vote: voteValue });
    }

    return {
      voters: otherVoters,
      upvotes: Math.max(0, upvotes),
      downvotes: Math.max(0, downvotes),
    };
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

    // Emit POST_UPVOTED domain event asynchronously on upvote
    if (vote === 1 && post.authorId._id.toString() !== userId) {
      userRepository.findUserById(userId).then((upvoter) => {
        eventEmitter.emit('POST_UPVOTED', {
          postId,
          upvoterId: userId,
          recipientId: post.authorId._id.toString(),
          postTitle: post.title || 'Your forum post',
          upvoterName: upvoter?.name || 'Someone',
        });
      }).catch((e) => logger.error('Failed to emit POST_UPVOTED event:', e));
    }

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
