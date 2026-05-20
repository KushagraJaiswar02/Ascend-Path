export interface Ping {
  _id: string;
  senderId: { _id: string; name: string; avatar?: string };
  receiverId: { _id: string; name: string; avatar?: string };
  question: string;
  context?: string;
  status: 'pending' | 'answered' | 'closed';
  response?: string;
  rating?: number;
  createdAt: string;
}
