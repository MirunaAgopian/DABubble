import { Component, output, input, signal } from '@angular/core';
import { Logout } from './logout/logout';
import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { User } from '../../../core/interfaces/user.interface';
import { CreateChannel } from './create-channel/create-channel';
import { ProfileSecondary } from './profile-secondary/profile-secondary';

@Component({
  selector: 'app-overlay',
  imports: [Logout, Profile, ProfileSecondary, EditProfile, CreateChannel],
  templateUrl: './overlay.html',
  styleUrl: './overlay.scss',
  host: {
    '(click)': 'onBackgroundClick()',
  },
})
export class Overlay {
  logout = output<void>();
  visible = input<boolean>();
  view = input<'profile' | 'edit-profile' | 'logout' | 'create-channel' | 'user-profile' | null>();
  close = output<void>();
  switchView = output<'profile' | 'edit-profile' | 'logout'>();
  user = input<User | null>();
  // overlayUser = signal<User | null>(null);
  overlayUser = input<User | null>();

  updateUserName = output<string>();

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
}
