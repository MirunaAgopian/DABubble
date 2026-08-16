import { Component, output, input } from '@angular/core';
import { Logout } from './logout/logout';
import { Profile } from './profile/profile';
import { EditProfile } from './edit-profile/edit-profile';

@Component({
  selector: 'app-overlay',
  imports: [Logout, Profile, EditProfile],
  templateUrl: './overlay.html',
  styleUrl: './overlay.scss',
})
export class Overlay {
  logout = output<void>();
  visible = input<boolean>();
  view = input<'profile' | 'edit-profile' | 'logout' | null>();

  onLogout() {
    this.logout.emit();
  }
}
