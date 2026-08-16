import { Component, output, input } from '@angular/core';
import { Logout } from './logout/logout';
import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';
import { User } from '../../../core/interfaces/user.interface';

@Component({
  selector: 'app-overlay',
  imports: [Logout, Profile, EditProfile],
  templateUrl: './overlay.html',
  styleUrl: './overlay.scss',
  host: {
    '(click)': 'onBackgroundClick()',
  },
})
export class Overlay {
  logout = output<void>();
  visible = input<boolean>();
  view = input<'profile' | 'edit-profile' | 'logout' | null>();
  close = output<void>();
  switchView = output<'profile' | 'edit-profile' | 'logout'>();
  user = input<User| null>();

  onLogout() {
    this.logout.emit();
  }

  onBackgroundClick() {
    this.close.emit();
  }

  onProfile() {
    this.switchView.emit('profile');
  }

  onEdit(){
    this.switchView.emit('edit-profile');
  }
}
