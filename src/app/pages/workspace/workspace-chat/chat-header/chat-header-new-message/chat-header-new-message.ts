import { Component, inject, output, signal, computed } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { UserService } from '../../../../../core/services/user.service';
import { ChannelService } from '../../../../../core/services/channel.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Channel } from '../../../../../core/interfaces/channel.interface';
import { User } from '../../../../../core/interfaces/user.interface';

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
  searchValue = signal('');
  openOverlay = output<'new-message'>();

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchValue.set(value);
    if (!value) {
      this.chatStateService.toggleSendTo(false);
      this.chatStateService.setMentionedEntity(null);
      return;
    }

    const startsWithAt = value.startsWith('@');
    const startsWithHash = value.startsWith('#');
    const matchesEmail = this.users()?.some((user) =>
      user.email.toLowerCase().includes(value.toLowerCase()),
    );

    if (startsWithAt) {
      this.chatStateService.toggleSendTo(true);
      this.chatStateService.setMentionedEntity('user');
    } else if (startsWithHash) {
      this.chatStateService.toggleSendTo(true);
      this.chatStateService.setMentionedEntity('channel');
    } else if (matchesEmail) {
      this.chatStateService.toggleSendTo(true);
      this.chatStateService.setMentionedEntity('email');
    } else {
      this.chatStateService.toggleSendTo(false);
      this.chatStateService.setMentionedEntity(null);
    }
  }

  emailResults = computed(() => {
    const term = this.searchValue().toLowerCase();
    return this.users()?.filter((user) => user.email.toLowerCase().includes(term)) ?? [];
  });

  deleteInput(input: HTMLInputElement) {
    input.value = '';
    this.chatStateService.toggleSendTo(false);
    this.chatStateService.setMentionedEntity(null);
  }

  onClick(item: User | Channel) {
    if (
      this.chatStateService.mentionSomeone() === 'user' ||
      this.chatStateService.mentionSomeone() === 'email'
    ) {
      this.chatStateService.openDM(item as User);
    }

    if (this.chatStateService.mentionSomeone() === 'channel') {
      this.chatStateService.openChannel(item as Channel);
    }
    this.chatStateService.toggleSendTo(false);
  }
}
