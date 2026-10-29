import { Component, output, input, } from '@angular/core';
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

  onLogout() {
    this.logout.emit();
  }

  onBackgroundClick() {
    this.close.emit();
  }

  onProfile() {
    this.switchView.emit('profile');
  }

  onEdit() {
    this.switchView.emit('edit-profile');
  }

  onSaveUserName(event: string) {
    this.updateUserName.emit(event);
  }

  onConfirmAddMembers(selectedUsers: User[]) {
    this.confirmAddMembers.emit(selectedUsers);
  }

  onAddMembers(data: { name: string; description: string }) {
    this.addMembers.emit(data);
  }

  onOpenUserProfile(user: User) {
    this.selectedUser.emit(user);
    this.changeView.emit('user-profile');
  }
}
