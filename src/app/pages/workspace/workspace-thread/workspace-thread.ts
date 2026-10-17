import { Component, inject, output, input, effect } from '@angular/core';
import { ChatInput } from '../workspace-chat/chat-input/chat-input';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { Thread } from '../../../core/interfaces/thread.interface';
import { MessageService } from '../../../core/services/message.service';

@Component({
  selector: 'app-workspace-thread',
  imports: [ChatInput],
  templateUrl: './workspace-thread.html',
  styleUrl: './workspace-thread.scss',
})
export class WorkspaceThread {
  chatStateService = inject(ChatStateService);
  messageService = inject(MessageService);
  closeThread = output<void>();
  threads: Thread[] = [];
  selectedMessage = this.chatStateService.selectedThreadMessage;

  loadThreads(messageId: string) {
    this.messageService.getThreadsByMessageId(messageId).subscribe((threads) => {
      this.threads = threads;
    });
  }

  threadEffect = effect(() => {
    const message = this.selectedMessage();
    if (message) {
      this.loadThreads(message.id);
    }
  });

  onCloseClick() {
    this.closeThread.emit();
  }
}
