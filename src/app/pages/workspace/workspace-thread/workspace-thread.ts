import {
  Component,
  inject,
  output,
  effect,
  signal,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
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

@Component({
  selector: 'app-workspace-thread',
  imports: [ChatInput, DatePipe, FormsModule, NgClass],
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
  editingMessageId: string | null = null;
  editedText = '';
  editingSelectedMessage = false;
  private cdr = inject(ChangeDetectorRef);
  @ViewChild('messagesContainer')
  messagesContainer!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.loadUsers();
  }

  ngOnDestroy() {
    this.threadSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  loadThreads(messageId: string) {
    this.threadSubscription?.unsubscribe();
    this.threadSubscription = this.messageService
      .getThreadsByMessageId(messageId)
      .subscribe((threads) => {
        this.threads = threads;
        this.cdr.detectChanges();
         this.scrollToBottom();
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
}

// implement getAdditionalReactionCount(reaction: Reaction): number {
//   return Math.max(reaction.userIds.length - 1, 0);
// } on workspace-thrad

// also add the emoji-picker on the workspace-thread

//also TEST implement the edit-view on thread!
