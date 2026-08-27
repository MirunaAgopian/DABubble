import { Component, inject } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';


@Component({
  selector: 'app-chat-header-dm',
  imports: [NgClass],
  templateUrl: './chat-header-dm.html',
  styleUrl: './chat-header-dm.scss',
})
export class ChatHeaderDm {
  chatStateService = inject(ChatStateService);
  authService = inject(AuthService);
  selectedUser = this.chatStateService.selectedUser;
  mode = this.chatStateService.mode;
  currentUser = this.authService.getCurrentUserId();
}
