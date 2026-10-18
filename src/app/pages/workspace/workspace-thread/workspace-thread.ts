import { Component, inject, output, input, effect, signal } from '@angular/core';
import { ChatInput } from '../workspace-chat/chat-input/chat-input';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { Thread } from '../../../core/interfaces/thread.interface';
import { MessageService } from '../../../core/services/message.service';
import { DatePipe } from '@angular/common';
import { User } from '../../../core/interfaces/user.interface';
import { UserService } from '../../../core/services/user.service';
import { Subscription } from 'rxjs';
import { Reaction } from '../../../core/interfaces/reaction.interface';

@Component({
  selector: 'app-workspace-thread',
  imports: [ChatInput, DatePipe],
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
  selectedMessage = this.chatStateService.selectedThreadMessage;
  private userSubscription?: Subscription;

  ngOnInit(){
    this.loadUsers();
  }

  loadThreads(messageId: string) {
    this.messageService.getThreadsByMessageId(messageId).subscribe((threads) => {
      this.threads = threads;
    });
  }

  loadUsers() {
    this.userSubscription?.unsubscribe();
    this.userSubscription = this.userService.getAllUsersRealtime().subscribe((users) => {
      this.users.set(users);
    });
  }

  threadEffect = effect(() => {
    const message = this.selectedMessage();
    if (message) {
      this.loadThreads(message.id);
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

  onCloseClick() {
    this.closeThread.emit();
    this.chatStateService.selectedThreadMessage.set(null);
  }
}

// implement getAdditionalReactionCount(reaction: Reaction): number {
  //   return Math.max(reaction.userIds.length - 1, 0);
  // } on workspace-thrad

  // also add the emoji-picker on the workspace-thread

  //also implement the edit-view on thread!

  //then implement send reply inside thread
  //then implement 'nr of answers' inside chat-messages.html