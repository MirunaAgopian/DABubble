import { Reaction } from "./reaction.interface";

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
