import { Component, input } from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-chat-messages',
  imports: [],
  templateUrl: './chat-messages.html',
  styleUrl: './chat-messages.scss',
})
export class ChatMessages {
  mode = input<'new' | 'dm' | 'self' | 'channel'>('new');
  selectedUser = input<User | null>(null);
  selectedChannel = input(); //to be deined later with the channel interface
}
