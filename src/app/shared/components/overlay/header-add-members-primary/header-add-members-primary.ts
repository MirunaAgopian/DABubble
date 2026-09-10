import { Component, computed, inject, output } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-add-members-primary',
  imports: [CommonModule],
  templateUrl: './header-add-members-primary.html',
  styleUrl: './header-add-members-primary.scss',
})
export class HeaderAddMembersPrimary {
  userService = inject(UserService);
  chatStateService = inject(ChatStateService);
  allUsers = toSignal(this.userService.getAllUsersRealtime());
  selectedChannel = this.chatStateService.selectedChannel;
  close = output<void>();

  channelUsers = computed(() => {
    const channel = this.selectedChannel();
    const users = this.allUsers();

    if(!channel) return;
    return users?.filter((u) => channel.members.includes(u.id));
  });

  onClose(){
    this.close.emit();
  }
}
