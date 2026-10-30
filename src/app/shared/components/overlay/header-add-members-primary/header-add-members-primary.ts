import { Component, computed, inject, output } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChatStateService } from '../../../../core/services/chat-state.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../../core/interfaces/user.interface';

/**
 * Displays the members of the currently selected channel.
 *
 * Allows users to:
 * - View channel members
 * - Open member profiles
 * - Start the add-member workflow
 */
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
  openAddMembersSecondary = output<void>();
  openUserProfile = output<User>();

  /**
   * Returns all users that belong to the
   * currently selected channel.
   */
  channelUsers = computed(() => {
    const channel = this.selectedChannel();
    const users = this.allUsers();
    if (!channel) return;
    return users?.filter((u) => channel.members.includes(u.id));
  });

  onClose() {
    this.close.emit();
  }

  /**
   * Opens the channel member management workflow.
   */
  onAddMembers() {
    this.openAddMembersSecondary.emit();
  }

  /**
   * Opens the profile view for a channel member.
   * @param user Selected channel member.
   */
  openUserProfileOverlay(user: User) {
    this.openUserProfile.emit(user);
  }
}
