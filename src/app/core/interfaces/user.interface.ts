export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  provider: 'password' | 'google';
  createdAt: number;
  lastActive: number;
  status: 'online' | 'offline' | 'away';
}
