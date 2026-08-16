import { ChangeDetectorRef, Component, inject, output } from '@angular/core';
import { InputIcon } from '../input-icon/input-icon';
import { onAuthStateChanged } from 'firebase/auth';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/interfaces/user.interface';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-workspace-header',
  imports: [InputIcon, NgClass],
  templateUrl: './workspace-header.html',
  styleUrl: './workspace-header.scss',
})
export class WorkspaceHeader {
  userService = inject(UserService);
  authService = inject(AuthService);
  cdr = inject(ChangeDetectorRef);
  openOverlay = output<'profile' | 'edit-profile' | 'logout'>();

  currentUser: User | null = null;
  guestUser: User = {
    id: 'guest',
    name: 'Gast',
    email: 'guest@da-bubble.de',
    avatarUrl: '/assets/img/avatars/default_user.png',
    provider: 'password',
    createdAt: Date.now(),
    lastActive: Date.now(),
    status: 'online',
  };

  ngOnInit() {
    onAuthStateChanged(this.authService.auth, async (user) => {
      if (user) {
        const data = await this.userService.getUser(user.uid);
        this.currentUser = data as User;
      } else {
        this.currentUser = this.guestUser;
      }
      this.cdr.detectChanges();
    });
  }
}
