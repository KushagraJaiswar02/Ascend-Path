import { pingRepository } from './ping.repository';
import { CreatePingInput, RespondPingInput, RatePingInput } from './ping.validation';
import { userRepository } from '../users/user.repository';
import { Role } from '../users/user.model';
import { PingStatus } from './ping.model';
import { respectService } from '../respect/respect.service';
import { RespectReason } from '../respect/respectVote.model';
import { fameService } from '../users/fame.service';
import { notificationService } from '../notifications/notification.service';
import { NotificationType } from '../notifications/notification.model';
import { logger } from '../../utils/logger';

export const pingService = {
  async createPing(fromUserId: string, data: CreatePingInput) {
    if (fromUserId === data.toUserId) {
      throw new Error('You cannot ping yourself');
    }

    const targetUser = await userRepository.findUserById(data.toUserId);
    if (!targetUser) throw new Error('Target user not found');

    if (targetUser.role !== Role.PATHFINDER && targetUser.role !== Role.GUIDE) {
      throw new Error('Target user must be a Pathfinder or Guide');
    }

    const newPing = await pingRepository.createPing({
      fromUserId: fromUserId as any,
      toUserId: data.toUserId as any,
      question: data.question,
      context: data.context,
    });

    // Notify the recipient asynchronously
    notificationService.createNotification({
      userId: data.toUserId,
      type: NotificationType.PING_RECEIVED,
      message: `You have received a new ping request.`,
      link: `/pings/${newPing._id}`
    }).catch((e) => logger.error('Failed to notify recipient of ping:', e));

    return newPing;
  },

  async respondPing(userId: string, pingId: string, data: RespondPingInput) {
    const ping = await pingRepository.getPingById(pingId);
    if (!ping) throw new Error('Ping not found');

    if (ping.toUserId._id.toString() !== userId) {
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
    fameService.updateFameScore(ping.toUserId._id.toString()).catch((e) => logger.error('Failed to update fame score:', e));

    // Notify the sender asynchronously
    notificationService.createNotification({
      userId: ping.fromUserId._id.toString(),
      type: NotificationType.PING_ANSWERED,
      message: `Your ping was answered by the Guide.`,
      link: `/pings/${updatedPing?._id}`
    }).catch((e) => logger.error('Failed to notify sender of ping answer:', e));

    return updatedPing;
  },

  async ratePing(userId: string, pingId: string, data: RatePingInput) {
    const ping = await pingRepository.getPingById(pingId);
    if (!ping) throw new Error('Ping not found');

    if (ping.fromUserId._id.toString() !== userId) {
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
    if (data.rating >= 4) {
      try {
        await respectService.grantOneTimePoints(
          userId,
          ping.toUserId._id.toString(),
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
    const ping = await pingRepository.getPingById(pingId);
    if (!ping) throw new Error('Ping not found');

    if (ping.fromUserId._id.toString() !== userId) {
      throw new Error('Only the sender can close the ping');
    }

    return await pingRepository.updatePing(pingId, {
      status: PingStatus.CLOSED,
    });
  },

  async getPingsSentByUser(userId: string) {
    await pingRepository.autoExpireStalePings();
    return await pingRepository.getPingsSentByUser(userId);
  },

  async getPingsReceivedByUser(userId: string) {
    await pingRepository.autoExpireStalePings();
    return await pingRepository.getPingsReceivedByUser(userId);
  },
};
