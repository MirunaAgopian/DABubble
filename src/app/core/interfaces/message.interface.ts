import { Reaction } from "./reaction.interface";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  targetType: 'dm' | 'channel' | 'self';
  targetId: string;
  reactions: Reaction[];
}