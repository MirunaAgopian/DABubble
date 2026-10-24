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

  focusChatTextareaEffect = effect(() => {
    if (this.isUsedInThread()) return;
    this.mode();
    this.selectedUser();
    this.selectedChannel();
    queueMicrotask(() => {
      this.textarea?.nativeElement.focus();
    });
  });

  focusThreadTextareaEffect = effect(() => {
    if (!this.isUsedInThread()) return;
    const thread = this.chatStateService.selectedThreadMessage();
    if (!thread) return;
    queueMicrotask(() => {
      this.textarea?.nativeElement.focus();
    });
  });

  addEmoji(event: any) {
    this.textarea.nativeElement.value += event.emoji.native;
    this.emojiPickerOpen = false;
  }

  addUser(user: User) {
    const textarea = this.textarea.nativeElement;
    textarea.value += `@${user.name}`;
    this.userPickerOpen = false;
    if (!this.mentionedUsers.some((u) => u.id === user.id)) {
      this.mentionedUsers.push(user);
    }
  }

  toggleEmojiPicker() {
    this.emojiPickerOpen = !this.emojiPickerOpen;
  }

  toggleUserPicker() {
    this.userPickerOpen = !this.userPickerOpen;
  }

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

  async sendMessage() {
    if (this.isUsedInThread()) {
      return this.sendThreadMessage();
    }
    return this.sendChatMessage();
  }

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

  onEnter(event: Event) {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
