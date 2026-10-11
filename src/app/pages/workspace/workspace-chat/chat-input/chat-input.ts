import {
  Component,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  HostListener,
  inject,
} from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { User } from '../../../../core/interfaces/user.interface';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { MessageService } from '../../../../core/services/message.service';

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

  userService = inject(UserService);
  authService = inject(AuthService);
  chatStateService = inject(ChatStateService);
  messageService = inject(MessageService);

  users = toSignal(this.userService.getAllUsersRealtime());
  placeholder = this.chatStateService.placeholder;
  mentionedUsers: User[] = [];
  selectedUser = this.chatStateService.selectedUser;
  selectedChannel = this.chatStateService.selectedChannel;
  mode = this.chatStateService.mode;
  currentUser = this.chatStateService.currentUser;

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

  async sendMessage() {
    const text = this.textarea.nativeElement.value.trim();

    if (!text) return;

    const currentUser = this.currentUser();

    if (!currentUser) return;

    const mode = this.mode();

    let targetType: 'dm' | 'channel' | 'self';
    let targetId: string;

    if (mode === 'channel') {
      const channel = this.selectedChannel();

      if (!channel) return;

      targetType = 'channel';
      targetId = channel.id;
    } else if (mode === 'dm') {
      const user = this.selectedUser();

      if (!user) return;

      targetType = 'dm';
      targetId = user.id;
    } else if (mode === 'self') {
      const user = this.selectedUser();

      if (!user) return;

      targetType = 'self';
      targetId = user.id;
    } else {
      return;
    }

    await this.messageService.createMessage({
      senderId: currentUser.id,
      text,
      targetType,
      targetId,
      mentionUserIds: this.mentionedUsers.map((user) => user.id),
    });

    this.textarea.nativeElement.value = '';
    this.mentionedUsers = [];
  }
}
