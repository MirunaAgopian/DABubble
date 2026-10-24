import { Channel } from "./channel.interface";
import { Message } from "./message.interface";
import { User } from "./user.interface";

export interface SearchResult {
  id: string;
  type: 'user' | 'channel' | 'message';
  title: string;
  subtitle?: string;
  data: User | Channel | Message;
}
