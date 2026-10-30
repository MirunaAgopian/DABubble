import {
  Component,
  inject,
  output,
  effect,
  signal,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { ChatInput } from '../workspace-chat/chat-input/chat-input';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { Thread } from '../../../core/interfaces/thread.interface';
import { MessageService } from '../../../core/services/message.service';
import { DatePipe, NgClass } from '@angular/common';
import { User } from '../../../core/interfaces/user.interface';
import { UserService } from '../../../core/services/user.service';
import { Subscription } from 'rxjs';
import { Reaction } from '../../../core/interfaces/reaction.interface';
import { FormsModule } from '@angular/forms';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

/**
 * Dedicated thread workspace for viewing and managing
 * message conversations.
 *
 * Responsible for:
 * - Loading thread replies
 * - Synchronizing the selected parent message
 * - Creating thread interactions
 * - Managing message reactions
 * - Editing messages and replies
 * - Displaying thread participants
 */
@Component({
  selector: 'app-workspace-thread',
  imports: [ChatInput, DatePipe, FormsModule, NgClass, PickerComponent],
  templateUrl: './workspace-thread.html',
  styleUrl: './workspace-thread.scss',
})
export class WorkspaceThread {
  chatStateService = inject(ChatStateService);
  messageService = inject(MessageService);
  userService = inject(UserService);
  closeThread = output<void>();
  threads: Thread[] = [];
  users = signal<User[]>([]);
  currentUser = this.chatStateService.currentUser;
  selectedMessage = this.chatStateService.selectedThreadMessage;
  private userSubscription?: Subscription;
  private threadSubscription?: Subscription;
  private selectedMessageSubscription?: Subscription;
  editingMessageId: string | null = null;
  editedText = '';
  editingSelectedMessage = false;
  private cdr = inject(ChangeDetectorRef);
  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;
  openedEmojiPickerMessageId: string | null = null;
  previousThreadCount = 0;
  MAX_REACTIONS_DESKTOP = 3;
  openUserPforileOverlay = output<User>();

  /**
   * Initializes user data required for thread rendering.
   */
  ngOnInit() {
    this.loadUsers();
  }

  /**
   * Cleans up active subscriptions when the component
   * is destroyed.
   */
  ngOnDestroy() {
    this.threadSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.selectedMessageSubscription?.unsubscribe();
  }

  /**
   * Loads all replies belonging to a thread and
   * automatically scrolls to newly added messages.
   *
   * @param messageId Parent message identifier.
   */
  loadThreads(messageId: string) {
    this.threadSubscription?.unsubscribe();
    this.threadSubscription = this.messageService
      .getThreadsByMessageId(messageId)
      .subscribe((threads) => {
        const shouldScroll = threads.length > this.previousThreadCount;
        this.threads = threads;
        this.previousThreadCount = threads.length;
        this.cdr.detectChanges();
        if (shouldScroll) {
          this.scrollToBottom();
        }
      });
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
   * Subscribes to realtime updates of the currently selected parent message.
   * @param messageId Parent message identifier.
   */
  loadSelectedMessage(messageId: string) {
    this.selectedMessageSubscription?.unsubscribe();
    this.selectedMessageSubscription = this.messageService
      .getMessageByIdRealtime(messageId)
      .subscribe((message) => {
        this.chatStateService.selectedThreadMessage.set(message);
      });
  }

  /**
   * Reacts to changes of the selected thread message
   * and loads the corresponding thread conversation.
   */
  threadEffect = effect(() => {
    const message = this.selectedMessage();
    if (message) {
      this.loadThreads(message.id);
      if (!this.selectedMessageSubscription) {
        this.loadSelectedMessage(message.id);
      }
    } else {
      this.threads = [];
    }
  });

  /**
   * Returns a user by their unique identifier.
   * @param userId User identifier.
   */
  getUserById(userId: string): User | undefined {
    return this.users().find((user) => user.id === userId);
  }

  /**
   * Returns the name of the first user who reacted.
   * @param reaction Reaction data.
   */
  getFirstReactionUserName(reaction: Reaction): string {
    return this.getUserById(reaction.userIds[0])?.name ?? '';
  }

  /**
   * Returns the reactions visible in the initial reaction list.
   * @param reactions Thread reactions.
   */
  getVisibleReactions(reactions: Reaction[] = []) {
    return reactions.slice(0, this.MAX_REACTIONS_DESKTOP);
  }

  /**
   * Closes the thread workspace and clears the currently selected thread message.
   */
  onCloseClick() {
    this.closeThread.emit();
    this.chatStateService.selectedThreadMessage.set(null);
  }

  /**
   * Enables editing mode for a thread reply.
   * @param thread Reply to edit.
   */
  openEditingModeThread(thread: Thread) {
    this.editingMessageId = thread.id;
    this.editedText = thread.text;
  }

  /**
   * Enables editing mode for the selected parent message.
   */
  openEditingModeSelectedMessage() {
    this.editingSelectedMessage = true;
    this.editedText = this.selectedMessage()?.text ?? '';
  }

  /**
   * Cancels thread reply editing.
   */
  cancelThreadEditing() {
    this.editingMessageId = null;
    this.editedText = '';
  }

  /**
   * Cancels parent message editing.
   */
  cancelSelectedMessageEditing() {
    this.editingSelectedMessage = false;
    this.editedText = '';
  }

  /**
   * Saves changes made to a thread reply and refreshes the view.
   * @param thread Updated thread reply.
   */
  async saveEditedThreadMessage(thread: Thread) {
    await this.messageService.updateThread(thread.id, this.editedText);
    this.editingMessageId = null;
    this.cdr.detectChanges();
  }

  /**
   * Persists edits to the selected parent message and
   * synchronizes the shared thread state.
   *
   * The selected thread message is updated manually to
   * ensure all thread-related views immediately display
   * the latest content after the update completes.
   */
  async saveEditedSelectedMessage() {
    const message = this.selectedMessage();
    if (!message) return;
    await this.messageService.updateMessage(message.id, this.editedText);
    this.chatStateService.selectedThreadMessage.set({
      ...message,
      text: this.editedText,
    });
    this.editingSelectedMessage = false;
    this.editedText = '';
    this.cdr.detectChanges();
  }

  /**
   * Scrolls the thread message container to the
   * latest reply.
   */
  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
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
   * Closes the emoji picker when the user clicks outside the picker area.
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
   * Adds or removes a reaction from the selected parent message.
   * @param emoji Selected emoji.
   */
  async toggleSelectedMessageReaction(emoji: string) {
    const currentUser = this.currentUser();
    const selectedMessage = this.selectedMessage();
    if (!currentUser || !selectedMessage) return;
    const existingReaction = selectedMessage.reactions?.find(
      (reaction) => reaction.emoji === emoji,
    );
    const hasReacted = existingReaction?.userIds.includes(currentUser.id);
    if (hasReacted) {
      await this.messageService.removeReaction(selectedMessage.id, emoji, currentUser.id);
    } else {
      await this.messageService.addReaction(selectedMessage.id, emoji, currentUser.id);
    }
  }

  /**
   * Adds or removes a reaction from a thread reply.
   * @param thread Target reply.
   * @param emoji Selected emoji.
   */
  async toggleThreadReaction(thread: Thread, emoji: string) {
    const currentUser = this.currentUser();
    if (!currentUser) return;
    const existingReaction = thread.reactions?.find((reaction) => reaction.emoji === emoji);
    const hasReacted = existingReaction?.userIds.includes(currentUser.id);
    if (hasReacted) {
      await this.messageService.removeThreadReaction(thread.id, emoji, currentUser.id);
    } else {
      await this.messageService.addThreadReaction(thread.id, emoji, currentUser.id);
    }
  }

  /**
   * Opens the profile overlay for a thread participant.
   * @param senderId User identifier.
   */
  openUserProfile(senderId: string) {
    const user = this.getUserById(senderId);
    if (user) {
      this.openUserPforileOverlay.emit(user);
    }
  }
}
