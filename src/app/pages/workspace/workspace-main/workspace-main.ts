import { Component, inject, ChangeDetectorRef} from '@angular/core';
import { WorkspaceHeader } from '../../../shared/components/workspace-header/workspace-header';
import { WorkspaceChat } from '../workspace-chat/workspace-chat';
import { WorkspaceSidebar } from '../workspace-sidebar/workspace-sidebar';
import { WorkspaceThread } from '../workspace-thread/workspace-thread';
import { InAppPresenceService } from '../../../core/services/in-app-presence.service';
import { Overlay } from '../../../shared/components/overlay/overlay';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { onAuthStateChanged } from 'firebase/auth';
import { User } from '../../../core/interfaces/user.interface';


@Component({
  selector: 'app-workspace-main',
  imports: [WorkspaceHeader, WorkspaceChat, WorkspaceSidebar, WorkspaceThread, Overlay],
  templateUrl: './workspace-main.html',
  styleUrl: './workspace-main.scss',
})
export class WorkspaceMain {
  authService = inject(AuthService);
  router = inject(Router);
  inAppPresenceService = inject(InAppPresenceService);
  isOverlayOpen = false;
  overlayView: 'profile' | 'edit-profile' | 'logout' | null = null;

  userService = inject(UserService);
  cdr = inject(ChangeDetectorRef);


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
    this.inAppPresenceService.startInactivityTimer();
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



  handleLogout() {
    this.authService.logoutUser();
    this.router.navigate(['sign-in']);
  }

  openOverlay(view: 'profile' | 'edit-profile' | 'logout') {
    this.overlayView = view;
    this.isOverlayOpen = true;
  }

  closeOverlay() {
    this.isOverlayOpen = false;
  }

  onSwitchView(view: 'profile' | 'edit-profile' | 'logout') {
  this.overlayView = view;
}

}
