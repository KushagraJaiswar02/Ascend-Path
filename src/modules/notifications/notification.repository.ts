import { Notification, INotification, NotificationType } from './notification.model';

export const notificationRepository = {
  async createNotification(data: {
    userId: string;
    type: NotificationType;
    message: string;
    link?: string;
  }): Promise<INotification> {
    const notification = new Notification(data);
    return await notification.save();
  },

  async getUserNotifications(userId: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ userId });

    return {
      notifications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
    };
  },

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ userId, isRead: false });
  },

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );
  },

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  },
};
