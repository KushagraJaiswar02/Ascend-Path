import { pingRepository } from './ping.repository';
import { CreatePingInput, RespondPingInput, RatePingInput } from './ping.validation';
import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { PingStatus } from './ping.model';
import { respectService } from '../respect/respect.service';
import { RespectReason } from '../respect/respectVote.model';
import { fameService } from '../users/fame.service';
import { eventEmitter } from '../../utils/eventEmitter';
import { logger } from '../../utils/logger';

export const pingService = {
  async createPing(fromUserId: string, data: CreatePingInput) {
    const fromUserIdStr = fromUserId.toString();
    if (fromUserIdStr === data.toUserId.toString()) {
      throw new Error('You cannot ping yourself');
    }

    const targetUser = await userRepository.findUserById(data.toUserId);
    if (!targetUser) throw new Error('Target user not found');

    if (targetUser.role !== Role.PATHFINDER && targetUser.role !== Role.GUIDE) {
      throw new Error('Target user must be a Pathfinder or Guide');
    }

    const newPing = await pingRepository.createPing({
      fromUserId: fromUserIdStr as any,
      toUserId: data.toUserId as any,
      question: data.question,
      context: data.context,
    });

    // Notify the recipient asynchronously by emitting a domain event
    userRepository.findUserById(fromUserIdStr).then((sender) => {
      eventEmitter.emit('PING_RECEIVED', {
        pingId: newPing._id.toString(),
        senderId: fromUserIdStr,
        recipientId: data.toUserId,
        message: data.question,
        senderName: sender?.name || 'A learner',
      });
    }).catch((e) => logger.error('Failed to emit PING_RECEIVED event:', e));

    return newPing;
  },

  async respondPing(userId: string, pingId: string, data: RespondPingInput) {
    const userIdStr = userId.toString();
    const ping = await pingRepository.getPingById(pingId);
    if (!ping) throw new Error('Ping not found');

    const fromUserIdStr = ping.fromUserId ? (typeof ping.fromUserId === 'string' ? ping.fromUserId : (ping.fromUserId as any)._id?.toString()) : null;
    const toUserIdStr = ping.toUserId ? (typeof ping.toUserId === 'string' ? ping.toUserId : (ping.toUserId as any)._id?.toString()) : null;

    if (!toUserIdStr || toUserIdStr !== userIdStr) {
      throw new Error('Only the recipient can respond to this ping');
    }

    if (ping.status === PingStatus.EXPIRED) {
      throw new Error('This ping has expired');
    }

    if (ping.status !== PingStatus.PENDING) {
      throw new Error('This ping has already been answered or closed');
    }

    const updatedPing = await pingRepository.updatePing(pingId, {
      response: data.response,
      status: PingStatus.ANSWERED,
    });

    // Update fame score asynchronously
    if (toUserIdStr) {
      fameService.updateFameScore(toUserIdStr).catch((e) => logger.error('Failed to update fame score:', e));
    }

    // Notify the sender asynchronously by emitting a domain event
    userRepository.findUserById(userIdStr).then((responder) => {
      eventEmitter.emit('PING_ANSWERED', {
        pingId: updatedPing?._id.toString() || pingId,
        senderId: userIdStr,
        recipientId: fromUserIdStr || 'deleted-user',
        answer: data.response,
        senderName: responder?.name || 'Your guide',
      });
    }).catch((e) => logger.error('Failed to emit PING_ANSWERED event:', e));

    return updatedPing;
  },

  async ratePing(userId: string, pingId: string, data: RatePingInput) {
    const userIdStr = userId.toString();
    const ping = await pingRepository.getPingById(pingId);
    if (!ping) throw new Error('Ping not found');

    const fromUserIdStr = ping.fromUserId ? (typeof ping.fromUserId === 'string' ? ping.fromUserId : (ping.fromUserId as any)._id?.toString()) : null;
    const toUserIdStr = ping.toUserId ? (typeof ping.toUserId === 'string' ? ping.toUserId : (ping.toUserId as any)._id?.toString()) : null;

    if (!fromUserIdStr || fromUserIdStr !== userIdStr) {
      throw new Error('Only the sender can rate the response');
    }

    if (ping.status !== PingStatus.ANSWERED && ping.status !== PingStatus.CLOSED) {
      throw new Error('You can only rate answered pings');
    }

    const updatedPing = await pingRepository.updatePing(pingId, {
      responseRating: data.rating,
      status: PingStatus.CLOSED, // Auto close on rate
    });

    // Hook into respect system
    if (data.rating >= 4 && toUserIdStr) {
      try {
        await respectService.grantOneTimePoints(
          userIdStr,
          toUserIdStr,
          pingId,
          RespectReason.PING_RESPONSE,
          15
        );
      } catch (e) {
        // Ignored if already awarded
      }
    }

    return updatedPing;
  },

  async closePing(userId: string, pingId: string) {
    const userIdStr = userId.toString();
    const ping = await pingRepository.getPingById(pingId);
    if (!ping) throw new Error('Ping not found');

    const fromUserIdStr = ping.fromUserId ? (typeof ping.fromUserId === 'string' ? ping.fromUserId : (ping.fromUserId as any)._id?.toString()) : null;

    if (!fromUserIdStr || fromUserIdStr !== userIdStr) {
      throw new Error('Only the sender can close the ping');
    }

    return await pingRepository.updatePing(pingId, {
      status: PingStatus.CLOSED,
    });
  },

  async getPingsSentByUser(userId: string) {
    await pingRepository.autoExpireStalePings();
    return await pingRepository.getPingsSentByUser(userId.toString());
  },

  async getPingsReceivedByUser(userId: string) {
    await pingRepository.autoExpireStalePings();
    return await pingRepository.getPingsReceivedByUser(userId.toString());
  },
};
