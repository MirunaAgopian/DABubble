import { Component, computed, inject, output } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { UserService } from '../../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Channel } from '../../../../../core/interfaces/channel.interface';

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
  openOverlay = output<string>();
  openChannelDetails = output<Channel | null>();

  channelUsers = computed(() => {
    const channel = this.selectedChannel();
    const users = this.allUsers();

    if (!channel) return [];
    return users.filter((u) => channel.members.includes(u.id));
  });

  visibleUsers = computed(() => {
    const users = this.channelUsers();
    return users.slice(0, 3);
  });

  extraUserCount = computed(() => {
    const users = this.channelUsers();
    return users.length > 3 ? users.length - 3 : 0;
  });

  onOpenOverlay(){
    this.openOverlay.emit('channel-details');
    this.openChannelDetails.emit(this.selectedChannel());
  }
}
