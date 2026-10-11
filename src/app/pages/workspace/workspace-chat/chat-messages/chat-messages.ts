import { Component, inject, computed, signal } from '@angular/core';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Message } from '../../../../core/interfaces/message.interface';
import { MessageService } from '../../../../core/services/message.service';
import { Subscription } from 'rxjs';
import { User } from '../../../../core/interfaces/user.interface';
import { UserService } from '../../../../core/services/user.service';
import { DatePipe } from '@angular/common';
import { effect } from '@angular/core';

@Component({
  selector: 'app-chat-messages',
  imports: [DatePipe],
  templateUrl: './chat-messages.html',
  styleUrl: './chat-messages.scss',
})
export class ChatMessages {
  chatStateService = inject(ChatStateService);
  authService = inject(AuthService);
  messageService = inject(MessageService);
  userService = inject(UserService);
  mode = this.chatStateService.mode;
  selectedUser = this.chatStateService.selectedUser;
  selectedChannel = this.chatStateService.selectedChannel;
  currentUserId = computed(() => this.authService.getCurrentUserId());
  messages = signal<Message[]>([]);
  users = signal<User[]>([]);
  private messageSubscription?: Subscription;
  private userSubscription?: Subscription;

  ngOnInit() {
    this.loadUsers();
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
        this.messages.set(messages);
      });
  }

  getUserById(userId: string): User | undefined {
    return this.users().find((user) => user.id === userId);
  }

  loadMessagesEffect = effect(() => {
    const mode = this.mode();
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
        this.loadMessages('dm', user.id);
      }
    }
  });

  ngOnDestroy() {
    this.messageSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }
}
