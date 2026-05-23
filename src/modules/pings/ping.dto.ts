import { IPingRequest } from './ping.model';

export interface PingUserDTO {
  _id: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface PingDTO {
  _id: string;
  senderId: PingUserDTO;
  receiverId: PingUserDTO;
  question: string;
  context?: string;
  status: 'pending' | 'answered' | 'closed' | 'expired';
  response?: string;
  rating?: number;
  createdAt: string;
  expiresAt: string;
}

export const toPingUserDTO = (user: any): PingUserDTO => {
  if (!user) {
    return {
      _id: 'deleted-user',
      name: 'Deleted User',
      avatar: '',
      role: 'unknown',
    };
  }

  // Handle case where user is not populated and only ID is returned
  if (typeof user === 'string' || user instanceof Object && !user.name) {
    return {
      _id: user.toString(),
      name: 'User',
      avatar: '',
      role: 'unknown',
    };
  }

  return {
    _id: user._id.toString(),
    name: user.name || 'User',
    avatar: user.avatar || '',
    role: user.role || 'unknown',
  };
};

export const toPingDTO = (ping: IPingRequest): PingDTO => {
  return {
    _id: ping._id.toString(),
    senderId: toPingUserDTO(ping.fromUserId),
    receiverId: toPingUserDTO(ping.toUserId),
    question: ping.question,
    context: ping.context || undefined,
    status: ping.status,
    response: ping.response || undefined,
    rating: ping.responseRating || undefined,
    createdAt: ping.createdAt.toISOString(),
    expiresAt: ping.expiresAt.toISOString(),
  };
};

export const toPingDTOs = (pings: IPingRequest[]): PingDTO[] => {
  return pings.map((ping) => toPingDTO(ping));
};
