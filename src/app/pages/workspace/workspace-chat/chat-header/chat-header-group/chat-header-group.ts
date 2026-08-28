import { Component, computed, inject } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { UserService } from '../../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChannelService } from '../../../../../core/services/channel.service';

@Component({
  selector: 'app-chat-header-group',
  imports: [],
  templateUrl: './chat-header-group.html',
  styleUrl: './chat-header-group.scss',
})
export class ChatHeaderGroup {
  chatStateService = inject(ChatStateService);
  userService = inject(UserService);
  selectedChannel = this.chatStateService.selectedChannel;
  allUsers = toSignal(this.userService.getAllUsersRealtime(), { initialValue: [] });

  channelUsers = computed(() => {
    const channel = this.selectedChannel();
    const users = this.allUsers();

    if (!channel) return [];
    return users.filter((u) => channel.members.includes(u.id));
  });
}
