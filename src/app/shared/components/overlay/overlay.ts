import { Component, output, input, signal } from '@angular/core';
import { Logout } from './logout/logout';
import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { User } from '../../../core/interfaces/user.interface';
import { CreateChannel } from './create-channel/create-channel';
import { ProfileSecondary } from './profile-secondary/profile-secondary';
import { AddMembers } from './add-members/add-members';
import { ChannelDetails } from './channel-details/channel-details';
import { Channel } from '../../../core/interfaces/channel.interface';

@Component({
  selector: 'app-overlay',
  imports: [Logout, Profile, ProfileSecondary, EditProfile, CreateChannel, AddMembers, ChannelDetails],
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
  confirmAddMembers = output<User[]>();
  updateUserName = output<string>();
  addMembers = output<{ name: string; description: string }>();
  view = input<
    | 'profile'
    | 'edit-profile'
    | 'logout'
    | 'create-channel'
    | 'user-profile'
    | 'add-members'
    | 'channel-details'
    | null
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
}
