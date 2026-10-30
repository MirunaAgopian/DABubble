import { Component, inject, signal, HostListener, ChangeDetectorRef, output } from '@angular/core';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Message } from '../../../../core/interfaces/message.interface';
import { MessageService } from '../../../../core/services/message.service';
import { Subscription } from 'rxjs';
import { User } from '../../../../core/interfaces/user.interface';
import { UserService } from '../../../../core/services/user.service';
import { DatePipe } from '@angular/common';
import { effect } from '@angular/core';
import { DmConversationService } from '../../../../core/services/dm-conversation.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Reaction } from '../../../../core/interfaces/reaction.interface';
import { FormsModule } from '@angular/forms';

/**
 * Displays and manages the active conversation.
 *
 * Responsible for:
 * - Loading channel, direct message and self-chat messages
 * - Rendering the message history
 * - Managing message reactions
 * - Handling message editing
 * - Displaying thread information
 * - Opening user profiles and threads
 * - Coordinating message-related interactions
 */
@Component({
  selector: 'app-chat-messages',
  imports: [DatePipe, PickerComponent, FormsModule],
  templateUrl: './chat-messages.html',
  styleUrl: './chat-messages.scss',
})
export class ChatMessages {
  chatStateService = inject(ChatStateService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  dmConversationService = inject(DmConversationService);
  userService = inject(UserService);
  mode = this.chatStateService.mode;
  selectedUser = this.chatStateService.selectedUser;
  selectedChannel = this.chatStateService.selectedChannel;
  currentUser = this.chatStateService.currentUser;
  messages = signal<Message[]>([]);
  users = signal<User[]>([]);
  private messageSubscription?: Subscription;
  private userSubscription?: Subscription;
  private cdr = inject(ChangeDetectorRef);
  openedEmojiPickerMessageId: string | null = null;
  editingMessageId: string | null = null;
  editedText = '';
  threadStats: Record<string, { replyCount: number; lastReplyTimestamp: number | null }> = {};
  messagesUpdated = output<void>();
  previousMessageCount = 0;
  readonly MAX_REACTIONS_DESKTOP = 5;
  openUserPforileOverlay = output<User>();

  /**
   * Initializes user data required for message rendering.
   */
  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Cleans up active subscriptions when the component
   * is destroyed.
   */
  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  /**
   * Loads all users for sender, reaction and profile lookup.
   */
  loadUsers() {
    this.userSubscription?.unsubscribe();
    this.userSubscription = this.userService.getAllUsersRealtime().subscribe((users) => {
      this.users.set(users);
    });
  }

  /**
   * Loads messages for the specified conversation target.
   * @param targetType Conversation type.
   * @param targetId Conversation identifier.
   */
  loadMessages(targetType: 'dm' | 'self' | 'channel', targetId: string) {
    this.messageSubscription?.unsubscribe();
    this.messageSubscription = this.messageService
      .getMessages(targetType, targetId)
      .subscribe((messages) => {
        const shouldScroll = messages.length > this.previousMessageCount;
        this.messages.set(messages);
        this.previousMessageCount = messages.length;
        messages.forEach((message) => {
          this.loadThreadStats(message.id);
        });
        if (shouldScroll) {
          this.messagesUpdated.emit();
        }
      });
  }

  /**
   * Returns a user by their unique identifier.
   * @param userId User identifier.
   */
  getUserById(userId: string): User | undefined {
    return this.users().find((user) => user.id === userId);
  }

  /**
   * Opens or creates a direct message conversation
   * with the selected user.
   * @param userId User identifier.
   */
  async openDM(userId: string) {
    const currentUser = this.currentUser();
    if (!currentUser) return;
    const dm = await this.dmConversationService.getOrCreateDM(currentUser.id, userId);
    this.loadMessages('dm', dm.id);
  }

  /**
   * Reacts to chat mode changes and loads the
   * corresponding conversation data.
   */
  loadMessagesEffect = effect(() => {
    const mode = this.mode();
    if (mode === 'new') {
      this.messageSubscription?.unsubscribe();
      this.messages.set([]);
      this.previousMessageCount = 0;
    }
    if (mode === 'channel') {
      const channel = this.selectedChannel();
      if (channel) {
        this.loadMessages('channel', channel.id);
      }
    }
    if (mode === 'self') {
      const user = this.selectedUser();
      if (user) {
        this.loadMessages('self', user.id);
      }
    }
    if (mode === 'dm') {
      const user = this.selectedUser();
      if (user) {
        this.openDM(user.id);
      }
    }
  });

  /**
   * Creates a day key used for grouping messages by date.
   * @param timestamp Message timestamp.
   */
  private getDayKey(timestamp: number): string {
    return new Date(timestamp).toDateString();
  }

  /**
   * Determines whether a date separator should be shown
   * before the message at the given index.
   * @param index Message index.
   */
  shouldShowDateSeparator(index: number): boolean {
    const messages = this.messages();
    if (index === 0) {
      return true;
    }
    return (
      this.getDayKey(messages[index].createdAt) !== this.getDayKey(messages[index - 1].createdAt)
    );
  }

  /**
   * Formats the date displayed inside a separator.
   * @param timestamp Date timestamp.
   */
  formatSeparatorDate(timestamp: number): string {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(timestamp);
  }

  /**
   * Opens or closes the emoji picker for a message.
   * @param messageId Message identifier.
   */
  toggleEmojiPicker(messageId: string) {
    this.openedEmojiPickerMessageId =
      this.openedEmojiPickerMessageId === messageId ? null : messageId;
  }

  /**
   * Closes the emoji picker when the user clicks
   * outside the picker area.
   * @param event Click event.
   */
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const insidePicker = target.closest('.emoji-picker-container-chat-messages');
    const emojiButton = target.closest('.reaction-btn-open-emoji-picker');

    if (!insidePicker && !emojiButton) {
      this.openedEmojiPickerMessageId = null;
    }
  }

