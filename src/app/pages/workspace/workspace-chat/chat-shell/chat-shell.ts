import { Component } from '@angular/core';
import { ChatHeaderDm } from '../chat-header/chat-header-dm/chat-header-dm';
import { ChatHeaderGroup } from '../chat-header/chat-header-group/chat-header-group';
import { ChatHeaderNewMessage } from '../chat-header/chat-header-new-message/chat-header-new-message';
import { ChatMessages } from '../chat-messages/chat-messages';
import { ChatInput } from '../chat-input/chat-input';

@Component({
  selector: 'app-chat-shell',
  imports: [ChatHeaderDm, ChatHeaderGroup, ChatHeaderNewMessage, ChatMessages, ChatInput],
  templateUrl: './chat-shell.html',
  styleUrl: './chat-shell.scss',
})
export class ChatShell {}
