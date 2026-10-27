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

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  loadUsers() {
    this.userSubscription?.unsubscribe();
    this.userSubscription = this.userService.getAllUsersRealtime().subscribe((users) => {
      this.users.set(users);
    });
  }

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

  getUserById(userId: string): User | undefined {
    return this.users().find((user) => user.id === userId);
  }

  async openDM(userId: string) {
    const currentUser = this.currentUser();
    if (!currentUser) return;
    const dm = await this.dmConversationService.getOrCreateDM(currentUser.id, userId);
    this.loadMessages('dm', dm.id);
  }

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

  private getDayKey(timestamp: number): string {
    return new Date(timestamp).toDateString();
  }

  shouldShowDateSeparator(index: number): boolean {
    const messages = this.messages();
    if (index === 0) {
      return true;
    }
    return (
      this.getDayKey(messages[index].createdAt) !== this.getDayKey(messages[index - 1].createdAt)
    );
  }

  formatSeparatorDate(timestamp: number): string {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(timestamp);
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

  getFirstReactionUserName(reaction: Reaction): string {
    return this.getUserById(reaction.userIds[0])?.name ?? '';
  }

  getAdditionalReactionCount(reaction: Reaction): number {
    return Math.max(reaction.userIds.length - 1, 0);
  }

  getVisibleReactions(reactions: Reaction[] = []) {
    return reactions.slice(0, this.MAX_REACTIONS_DESKTOP);
  }

  openEditingMode(message: Message) {
    this.editingMessageId = message.id;
    this.editedText = message.text;
  }

  cancelEditing() {
    this.editingMessageId = null;
    this.editedText = '';
  }

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

  openThread(message: Message) {
    this.chatStateService.selectedThreadMessage.set(message);
    this.chatStateService.mobileView.set('thread');
  }

  loadThreadStats(messageId: string) {
    this.messageService.getThreadStats(messageId).subscribe((stats) => {
      this.threadStats[messageId] = stats as {
        replyCount: number;
        lastReplyTimestamp: number | null;
      };
      this.cdr.detectChanges();
    });
  }

  openUserProfile(senderId: string) {
    const user = this.getUserById(senderId);
    if (user) {
      this.openUserPforileOverlay.emit(user);
    }
  }

}
