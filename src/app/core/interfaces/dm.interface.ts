export interface DmConversation {
  id: string;
  conversationKey: string;
  memberIds: string[];
  createdAt: number;
  lastMessageAt: number;
}
