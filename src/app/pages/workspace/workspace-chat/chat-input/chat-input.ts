import {
  Component,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  HostListener,
  inject,
  input,
  computed,
  effect,
} from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { User } from '../../../../core/interfaces/user.interface';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { MessageService } from '../../../../core/services/message.service';
import { DmConversationService } from '../../../../core/services/dm-conversation.service';

/**
 * Message composition component used for both the main chat
 * area and thread conversations.
 *
 * Responsible for:
 * - Composing and sending messages
 * - Creating thread replies
 * - Managing user mentions
 * - Handling emoji selection
 * - Maintaining input focus based on chat state
 */
@Component({
  selector: 'app-chat-input',
  imports: [PickerComponent, NgClass],
  templateUrl: './chat-input.html',
  styleUrl: './chat-input.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ChatInput {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('pickerContainer') pickerContainer!: ElementRef;
  @ViewChild('emojiButton') emojiButton!: ElementRef;
  @ViewChild('usersContainer') usersContainer!: ElementRef;
  @ViewChild('addUserButton') addUserButton!: ElementRef;

  emojiPickerOpen = false;
  userPickerOpen = false;
  isUsedInThread = input(false);
  userService = inject(UserService);
  authService = inject(AuthService);
  chatStateService = inject(ChatStateService);
  messageService = inject(MessageService);
  dmConversationService = inject(DmConversationService);
  users = toSignal(this.userService.getAllUsersRealtime());
  mentionedUsers: User[] = [];
  selectedUser = this.chatStateService.selectedUser;
  selectedChannel = this.chatStateService.selectedChannel;
  mode = this.chatStateService.mode;
  currentUser = this.chatStateService.currentUser;

  placeholder = computed(() => {
    if (this.isUsedInThread()) {
      return 'Antwort hinzufügen...';
    }
    return this.chatStateService.placeholder();
  });

  /**
   * Automatically focuses the main chat input whenever
   * the active conversation changes.
   */
  focusChatTextareaEffect = effect(() => {
    if (this.isUsedInThread()) return;
    this.mode();
    this.selectedUser();
    this.selectedChannel();
    queueMicrotask(() => {
      this.textarea?.nativeElement.focus();
    });
  });

  /**
   * Automatically focuses the thread input when
   * a thread conversation becomes active.
   */
  focusThreadTextareaEffect = effect(() => {
    if (!this.isUsedInThread()) return;
    const thread = this.chatStateService.selectedThreadMessage();
    if (!thread) return;
    queueMicrotask(() => {
      this.textarea?.nativeElement.focus();
    });
  });

  /**
   * Inserts an emoji into the current message
   * and closes the emoji picker.
   * @param event Selected emoji event.
   */
  addEmoji(event: any) {
    this.textarea.nativeElement.value += event.emoji.native;
    this.emojiPickerOpen = false;
  }

  /**
   * Adds a user mention to the message and stores the mentioned user for notification purposes.
   * @param user Mentioned user.
   */
  addUser(user: User) {
    const textarea = this.textarea.nativeElement;
    textarea.value += `@${user.name}`;
    this.userPickerOpen = false;
    if (!this.mentionedUsers.some((u) => u.id === user.id)) {
      this.mentionedUsers.push(user);
    }
  }

  /**
   * Toggles the emoji picker visibility.
   */
  toggleEmojiPicker() {
    this.emojiPickerOpen = !this.emojiPickerOpen;
  }

  /**
   * Toggles the user mention picker visibility.
   */
  toggleUserPicker() {
    this.userPickerOpen = !this.userPickerOpen;
  }

  /**
   * Closes open pickers when the user clicks
   * outside their boundaries.
   *
   * @param event Click or touch event.
   */
  @HostListener('document:click', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  handleClickOutside(event: Event) {
    const target = event.target as Node;
    if (this.emojiPickerOpen) {
      const insideEmojiPicker = this.pickerContainer?.nativeElement.contains(target);
      const clickedEmojiButton = this.emojiButton?.nativeElement.contains(target);
      if (!insideEmojiPicker && !clickedEmojiButton) {
        this.emojiPickerOpen = false;
      }
    }
    if (this.userPickerOpen) {
      const insideUsers = this.usersContainer?.nativeElement.contains(target);
      const clickedUserButton = this.addUserButton?.nativeElement.contains(target);

      if (!insideUsers && !clickedUserButton) {
        this.userPickerOpen = false;
      }
    }
  }

  /**
   * Determines where a new message should be sent.
   *
   * Depending on the active chat mode, the method
   * resolves the target channel, direct-message
   * conversation or self-chat and returns the
   * corresponding target metadata.
   */
  async getTarget() {
    const mode = this.mode();
    if (mode === 'channel') {
      const channel = this.selectedChannel();
      if (!channel) return null;
      return {
        targetType: 'channel' as const,
        targetId: channel.id,
      };
    }

    if (mode === 'dm') {
      const user = this.selectedUser();
      if (!user) return null;
      const currentUser = this.currentUser();
      if (!currentUser) return null;
      const dm = await this.dmConversationService.getOrCreateDM(currentUser.id, user.id);
      return {
        targetType: 'dm' as const,
        targetId: dm.id,
      };
    }

    if (mode === 'self') {
      const user = this.selectedUser();
      if (!user) return null;
      return {
        targetType: 'self' as const,
        targetId: user.id,
      };
    }

    return null;
  }

  /**
   * Delegates message creation to either the
   * chat or thread message workflow.
   */
  async sendMessage() {
    if (this.isUsedInThread()) {
      return this.sendThreadMessage();
    }
    return this.sendChatMessage();
  }

  /**
   * Creates a new message in the currently
   * active conversation and handles user mentions.
   *
   * After successful creation, the input state
   * and tracked mentions are reset.
   */
  async sendChatMessage() {
    const text = this.textarea.nativeElement.value.trim();
    if (!text) return;
    const currentUser = this.currentUser();
    if (!currentUser) return;
    const target = await this.getTarget();
    if (!target) return;
    await this.messageService.createMessage({
      senderId: currentUser.id,
      text,
      targetType: target.targetType,
      targetId: target.targetId,
      mentionUserIds: this.mentionedUsers.map((user) => user.id),
    });
    this.textarea.nativeElement.value = '';
    this.mentionedUsers = [];
  }

  /**
   * Creates a reply within the currently
   * selected message thread.
   *
   * After successful creation, the input state
   * and tracked mentions are reset.
   */
  async sendThreadMessage() {
    const text = this.textarea.nativeElement.value.trim();
    if (!text) return;
    const currentUser = this.currentUser();
    if (!currentUser) return;
    const selectedMessage = this.chatStateService.selectedThreadMessage();
    if (!selectedMessage) return;
    await this.messageService.createThread({
      parentMessageId: selectedMessage.id,
      text,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatarUrl,
      reactions: [],
    });
    this.textarea.nativeElement.value = '';
    this.mentionedUsers = [];
  }

  /**
   * Sends the current message when Enter is pressed.
   * Shift + Enter inserts a new line instead.
   *
   * @param event Keyboard event.
   */
  onEnter(event: Event) {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
