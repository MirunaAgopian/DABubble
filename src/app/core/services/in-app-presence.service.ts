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
  private currentStatus: 'online' | 'away' | null = null;

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

  private updateStatus(status: 'online' | 'away') {
    if (this.currentStatus === status) {
      return;
    }

    this.currentStatus = status;

    const user = this.authService.auth.currentUser;

    if (!user) {
      return;
    }

    console.log('Updating status:', status);

    this.userService.updateStatus(user.uid, status);
  }
}
