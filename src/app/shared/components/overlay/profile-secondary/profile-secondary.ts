import { Component, inject, input, output} from '@angular/core';
import { User } from '../../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';
import { ChatStateService } from '../../../../core/services/chat-state.service';

@Component({
  selector: 'app-profile-secondary',
  imports: [NgClass],
  templateUrl: './profile-secondary.html',
  styleUrl: './profile-secondary.scss',
})
export class ProfileSecondary {
  user = input<User | null | undefined>(null);
  close = output();
  chatStateService = inject(ChatStateService)

  onClick(){
    const selectedUser = this.user();
    if(!selectedUser) return;
    this.chatStateService.openDM(selectedUser);
    this.close.emit()
  }
}
