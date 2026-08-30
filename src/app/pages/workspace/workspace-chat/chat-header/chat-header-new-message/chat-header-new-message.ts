import { Component, inject,output } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { UserService } from '../../../../../core/services/user.service';
import { ChannelService } from '../../../../../core/services/channel.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-chat-header-new-message',
  imports: [],
  templateUrl: './chat-header-new-message.html',
  styleUrl: './chat-header-new-message.scss',
})
export class ChatHeaderNewMessage {
  chatStateService = inject(ChatStateService);
  userService = inject(UserService);
  channelService = inject(ChannelService);
  channels = toSignal(this.channelService.fetchChannels());
  users = toSignal(this.userService.getAllUsersRealtime());
  openOverlay = output<'new-message'>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    if (!value) {
      this.chatStateService.toggleSendTo(false);
      this.chatStateService.setMentionedEntity(null);
      return;
    }

    const startsWithAt = value.startsWith('@');
    const startsWithHash = value.startsWith('#');
    const looksLikeEmail = value.includes('@') && value.includes('.');

    if (startsWithAt) {
      this.chatStateService.toggleSendTo(true);
      this.chatStateService.setMentionedEntity('user');
    } else if (startsWithHash) {
      this.chatStateService.toggleSendTo(true);
      this.chatStateService.setMentionedEntity('channel');
    } else if (looksLikeEmail) {
      this.chatStateService.toggleSendTo(true);
      this.chatStateService.setMentionedEntity('email');
    } else {
      this.chatStateService.toggleSendTo(false);
      this.chatStateService.setMentionedEntity(null);
    }
  }

  deleteInput(input: HTMLInputElement) {
    input.value = '';
    this.chatStateService.toggleSendTo(false);
    this.chatStateService.setMentionedEntity(null);
  }
}
