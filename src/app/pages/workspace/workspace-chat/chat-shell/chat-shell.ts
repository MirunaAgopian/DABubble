import { Component, output } from '@angular/core';
import { ChatHeaderDm } from '../chat-header/chat-header-dm/chat-header-dm';
import { ChatHeaderGroup } from '../chat-header/chat-header-group/chat-header-group';
import { ChatHeaderNewMessage } from '../chat-header/chat-header-new-message/chat-header-new-message';
import { ChatMessages } from '../chat-messages/chat-messages';
import { ChatInput } from '../chat-input/chat-input';
import { User } from '../../../../core/interfaces/user.interface';

@Component({
  selector: 'app-chat-shell',
  imports: [ChatHeaderDm, ChatHeaderGroup, ChatHeaderNewMessage, ChatMessages, ChatInput],
  templateUrl: './chat-shell.html',
  styleUrl: './chat-shell.scss',
})
export class ChatShell {
  userAdded = output<User>();
  openOverlay  = output<User>();

  onUserAdded(user: User){
    this.userAdded.emit(user);
  }

  onOpenOverlay(user:User){
    this.openOverlay.emit(user);
  }
}
