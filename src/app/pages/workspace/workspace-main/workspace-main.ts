import { Component, inject } from '@angular/core';
import { WorkspaceHeader } from '../../../shared/components/workspace-header/workspace-header';
import { WorkspaceChat } from '../workspace-chat/workspace-chat';
import { WorkspaceSidebar } from '../workspace-sidebar/workspace-sidebar';
import { WorkspaceThread } from '../workspace-thread/workspace-thread';
import { InAppPresenceService } from '../../../core/services/in-app-presence.service';

@Component({
  selector: 'app-workspace-main',
  imports: [WorkspaceHeader, WorkspaceChat, WorkspaceSidebar, WorkspaceThread],
  templateUrl: './workspace-main.html',
  styleUrl: './workspace-main.scss',
})
export class WorkspaceMain {
  inAppPresenceService = inject(InAppPresenceService);

  ngOnInit() {
    this.inAppPresenceService.startInactivityTimer();
  }
}
