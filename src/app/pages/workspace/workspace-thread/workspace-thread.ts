import { Component, output } from '@angular/core';
import { ChatInput } from '../workspace-chat/chat-input/chat-input';

@Component({
  selector: 'app-workspace-thread',
  imports: [ChatInput],
  templateUrl: './workspace-thread.html',
  styleUrl: './workspace-thread.scss',
})
export class WorkspaceThread {
  closeThread = output<void>();

  onCloseClick() {
    this.closeThread.emit();
  }
}
