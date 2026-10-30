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

/**
 * Workspace navigation sidebar responsible for presenting channels, users and chat entry points.
 *
 * Provides access to:
 * - Channel conversations
 * - Direct messages
 * - Self-chat
 * - New message creation
 * - Channel creation workflow
 *
 * Coordinates navigation between channels, direct messages, self-chat and message creation
 * workflows by updating the shared chat state.
 */
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
  isMobile = input();

  /**
   * Returns a sorted user list with the current user displayed first.
   * Guest users are hidden for authenticated users while remaining
   * visible in guest mode.
   */
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

  /**
   * Toggles the expanded state of a collapsible sidebar section.
   *
   * @param section Target section element.
   */
  toggleCollapsible(section: HTMLElement) {
    section.classList.toggle('expanded');
    section.classList.toggle('collapsed');
  }

  /**
   * Opens the channel creation workflow.
   */
  openOverlayClicked() {
    this.openOverlay.emit('create-channel');
  }

  /**
   * Opens a direct message conversation with the selected user.
   *
   * @param user Selected user.
   */
  openDM(user: User) {
    this.chatState.openDM(user);
  }

  /**
   * Opens the current user's personal chat.
   *
   * @param user Current user.
   */
  openSelf(user: User) {
    this.chatState.openSelf(user);
  }

  /**
   * Opens the selected channel conversation.
   *
   * @param channel Selected channel.
   */
  openChannel(channel: Channel) {
    this.chatState.openChannel(channel);
  }

  /**
   * Switches the workspace into new-message mode.
   */
  startNewMessage() {
    this.chatState.startNewMessage();
  }
}
