import {
  Component,
  ViewChild,
  ElementRef,
  ViewEncapsulation,
  HostListener,
  inject,
  output,
} from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { User } from '../../../../core/interfaces/user.interface';
import { ChatStateService } from '../../../../core/services/chat-state.service';

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

  users = toSignal(this.userService.getAllUsersRealtime());
  userAdded = output<User>();
  placeholder = this.chatStateService.placeholder;


  get currentUser() {
    return this.authService.auth.currentUser;
  }

  addEmoji(event: any) {
    this.textarea.nativeElement.value += event.emoji.native;
    this.emojiPickerOpen = false;
  }

  addUser(user: User){
    const textarea = this.textarea.nativeElement;
    textarea.value += `@${user.name}`;
    this.userAdded.emit(user);
    this.userPickerOpen = false;
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
}
