import { notificationRepository } from './notification.repository';
import { NotificationType } from './notification.model';

export const notificationService = {
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    message: string;
    link?: string;
  }) {
    // Avoid sending notification to self (e.g. answering own post)
    // Wait, caller should handle this, but it's safe to check if needed.
    // We will just create it here. Caller decides logic.
    return await notificationRepository.createNotification(data);
  },

  async getUserNotifications(userId: string, page: number, limit: number) {
    return await notificationRepository.getUserNotifications(userId, page, limit);
  },

  async getUnreadCount(userId: string) {
    return await notificationRepository.getUnreadCount(userId);
  },

  async markAsRead(userId: string, notificationId: string) {
    const notification = await notificationRepository.markAsRead(notificationId, userId);
    if (!notification) {
      throw new Error('Notification not found or unauthorized');
    }
    return notification;
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  },
};
