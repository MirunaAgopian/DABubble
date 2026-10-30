import { Component, output } from '@angular/core';

/**
 * Profile action menu that provides navigation
 * to profile settings and logout functionality.
 */
@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.html',
  styleUrl: './logout.scss',
})
export class Logout {
  clicked = output<void>();
  profile = output<void>();

  /**
   * Emits a logout request.
   */
  onClick() {
    this.clicked.emit();
  }

  /**
   * Opens the profile view.
   */
  onProfileClick() {
    this.profile.emit();
  }
}