  /**
   * Adds or removes a reaction for the current user.
   * @param message Target*message.
   * @param emoji Selected *moji.
   */
  async toggleReaction(message: Message, emoji: string) {
    const currentUser = this.currentUser();
    if (!currentUser) return;
    const existingReaction = message.reactions?.find((reaction) => reaction.emoji == emoji);
    const hasReacted = existingReaction?.userIds.includes(currentUser.id);
    if (hasReacted) {
      await this.messageService.removeReaction(message.id, emoji, currentUser.id);
    } else {
      await this.messageService.addReaction(message.id, emoji, currentUser.id);
    }
  }

  /**
   * Returns the name of the first user who reacted.
   * @param reaction*Reaction data.
   */
  getFirstReactionUserName(reaction: Reaction): string {
    return this.getUserById(reaction.userIds[0])?.name ?? '';
  }

  /**
   * Returns the number of additional users who reacted
   * @param reaction Reaction data.
   */
  getAdditionalReactionCount(reaction: Reaction): number {
    return Math.max(reaction.userIds.length - 1, 0);
  }

  /**
   * Returns the reactions visible in the initial reaction list.
   * @param reactions Message reactions.
   */
  getVisibleReactions(reactions: Reaction[] = []) {
    return reactions.slice(0, this.MAX_REACTIONS_DESKTOP);
  }

  /**
   * Enables editing mode for the selected message.
   * @param message - Message to edit.
   */
  openEditingMode(message: Message) {
    this.editingMessageId = message.id;
    this.editedText = message.text;
  }

  /**
   * Cancels message editing and restores the default state.
   */
  cancelEditing() {
    this.editingMessageId = null;
    this.editedText = '';
  }

  /**
   * Persists message edits and synchronizes the thread view
   * when the edited message is currently opened as a thread.
   *
   * After updating the message in the database, the method
   * updates the selected thread message in the shared chat
   * state to ensure both views display the latest content.
   * Change detection is triggered manually to immediately
   * reflect the update in the UI.
   *
   * @param message Message being edited.
   */
  async saveEditedMessage(message: Message) {
    await this.messageService.updateMessage(message.id, this.editedText);
    const selected = this.chatStateService.selectedThreadMessage();
    if (selected?.id === message.id) {
      this.chatStateService.selectedThreadMessage.set({
        ...selected,
        text: this.editedText,
      });
    }
    this.editingMessageId = null;
    this.cdr.detectChanges();
  }

  /**
   * Opens the thread view for a message.
   * @param message - Parent message.
   */
  openThread(message: Message) {
    this.chatStateService.selectedThreadMessage.set(message);
    this.chatStateService.mobileView.set('thread');
  }

  /**
   * Opens the thread view for a message.
   * @param message Parent message.
   */
  loadThreadStats(messageId: string) {
    this.messageService.getThreadStats(messageId).subscribe((stats) => {
      this.threadStats[messageId] = stats as {
        replyCount: number;
        lastReplyTimestamp: number | null;
      };
      this.cdr.detectChanges();
    });
  }

  /**
   * Opens the profile overlay for a message sender.
   * @param senderId Sender identifier.
   */
  openUserProfile(senderId: string) {
    const user = this.getUserById(senderId);
    if (user) {
      this.openUserPforileOverlay.emit(user);
    }
  }
}
