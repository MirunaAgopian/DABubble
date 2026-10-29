import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { Channel } from '../interfaces/channel.interface';
import { ChannelService } from './channel.service';
import { Subscription } from 'rxjs';
import { Message } from '../interfaces/message.interface';

/**
 * Centralized state manager for the active workspace.
 *
 * Handles navigation between channels, direct messages,
 * self chats and threads while providing shared application
 * state through Angular Signals.
 */
@Injectable({
  providedIn: 'root',
})
export class ChatStateService {
  /**
   * Represents the currently active conversation type.
   */
  mode = signal<'new' | 'dm' | 'self' | 'channel'>('new');

  /**
   * Controls the active mobile view.
   */
  mobileView = signal<'sidebar' | 'chat' | 'thread'>('sidebar');

  /**
   * Stores the currently logged-in user.
   */
  currentUser = signal<User | null>(null);

  /**
   * Stores the user of the currently
   * active direct message conversation.
   */
  selectedUser = signal<User | null>(null);

  /**
   * Stores the currently selected channel.
   */
  selectedChannel = signal<Channel | null>(null);

  /**
   * Stores the currently selected thread message.
   */
  selectedThreadMessage = signal<Message | null>(null);

  /**
   * Controls the visibility of the recipient selection area when creating a new message.
   */
  showSendTo = signal(false);

  /**
   * Controls whether user, channel, or email suggestions should be displayed.
   */
  mentionSomeone = signal<'user' | 'channel' | 'email' | null>(null);

  /**
   * Provides realtime channel data and channel management methods.
   */
  channelService = inject(ChannelService);

  /**
   * Maintains the active realtime channel subscription.
   */
  private channelSubscription?: Subscription;

  /**
   * Opens a direct message conversation
   * with the selected user.
   */
  openDM(user: User) {
    this.mode.set('dm');
    this.selectedUser.set(user);
    this.selectedChannel.set(null);
    this.selectedThreadMessage.set(null);
    this.mobileView.set('chat');
  }

  /**
   * Opens the current user's personal notes, in a conversation with themselves.
   */
  openSelf(user: User) {
    this.mode.set('self');
    this.selectedUser.set(user);
    this.selectedChannel.set(null);
    this.selectedThreadMessage.set(null);
    this.mobileView.set('chat');
  }

  /**
   * Opens a channel and subscribes to realtime channel updates.
   *  This ensures that member changes, channel updates and other channel
   * information remain synchronized while the channel is active.
   */
  openChannel(channel: Channel) {
    this.channelSubscription?.unsubscribe();
    this.mode.set('channel');
    this.selectedUser.set(null);
    this.channelSubscription = this.channelService
      .fetchChannelById(channel.id)
      .subscribe((updatedChannel) => {
        this.selectedChannel.set(updatedChannel);
      });
    this.selectedThreadMessage.set(null);
    this.mobileView.set('chat');
  }

  /**
   * Resets the current selection and starts a new message workflow.
   */
  startNewMessage() {
    this.mode.set('new');
    this.selectedUser.set(null);
    this.selectedChannel.set(null);
    this.selectedThreadMessage.set(null);
    this.mobileView.set('chat');
  }

  /**
   * Generates the input placeholder
   * based on the active conversation type.
   */
  placeholder = computed(() => {
    switch (this.mode()) {
      case 'dm':
        return `Nachricht an @${this.selectedUser()?.name}`;
      case 'self':
        return 'Notiz an dich selbst…';
      case 'channel':
        return `Nachricht an #${this.selectedChannel()?.name}`;
      case 'new':
        return 'Starte eine neue Nachricht';
      default:
        return '';
    }
  });

  /**
   * Controls the visibility of the recipient selection area.
   */
  toggleSendTo(show: boolean) {
    this.showSendTo.set(show);
  }

  /**
   * Stores the entity type currently
   * being mentioned in the message input.
   */
  setMentionedEntity(mode: 'user' | 'channel' | 'email' | null) {
    this.mentionSomeone.set(mode);
  }

  /**
   * Resets the complete workspace state
   * and removes active subscriptions.
   */
  resetChatState() {
    this.mode.set('new');
    this.selectedUser.set(null);
    this.selectedChannel.set(null);
    this.selectedThreadMessage.set(null);
    this.showSendTo.set(false);
    this.mentionSomeone.set(null);
    this.channelSubscription?.unsubscribe();
    this.mobileView.set('sidebar');
  }
}
