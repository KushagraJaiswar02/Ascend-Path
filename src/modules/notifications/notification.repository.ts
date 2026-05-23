import { Notification, INotification, NotificationType } from './notification.model';

export const notificationRepository = {
  async createNotification(data: {
    recipientId: string;
    actorId?: string;
    type: NotificationType;
    entityId?: string;
    entityType?: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }): Promise<INotification> {
    const notification = new Notification(data);
    return await notification.save();
  },

  async getUserNotifications(userId: string, page: number, limit: number): Promise<any> {
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipientId: userId })
      .populate('actorId', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ recipientId: userId });

    return {
      notifications,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
    };
  },

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ recipientId: userId, read: false });
  },

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { read: true },
      { new: true }
    );
  },

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ recipientId: userId, read: false }, { read: true });
  },
};

