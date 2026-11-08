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
/**
 * Global workspace search for users, channels, and messages.
 * Allows navigating directly to the selected search result.
 */
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

  /**
   * Updates the search value when the user types.
   */
  onInput(event: Event) {
    this.searchValue.set((event.target as HTMLInputElement).value);
  }

  /**
   * Clears the current search query.
   */
  clearSearch() {
    this.searchValue.set('');
  }

  /**
   * Returns matching users based on the current search term.
   */
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

  /**
   * Returns matching channels.
   * Typing "#" displays all channels and further input filters them.
   */
  channelResults = computed<SearchResult[]>(() => {
    const term = this.searchValue().trim().toLowerCase();
    if (!term) return [];
    if (term === '#') {
      return this.channels().map((channel) => ({
        id: channel.id,
        type: 'channel',
        title: channel.name,
        data: channel,
      }));
    }
    const searchTerm = term.startsWith('#') ? term.slice(1) : term;
    return this.channels()
      .filter((channel) => channel.name.toLowerCase().includes(searchTerm))
      .map((channel) => ({
        id: channel.id,
        type: 'channel',
        title: channel.name,
        data: channel,
      }));
  });

  /**
   * Returns messages containing the search term.
   */
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

  /**
   * Combines all available search results into a single list.
   */
  searchResults = computed<SearchResult[]>(() => [
    ...this.userResults(),
    ...this.channelResults(),
    ...this.messageResults(),
  ]);

  /**
   * Opens the selected search result and navigates
   * to the corresponding conversation or message context.
   */
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

  /**
   * Opens the direct message conversation with the selected user.
   */
  private openUserResult(user: User) {
    this.chatStateService.openDM(user);
  }

  /**
   * Opens the selected channel.
   */
  private openChannelResult(channel: Channel) {
    this.chatStateService.openChannel(channel);
  }

  /**
   * Opens the conversation that contains the selected message.
   */
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

  /**
   * Opens the channel containing the selected message.
   */
  private openChannelMessage(message: Message) {
    const channel = this.channels().find((c) => c.id === message.targetId);
    if (channel) {
      this.chatStateService.openChannel(channel);
    }
  }

  /**
   * Opens the user's personal self-chat.
   */
  private openSelfMessage() {
    const user = this.user();
    if (user) {
      this.chatStateService.openSelf(user);
    }
  }

  /**
   * Opens the DM conversation containing the selected message.
   */
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
