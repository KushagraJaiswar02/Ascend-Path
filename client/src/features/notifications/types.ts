export type NotificationType =
  | 'ping_received'
  | 'ping_answered'
  | 'session_booked'
  | 'session_accepted'
  | 'session_completed'
  | 'review_received'
  | 'roadmap_completed'
  | 'step_completed'
  | 'post_reply'
  | 'post_upvoted'
  | 'guide_followed'
  | 'warning_issued';

export interface Notification {
  _id: string;
  recipientId: string;
  actorId?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: NotificationType;
  entityId?: string;
  entityType?: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

