import { Component, signal, computed, inject, input } from '@angular/core';
import { InputIcon } from '../input-icon/input-icon';
import { SearchResult } from '../../../core/interfaces/search.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from '../../../core/services/user.service';
import { ChannelService } from '../../../core/services/channel.service';
import { MessageService } from '../../../core/services/message.service';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { DmConversationService } from '../../../core/services/dm-conversation.service';
import { User } from '../../../core/interfaces/user.interface';
import { Channel } from '../../../core/interfaces/channel.interface';
import { Message } from '../../../core/interfaces/message.interface';

@Component({
  selector: 'app-workspace-search',
  imports: [InputIcon],
  templateUrl: './workspace-search.html',
  styleUrl: './workspace-search.scss',
})
export class WorkspaceSearch {
  searchValue = signal('');
  user = input<User | null>();
  selectedIndex = signal(0);
  userService = inject(UserService);
  channelService = inject(ChannelService);
  messageSevice = inject(MessageService);
  chatStateService = inject(ChatStateService);
  dmConversationService = inject(DmConversationService);
  users = toSignal(this.userService.getAllUsersRealtime(), { initialValue: [] });
  channels = toSignal(this.channelService.fetchChannels(), { initialValue: [] });
  messages = toSignal(this.messageSevice.getAllMessages(), { initialValue: [] });

  onInput(event: Event) {
    this.searchValue.set((event.target as HTMLInputElement).value);
  }

  clearSearch() {
    this.searchValue.set('');
  }

  userResults = computed<SearchResult[]>(() => {
    const term = this.searchValue().toLowerCase().trim();
    if (!term) return [];
    return this.users()
      .filter(
        (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term),
      )
      .map((user) => ({
        id: user.id,
        type: 'user',
        title: user.name,
        subtitle: user.email,
        data: user,
      }));
  });

  channelResults = computed<SearchResult[]>(() => {
    const term = this.searchValue().toLowerCase().trim();
    if (!term) return [];
    return this.channels()
      .filter((channel) => channel.name.toLowerCase().includes(term))
      .map((channel) => ({
        id: channel.id,
        type: 'channel',
        title: `# ${channel.name}`,
        data: channel,
      }));
  });

  messageResults = computed<SearchResult[]>(() => {
    const term = this.searchValue().toLowerCase().trim();
    if (!term) return [];
    return this.messages()
      .filter((message) => message.text.toLowerCase().includes(term))
      .map((message) => ({
        id: message.id,
        type: 'message',
        title: message.text,
        data: message,
      }));
  });

  searchResults = computed<SearchResult[]>(() => [
    ...this.userResults(),
    ...this.channelResults(),
    ...this.messageResults(),
  ]);

  async onSearchResultClick(result: SearchResult) {
    switch (result.type) {
      case 'user':
        this.openUserResult(result.data as User);
        break;

      case 'channel':
        this.openChannelResult(result.data as Channel);
        break;

      case 'message':
        await this.openMessageResult(result.data as Message);
        break;
    }

    this.clearSearch();
  }

  private openUserResult(user: User) {
    this.chatStateService.openDM(user);
  }

  private openChannelResult(channel: Channel) {
    this.chatStateService.openChannel(channel);
  }

  private async openMessageResult(message: Message) {
    switch (message.targetType) {
      case 'channel':
        this.openChannelMessage(message);
        break;

      case 'self':
        this.openSelfMessage();
        break;

      case 'dm':
        await this.openDmMessage(message);
        break;
    }
  }

  private openChannelMessage(message: Message) {
    const channel = this.channels().find((c) => c.id === message.targetId);
    if (channel) {
      this.chatStateService.openChannel(channel);
    }
  }

  private openSelfMessage() {
    const user = this.user();
    if (user) {
      this.chatStateService.openSelf(user);
    }
  }

  private async openDmMessage(message: Message) {
    const conversation = await this.dmConversationService.getConversationById(message.targetId);
    const currentUserId = this.user()?.id;
    const otherUserId = conversation?.memberIds.find((id) => id !== currentUserId);
    const otherUser = this.users().find((user) => user.id === otherUserId);
    if (otherUser) {
      this.chatStateService.openDM(otherUser);
    }
  }
}
