import { Component } from '@angular/core';
import { Header } from '../../../shared/components/header/header';
import { WorkspaceHeader } from '../../../shared/components/workspace-header/workspace-header';
import { WorkspaceChat } from '../workspace-chat/workspace-chat';
import { WorkspaceSidebar } from '../workspace-sidebar/workspace-sidebar';
import { WorkspaceThread } from '../workspace-thread/workspace-thread';

@Component({
  selector: 'app-workspace-main',
  imports: [WorkspaceHeader, WorkspaceChat, WorkspaceSidebar, WorkspaceThread],
  templateUrl: './workspace-main.html',
  styleUrl: './workspace-main.scss',
})
export class WorkspaceMain {}
