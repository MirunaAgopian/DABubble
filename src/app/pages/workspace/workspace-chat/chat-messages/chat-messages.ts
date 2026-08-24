import { Component, inject, computed } from '@angular/core';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { AuthService } from '../../../../core/services/auth.service';



@Component({
  selector: 'app-chat-messages',
  imports: [],
  templateUrl: './chat-messages.html',
  styleUrl: './chat-messages.scss',
})
export class ChatMessages {
  chatStateService = inject(ChatStateService);
  authService = inject(AuthService);

  mode = this.chatStateService.mode;
  selectedUser = this.chatStateService.selectedUser;
  selectedChannel = this.chatStateService.selectedChannel;
  currentUserId = computed(()=> this.authService.getCurrentUserId());
}
