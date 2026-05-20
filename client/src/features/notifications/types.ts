export type NotificationType =
  | 'ping_received'
  | 'ping_answered'
  | 'session_booked'
  | 'session_reminder'
  | 'post_reply'
  | 'respect_milestone'
  | 'role_upgrade'
  | 'warning_issued';

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  pages: number;
  page: number;
}
