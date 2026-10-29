import { Reaction } from './reaction.interface';

/**
 * Represents a thread reply belonging
 * to a parent message.
 */
export interface Thread {
  id: string;
  parentMessageId: string;
  text: string;
  userId: string;
  userName: string;
  userAvatar: string;
  createdAt: number;
  reactions?: Reaction[];
}
