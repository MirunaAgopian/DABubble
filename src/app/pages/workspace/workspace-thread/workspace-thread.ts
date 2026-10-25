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

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.threadSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
    this.selectedMessageSubscription?.unsubscribe();
  }

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

  loadUsers() {
    this.userSubscription?.unsubscribe();
    this.userSubscription = this.userService.getAllUsersRealtime().subscribe((users) => {
      this.users.set(users);
    });
  }

  loadSelectedMessage(messageId: string) {
    this.selectedMessageSubscription?.unsubscribe();
    this.selectedMessageSubscription = this.messageService
      .getMessageByIdRealtime(messageId)
      .subscribe((message) => {
        this.chatStateService.selectedThreadMessage.set(message);
      });
  }

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

  getUserById(userId: string): User | undefined {
    return this.users().find((user) => user.id === userId);
  }

  getFirstReactionUserName(reaction: Reaction): string {
    return this.getUserById(reaction.userIds[0])?.name ?? '';
  }

  getVisibleReactions(reactions: Reaction[] = []) {
    return reactions.slice(0, this.MAX_REACTIONS_DESKTOP);
  }

  onCloseClick() {
    this.closeThread.emit();
    this.chatStateService.selectedThreadMessage.set(null);
  }

  openEditingModeThread(thread: Thread) {
    this.editingMessageId = thread.id;
    this.editedText = thread.text;
  }

  openEditingModeSelectedMessage() {
    this.editingSelectedMessage = true;
    this.editedText = this.selectedMessage()?.text ?? '';
  }

  cancelThreadEditing() {
    this.editingMessageId = null;
    this.editedText = '';
  }

  cancelSelectedMessageEditing() {
    this.editingSelectedMessage = false;
    this.editedText = '';
  }

  async saveEditedThreadMessage(thread: Thread) {
    await this.messageService.updateThread(thread.id, this.editedText);
    this.editingMessageId = null;
    this.cdr.detectChanges();
  }

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

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.nativeElement.scrollTop =
        this.messagesContainer.nativeElement.scrollHeight;
    }
  }

  toggleEmojiPicker(messageId: string) {
    this.openedEmojiPickerMessageId =
      this.openedEmojiPickerMessageId === messageId ? null : messageId;
  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    const insidePicker = target.closest('.emoji-picker-container-chat-messages');
    const emojiButton = target.closest('.reaction-btn-open-emoji-picker');

    if (!insidePicker && !emojiButton) {
      this.openedEmojiPickerMessageId = null;
    }
  }

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

  openUserProfile(senderId: string) {
    const user = this.getUserById(senderId);
    if (user) {
      this.openUserPforileOverlay.emit(user);
    }
  }
}
