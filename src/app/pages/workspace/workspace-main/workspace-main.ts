import { Component, inject, input } from '@angular/core';
import { WorkspaceHeader } from '../../../shared/components/workspace-header/workspace-header';
import { WorkspaceChat } from '../workspace-chat/workspace-chat';
import { WorkspaceSidebar } from '../workspace-sidebar/workspace-sidebar';
import { WorkspaceThread } from '../workspace-thread/workspace-thread';
import { InAppPresenceService } from '../../../core/services/in-app-presence.service';
import { Overlay } from '../../../shared/components/overlay/overlay';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

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
  

  ngOnInit() {
    this.inAppPresenceService.startInactivityTimer();
  }

  handleLogout(){
    this.authService.logoutUser();
    this.router.navigate(['sign-in']);
  }
}
