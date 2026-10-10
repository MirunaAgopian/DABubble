import { Reaction } from './reaction.interface';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  targetType: 'dm' | 'channel' | 'self';
  targetId: string;
  reactions?: Reaction[];
  mentionUserIds?: string[];
}

// senderID JtOW4O9q0LWgaFCqXekvI2jAoPe2
//targetId jk5CiCabs4f0Nailu0JCu6rzyVq1 - elias neumann

