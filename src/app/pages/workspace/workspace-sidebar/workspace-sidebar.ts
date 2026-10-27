import { Component, inject, output, computed, input } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { ChannelService } from '../../../core/services/channel.service';
import { ChatStateService } from '../../../core/services/chat-state.service';
import { User } from '../../../core/interfaces/user.interface';
import { Channel } from '../../../core/interfaces/channel.interface';
import { InputIcon } from '../../../shared/components/input-icon/input-icon';
import { WorkspaceSearch } from '../../../shared/components/workspace-search/workspace-search';

@Component({
  selector: 'app-workspace-sidebar',
  imports: [NgClass, InputIcon, WorkspaceSearch],
  templateUrl: './workspace-sidebar.html',
  styleUrl: './workspace-sidebar.scss',
})
export class WorkspaceSidebar {
  user = input<User | null>();
  userService = inject(UserService);
  users = toSignal(this.userService.getAllUsersRealtime());
  authService = inject(AuthService);
  openOverlay = output<'create-channel'>();
  channelService = inject(ChannelService);
  channels = toSignal(this.channelService.fetchChannels());
  chatState = inject(ChatStateService);
  currentUser = this.chatState.currentUser;

  sortedUsers = computed(() => {
    const users = this.users() ?? [];
    const currentUser = this.currentUser();

    if (!currentUser) return users;

    return [...users]
      .filter((user) => (currentUser.id === 'guest' ? true : user.id !== 'guest'))
      .sort((a, b) => {
        if (a.id === currentUser.id) return -1;
        if (b.id === currentUser.id) return 1;
        return a.name.localeCompare(b.name);
      });
  });

  toggleCollapsible(section: HTMLElement) {
    section.classList.toggle('expanded');
    section.classList.toggle('collapsed');
  }

  openOverlayClicked() {
    this.openOverlay.emit('create-channel');
  }

  openDM(user: User) {
    this.chatState.openDM(user);
  }

  openSelf(user: User) {
    this.chatState.openSelf(user);
  }

  openChannel(channel: Channel) {
    this.chatState.openChannel(channel);
  }

  startNewMessage() {
    this.chatState.startNewMessage();
  }
}
