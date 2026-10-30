import { Component, output, input } from '@angular/core';
import { Logout } from './logout/logout';
import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { User } from '../../../core/interfaces/user.interface';
import { CreateChannel } from './create-channel/create-channel';
import { ProfileSecondary } from './profile-secondary/profile-secondary';
import { AddMembers } from './add-members/add-members';
import { ChannelDetails } from './channel-details/channel-details';
import { Channel } from '../../../core/interfaces/channel.interface';
import { HeaderAddMembersPrimary } from './header-add-members-primary/header-add-members-primary';
import { HeaderAddMembersSecondary } from './header-add-members-secondary/header-add-members-secondary';
import { log } from 'firebase/firestore/pipelines';
import { OverlayView } from '../../../core/interfaces/overlay-trigger.interface';

/**
 * Centralized overlay manager responsible for rendering
 * modal and popover-based workflows throughout the application.
 *
 * Dynamically switches between multiple overlay views such as:
 * - User profiles
 * - Profile editing
 * - Channel creation
 * - Member management
 * - Channel details
 * - Logout confirmation
 *
 * Acts as the single entry point for all overlay interactions
 * and coordinates communication between overlay views and the
 * workspace state.
 */
@Component({
  selector: 'app-overlay',
  imports: [
    Logout,
    Profile,
    ProfileSecondary,
    EditProfile,
    CreateChannel,
    AddMembers,
    ChannelDetails,
    HeaderAddMembersPrimary,
    HeaderAddMembersSecondary,
  ],
  templateUrl: './overlay.html',
  styleUrl: './overlay.scss',
  host: {
    '(click)': 'onBackgroundClick()',
  },
})
export class Overlay {
  logout = output<void>();
  visible = input<boolean>();
  close = output<void>();
  switchView = output<'profile' | 'edit-profile' | 'logout'>();
  user = input<User | null>();
  overlayUser = input<User | null>();
  overlayChannel = input<Channel | null>();
  selectedUser = output<User>();
  confirmAddMembers = output<User[]>();
  updateUserName = output<string>();
  addMembers = output<{ name: string; description: string }>();
  view = input<OverlayView | null>(null);
  anchor = input<DOMRect | null>(null);
  changeView = output<
    'header-add-members-primary' | 'header-add-members-secondary' | 'user-profile'
  >();

  /**
   * Emits a logout request.
   */
  onLogout() {
    this.logout.emit();
  }

  /**
   * Closes the overlay when the background
   * area is clicked.
   */
  onBackgroundClick() {
    this.close.emit();
  }

  /**
   * Switches to the profile view.
   * Controls the overlay related to the workspace-header
   */
  onProfile() {
    this.switchView.emit('profile');
  }

  /**
   * Switches to the profile editing view.
   * Controls the overlay related to the workspace-header
   */
  onEdit() {
    this.switchView.emit('edit-profile');
  }

  /**
   * Emits an updated username.
   * Controls the overlay related to the workspace-header
   * @param event Updated username.
   */
  onSaveUserName(event: string) {
    this.updateUserName.emit(event);
  }

  /**
   * Emits the selected users from the member selection workflow.
   * Controls the overlay retaled to creating a new channel
   * @param selectedUsers Selected members for a channel.
   */
  onConfirmAddMembers(selectedUsers: User[]) {
    this.confirmAddMembers.emit(selectedUsers);
  }

  /**
   * Emits channel information collected during the channel creation workflow.
   * @param data Channel configuration.
   */
  onAddMembers(data: { name: string; description: string }) {
    this.addMembers.emit(data);
  }

  /**
   * Opens the user profile workflow for the selected user.
   *Controls the overlay retaled to seeing an user profile from the chat-header of a direct-message
   *or in is triggered in a chat/thread message, bu clicking on user names
   * @param user Selected user.
   */
  onOpenUserProfile(user: User) {
    this.selectedUser.emit(user);
    this.changeView.emit('user-profile');
  }
}
