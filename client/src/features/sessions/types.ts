export interface Session {
  _id: string;
  guideId: { _id: string; name: string; avatar?: string };
  explorerId?: { _id: string; name: string; avatar?: string };
  topic: string;
  description: string;
  scheduledAt: string;
  duration: number;
  price: number;
  status: 'open' | 'booked' | 'completed' | 'cancelled';
  meetingLink?: string;
  rating?: number;
  createdAt: string;
}
