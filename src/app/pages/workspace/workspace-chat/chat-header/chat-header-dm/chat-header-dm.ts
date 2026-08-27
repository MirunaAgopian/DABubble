import { Component, inject, output } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../../../core/services/auth.service';
import { User } from '../../../../../core/interfaces/user.interface';


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
  openOverlay = output<User>();

  onOpenOverlay(){
    let user: User | null = null;
    if(this.mode() === 'dm'){
      user = this.selectedUser();
    }
    if(this.mode() === 'self'){
      user = this.selectedUser();
    }
    if(user){
      this.openOverlay.emit(user);
    }
  }
}
