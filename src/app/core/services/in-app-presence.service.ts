import { Injectable, inject } from '@angular/core';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class InAppPresenceService {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private timeout: any;

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

  updateStatus(status: 'online' | 'away') {
    const user = this.authService.auth.currentUser;
    if (!user) return;
    this.userService.updateStatus(user.uid, status);
  }
}
