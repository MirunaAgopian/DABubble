import { Component, computed, inject, output } from '@angular/core';
import { ChatStateService } from '../../../../../core/services/chat-state.service';
import { UserService } from '../../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Channel } from '../../../../../core/interfaces/channel.interface';
import { log } from 'firebase/firestore/pipelines';
import { OverlayTrigger } from '../../../../../core/interfaces/overlay-trigger.interface';

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
  openOverlay = output<OverlayTrigger>();
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

  onOpenOverlay(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.openOverlay.emit({
      view: 'channel-details',
      anchor: rect,
    });
    this.openChannelDetails.emit(this.selectedChannel());
  }

  onOpenHeaderAddMembersPrimary(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.openOverlay.emit({
      view: 'header-add-members-primary',
      anchor: rect,
    });
  }

  onOpenHeaderAddMembersSecondary(event: MouseEvent) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.openOverlay.emit({
      view: 'header-add-members-secondary',
      anchor: rect,
    });
  }
}
