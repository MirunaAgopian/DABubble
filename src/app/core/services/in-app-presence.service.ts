import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

/**
 * Tracks user activity and updates the logged-in user's online status.
 */
@Injectable({
  providedIn: 'root',
})
export class InAppPresenceService {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private timeout: any;
  private currentStatus: 'online' | 'away' | null = null;

  /**
   * Starts monitoring user activity within the application.
   * Changes the user status to "away" after a period of inactivity.
   */
  startInactivityTimer() {
    const resetTimer = () => {
      clearTimeout(this.timeout);
      this.updateStatus('online');
      this.timeout = setTimeout(
        () => {
          this.updateStatus('away');
        },
        3 * 60 * 1000,
      );
    };
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();
  }

  /**
   * Updates the user's presence status
   * and synchronizes it with Firestore.
   *
   * Prevents unnecessary updates when
   * the status has not changed.
   */
  private updateStatus(status: 'online' | 'away') {
    if (this.currentStatus === status) {
      return;
    }
    this.currentStatus = status;
    const user = this.authService.auth.currentUser;
    if (!user) {
      return;
    }
    this.userService.updateStatus(user.uid, status);
  }
}
